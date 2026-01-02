// MediaWiki API service using vanilla Node.js (no new dependencies)
// Uses built-in fetch (Node 18+) or can use existing fetch patterns

const MEDIAWIKI_API_URL = process.env.MEDIAWIKI_API_URL;
const MEDIAWIKI_USERNAME = process.env.MEDIAWIKI_USERNAME;
const MEDIAWIKI_PASSWORD = process.env.MEDIAWIKI_PASSWORD;
const WIKI_ENABLED = process.env.MEDIAWIKI_ENABLED === 'true';

/**
 * Check if credentials are in bot password format (username@botname)
 */
function isBotPassword(username) {
  return username && username.includes('@');
}

/**
 * Create HTTP Basic Auth header
 */
function createBasicAuthHeader(username, password) {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Get CSRF token for MediaWiki API
 * @param {string} cookies - Optional session cookies from login
 * @param {object} additionalHeaders - Optional additional headers (e.g., Authorization)
 */
async function getCSRFToken(cookies = null, additionalHeaders = {}) {
  try {
    const headers = {
      'User-Agent': 'UNICEF-World-Builder/1.0',
      ...additionalHeaders
    };
    
    // Include cookies if we have them from login (but not if it's the bot password marker)
    if (cookies && cookies !== 'BOT_PASSWORD_AUTH') {
      headers['Cookie'] = cookies;
    }
    
    const response = await fetch(
      `${MEDIAWIKI_API_URL}?action=query&meta=tokens&type=csrf&format=json`,
      {
        method: 'GET',
        headers: headers
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API error: ${data.error.info || data.error.code}`);
    }
    
    return data.query.tokens.csrftoken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
}

/**
 * Login to MediaWiki and get session cookies
 * Returns cookie string for use in subsequent requests
 * Supports both regular accounts and bot passwords
 */
async function loginToWiki() {
  try {
    const isBot = isBotPassword(MEDIAWIKI_USERNAME);
    
    // First, get login token
    const tokenHeaders = {
      'User-Agent': 'UNICEF-World-Builder/1.0'
    };
    
    // For bot passwords, we may need Basic Auth even for getting the login token
    if (isBot) {
      tokenHeaders['Authorization'] = createBasicAuthHeader(MEDIAWIKI_USERNAME, MEDIAWIKI_PASSWORD);
    }
    
    const tokenResponse = await fetch(
      `${MEDIAWIKI_API_URL}?action=query&meta=tokens&type=login&format=json`,
      {
        method: 'GET',
        headers: tokenHeaders
      }
    );
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Failed to get login token: ${tokenData.error.info || tokenData.error.code}`);
    }
    
    const loginToken = tokenData.query.tokens.logintoken;
    
    // Perform login
    const loginParams = new URLSearchParams({
      action: 'login',
      lgname: MEDIAWIKI_USERNAME,
      lgpassword: MEDIAWIKI_PASSWORD,
      lgtoken: loginToken,
      format: 'json'
    });
    
    // Prepare login request headers
    const loginHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'UNICEF-World-Builder/1.0'
    };
    
    // For bot passwords, add HTTP Basic Auth to the login request
    if (isBot) {
      loginHeaders['Authorization'] = createBasicAuthHeader(MEDIAWIKI_USERNAME, MEDIAWIKI_PASSWORD);
    }
    
    const loginResponse = await fetch(MEDIAWIKI_API_URL, {
      method: 'POST',
      headers: loginHeaders,
      body: loginParams.toString()
    });
    
    const loginData = await loginResponse.json();
    
    // Log the full response for debugging
    if (loginData.login && loginData.login.result !== 'Success') {
      console.log('Login response details:', JSON.stringify(loginData.login, null, 2));
    }
    
    if (loginData.error) {
      throw new Error(`Login error: ${loginData.error.info || loginData.error.code}`);
    }
    
    if (loginData.login.result !== 'Success') {
      // Provide more detailed error information
      const errorReason = loginData.login.reason || loginData.login.result;
      throw new Error(`Login failed: ${errorReason}`);
    }
    
    // Extract cookies for subsequent requests
    // MediaWiki sets cookies in Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      // For bot passwords, cookies might not be set, but that's okay
      // Bot passwords can work with just HTTP Basic Auth
      if (isBot) {
        console.log('Bot password login successful (no cookies needed for bot passwords)');
        return 'BOT_PASSWORD_AUTH'; // Special marker for bot password auth
      }
      return null;
    }
    
    // Parse cookies - extract the session cookie
    // Format is typically: "cookie_name=value; Path=/; HttpOnly"
    const cookies = setCookieHeader.split(',').map(c => c.split(';')[0].trim()).join('; ');
    console.log('Login successful, using session cookies');
    return cookies;
  } catch (error) {
    console.error('Error logging into wiki:', error);
    throw error;
  }
}

/**
 * Escape special characters for wikitext (for metadata fields)
 * This prevents wikitext injection in titles and metadata
 */
function escapeWikitext(text) {
  if (!text) return '';
  return String(text)
    .replace(/\|/g, '{{!}}')
    .replace(/\{/g, '{{')
    .replace(/\}/g, '}}')
    .replace(/\[\[/g, '&#91;&#91;')
    .replace(/\]\]/g, '&#93;&#93;');
}

/**
 * Format scenario text for wikitext
 * Preserves readability while handling special characters
 */
function formatScenarioText(scenario) {
  if (!scenario) return '';
  
  // Convert scenario text to wikitext format
  // MediaWiki uses double newlines for paragraphs
  // Preserve the text but ensure proper paragraph breaks
  let formatted = String(scenario);
  
  // Ensure paragraphs are separated by double newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Escape any intentional wikitext that might break formatting
  // But preserve the narrative structure
  return formatted;
}

/**
 * Format scenario content as wikitext
 */
function formatScenarioAsWikitext(scenarioData) {
  const { region, timeFrame, learnerAge, scenario, scenarioTitle, useExistingScenario, customDirection } = scenarioData;
  
  const timestamp = new Date().toISOString();
  const approach = useExistingScenario ? 'Young Visionaries Research' : 'Fresh Scenario';
  const ageLabel = learnerAge ? `${learnerAge} years old` : 'Not specified';
  
  // Escape metadata fields to prevent wikitext injection
  const safeRegion = escapeWikitext(region);
  const safeTimeFrame = escapeWikitext(timeFrame);
  const safeAgeLabel = escapeWikitext(ageLabel);
  const safeApproach = escapeWikitext(approach);
  const safeCustomDirection = customDirection ? escapeWikitext(customDirection) : '';
  const safeTitle = scenarioTitle ? escapeWikitext(scenarioTitle) : '';
  
  // Format scenario text (preserve readability, handle line breaks)
  const formattedScenario = formatScenarioText(scenario);
  
  // Use the title as the main heading if available
  const mainHeading = safeTitle || `Education Scenario: ${safeRegion}, ${safeTimeFrame}`;
  
  return `== ${mainHeading} ==

'''Generated:''' ${timestamp}
'''Region:''' ${safeRegion}
'''Time Frame:''' ${safeTimeFrame}
'''Learner Age:''' ${safeAgeLabel}
'''Approach:''' ${safeApproach}
${safeCustomDirection ? `'''Custom Direction:''' ${safeCustomDirection}\n` : ''}

=== Scenario ===
${formattedScenario}

=== Metadata ===
* '''Region:''' ${safeRegion}
* '''Time Frame:''' ${safeTimeFrame}
* '''Age Group:''' ${safeAgeLabel}
* '''Approach:''' ${safeApproach}
* '''Generated:''' ${timestamp}

[[Category:Education Scenarios]]
[[Category:${safeRegion} Scenarios]]
[[Category:${safeTimeFrame} Scenarios]]
`;
}

/**
 * Extract scenario name from full title
 * Title format: "Region, Year, Age X, Scenario Name"
 */
function extractScenarioName(fullTitle) {
  if (!fullTitle) return null;
  
  // Match pattern: "Region, Year, Age X, Scenario Name"
  const match = fullTitle.match(/,\s*Age\s*\d+,\s*(.+)$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback: try to extract after the last comma if pattern doesn't match
  const parts = fullTitle.split(',').map(p => p.trim());
  if (parts.length >= 4) {
    return parts.slice(3).join(', '); // Get everything after "Region, Year, Age X"
  }
  
  return null;
}

/**
 * Generate page title based on scenario data
 * Format: Scenario_World_Builder/[Region]/[TimeFrame]/Age[age]_[ScenarioName]
 * MediaWiki page titles have restrictions: max 255 bytes, no certain characters
 */
function generatePageTitle(scenarioData) {
  const { region, timeFrame, learnerAge, scenarioTitle } = scenarioData;
  const cleanRegion = region.replace(/\s+/g, '_').replace(/[<>[\]{}|]/g, '');
  
  // Extract scenario name from the title if available
  if (scenarioTitle) {
    const scenarioName = extractScenarioName(scenarioTitle);
    
    if (scenarioName) {
      // Clean the scenario name for MediaWiki (replace spaces with underscores, remove special chars)
      const cleanScenarioName = scenarioName
        .replace(/[<>[\]{}|#]/g, '') // Remove MediaWiki special chars
        .replace(/\s+/g, '_')
        .replace(/[^\w_-]/g, ''); // Remove any remaining non-word chars except _ and -
      
      const agePart = learnerAge ? `Age${learnerAge}` : 'Age';
      let title = `Scenario_World_Builder/${cleanRegion}/${timeFrame}/${agePart}_${cleanScenarioName}`;
      
      // Ensure title doesn't exceed MediaWiki limits (255 bytes)
      const maxBytes = 255;
      if (Buffer.byteLength(title, 'utf8') > maxBytes) {
        // Truncate the scenario name part if needed
        let truncatedName = cleanScenarioName;
        const baseLength = Buffer.byteLength(`Scenario_World_Builder/${cleanRegion}/${timeFrame}/${agePart}_`, 'utf8');
        const maxNameLength = maxBytes - baseLength - 10; // Leave some buffer
        
        while (Buffer.byteLength(truncatedName, 'utf8') > maxNameLength && truncatedName.length > 0) {
          truncatedName = truncatedName.slice(0, -1);
        }
        
        title = `Scenario_World_Builder/${cleanRegion}/${timeFrame}/${agePart}_${truncatedName}`;
      }
      
      return title;
    }
  }
  
  // Fallback to old format if no title or scenario name extracted
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const agePart = learnerAge ? `-Age${learnerAge}` : '';
  const title = `Scenario_World_Builder/${cleanRegion}/${timeFrame}/Scenario_${cleanRegion}_${timeFrame}${agePart}_${timestamp}`;
  
  // Ensure title doesn't exceed MediaWiki limits (255 bytes)
  const maxBytes = 255;
  if (Buffer.byteLength(title, 'utf8') > maxBytes) {
    let truncated = title;
    while (Buffer.byteLength(truncated, 'utf8') > maxBytes && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated;
  }
  
  return title;
}

/**
 * Create or update a wiki page
 */
async function createOrUpdateWikiPage(scenarioData) {
  if (!WIKI_ENABLED || !MEDIAWIKI_API_URL || !MEDIAWIKI_USERNAME || !MEDIAWIKI_PASSWORD) {
    console.log('Wiki functionality disabled or not configured');
    return { success: false, reason: 'not_configured' };
  }
  
  try {
    const isBot = isBotPassword(MEDIAWIKI_USERNAME);
    let cookies = null;
    let authHeader = null;
    
    // Bot passwords use HTTP Basic Auth directly - no login API needed
    if (isBot) {
      authHeader = createBasicAuthHeader(MEDIAWIKI_USERNAME, MEDIAWIKI_PASSWORD);
      console.log('Using bot password with HTTP Basic Auth (no login API needed)');
    } else {
      // Regular accounts use the login API to get session cookies
      try {
        cookies = await loginToWiki();
        if (cookies) {
          console.log('Login successful, using session cookies');
        }
      } catch (loginError) {
        console.log('Login attempt failed:', loginError.message);
        // Continue without cookies - might work for some setups
      }
    }
    
    // Get CSRF token
    const tokenHeaders = {};
    if (authHeader) {
      tokenHeaders['Authorization'] = authHeader;
    }
    
    const csrfToken = await getCSRFToken(cookies, tokenHeaders);
    
    // Get page title - use provided one if available (for updates), otherwise generate new one
    const pageTitle = scenarioData.pageTitle || generatePageTitle(scenarioData);
    const pageContent = formatScenarioAsWikitext(scenarioData);
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'UNICEF-World-Builder/1.0'
    };
    
    // Add authentication
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Create/edit page
    // If pageTitle was provided, this is an update; otherwise it's a new page
    const editSummary = scenarioData.pageTitle 
      ? `Updated scenario for ${scenarioData.region}, ${scenarioData.timeFrame}`
      : `Generated scenario for ${scenarioData.region}, ${scenarioData.timeFrame}`;
    
    const editParams = new URLSearchParams({
      action: 'edit',
      title: pageTitle,
      text: pageContent,
      token: csrfToken,
      format: 'json',
      summary: editSummary
    });
    
    const editResponse = await fetch(MEDIAWIKI_API_URL, {
      method: 'POST',
      headers: headers,
      body: editParams.toString()
    });
    
    const editData = await editResponse.json();
    
    if (editData.edit && editData.edit.result === 'Success') {
      const baseUrl = MEDIAWIKI_API_URL.replace('/api.php', '');
      return {
        success: true,
        pageTitle: pageTitle,
        pageUrl: `${baseUrl}/index.php/${encodeURIComponent(pageTitle.replace(/\s/g, '_'))}`
      };
    } else if (editData.error) {
      throw new Error(editData.error.info || editData.error.code || 'Unknown error');
    } else {
      throw new Error('Unknown error from MediaWiki API');
    }
  } catch (error) {
    console.error('Error creating/updating wiki page:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch all scenario pages from MediaWiki
 * Returns array of page titles
 */
async function fetchAllScenarioPages(authHeader = null) {
  try {
    const headers = {
      'User-Agent': 'UNICEF-World-Builder/1.0'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    let allPages = [];
    let continueParam = null;
    
    // MediaWiki API uses continuation for large result sets
    // Query for all pages starting with "Scenario_World_Builder"
    do {
      let url = `${MEDIAWIKI_API_URL}?action=query&format=json&list=allpages&apnamespace=0&apprefix=Scenario_World_Builder&aplimit=500`;
      
      if (continueParam) {
        url += `&apcontinue=${encodeURIComponent(continueParam)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`API error: ${data.error.info || data.error.code}`);
      }
      
      if (data.query && data.query.allpages) {
        allPages = allPages.concat(data.query.allpages.map(page => page.title));
      }
      
      continueParam = data.continue?.apcontinue || null;
    } while (continueParam);
    
    return allPages;
  } catch (error) {
    console.error('Error fetching scenario pages:', error);
    throw error;
  }
}

/**
 * Parse scenario page title to extract metadata
 * Format: Scenario_World_Builder/Region/TimeFrame/Scenario_Region_TimeFrame_Age_Timestamp
 */
function parseScenarioTitle(title) {
  const parts = title.split('/');
  if (parts.length < 4) return null;
  
  const region = parts[1];
  const timeFrame = parts[2];
  const scenarioPart = parts[3];
  
  // Extract age from scenario part (e.g., "Scenario_Algeria_2035-Age14_2026-01-02T17-46-56")
  const ageMatch = scenarioPart.match(/-Age(\d+)_/);
  const age = ageMatch ? ageMatch[1] : null;
  
  // Extract timestamp
  const timestampMatch = scenarioPart.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
  const timestamp = timestampMatch ? timestampMatch[1] : null;
  
  return {
    region,
    timeFrame,
    age,
    timestamp,
    fullTitle: title
  };
}

/**
 * Generate index page wikitext with all scenarios organized by region and timeframe
 */
function generateIndexPageWikitext(scenarios) {
  // Organize scenarios by region, then by timeframe
  const organized = {};
  
  scenarios.forEach(scenario => {
    if (!scenario) return;
    
    const { region, timeFrame, age, fullTitle } = scenario;
    
    if (!organized[region]) {
      organized[region] = {};
    }
    
    if (!organized[region][timeFrame]) {
      organized[region][timeFrame] = [];
    }
    
    organized[region][timeFrame].push({
      title: fullTitle,
      age: age,
      displayTitle: fullTitle.split('/').pop() // Just the scenario name part
    });
  });
  
  // Sort scenarios within each timeframe by timestamp (newest first)
  Object.keys(organized).forEach(region => {
    Object.keys(organized[region]).forEach(timeFrame => {
      organized[region][timeFrame].sort((a, b) => {
        // Extract timestamp from title for sorting
        const aTime = a.title.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        const bTime = b.title.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        if (aTime && bTime) {
          return bTime[1].localeCompare(aTime[1]); // Newest first
        }
        return 0;
      });
    });
  });
  
  // List of all regions in order
  const allRegions = [
    'Algeria', 'Ecuador', 'France', 'Ghana', 'Guinea-Bissau', 'Haiti',
    'India', 'Kazakhstan', 'Kenya', 'Madagascar', 'Mauritania', 'Norway',
    'Philippines', 'Senegal', 'United_States_of_America'
  ];
  
  const timeFrames = ['2035', '2045', '2055'];
  
  // Generate wikitext
  let wikitext = `= Scenario World Builder =\n\n`;
  wikitext += `This page contains education scenarios generated by the UNICEF Young Visionaries World Builder tool. Scenarios are organized by region and time frame, exploring possible futures for education in different contexts.\n\n`;
  wikitext += `== About ==\n`;
  wikitext += `These scenarios are AI-generated based on research from UNICEF's Youth Foresight Fellows and represent imaginative explorations of educational futures. Each scenario features a specific learner in a particular region and time frame, showcasing innovative approaches to education.\n\n`;
  wikitext += `''Last updated: ${new Date().toISOString()}''\n\n`;
  wikitext += `== Scenarios by Region ==\n\n`;
  
  allRegions.forEach(region => {
    const regionKey = region.replace(/\s+/g, '_');
    const regionDisplay = region.replace(/_/g, ' ');
    
    if (!organized[regionKey] || Object.keys(organized[regionKey]).length === 0) {
      // Region with no scenarios yet
      wikitext += `=== ${regionDisplay} ===\n`;
      timeFrames.forEach(tf => {
        wikitext += `==== ${tf} ====\n`;
        wikitext += `* ''No scenarios yet''\n\n`;
      });
      return;
    }
    
    wikitext += `=== ${regionDisplay} ===\n`;
    
    timeFrames.forEach(timeFrame => {
      wikitext += `==== ${timeFrame} ====\n`;
      
      if (!organized[regionKey][timeFrame] || organized[regionKey][timeFrame].length === 0) {
        wikitext += `* ''No scenarios yet''\n\n`;
      } else {
        organized[regionKey][timeFrame].forEach(scenario => {
          const ageLabel = scenario.age ? ` (Age ${scenario.age})` : '';
          const linkText = `${regionDisplay} ${timeFrame}${ageLabel}`;
          wikitext += `* [[${scenario.title}|${linkText}]]\n`;
        });
        wikitext += `\n`;
      }
    });
  });
  
  wikitext += `== Notes ==\n`;
  wikitext += `* Scenarios are automatically created when generated through the World Builder tool\n`;
  wikitext += `* Each scenario page includes metadata about the region, time frame, learner age, and approach used\n`;
  wikitext += `* Scenarios can be regenerated and updated, which will modify the existing page rather than creating duplicates\n`;
  wikitext += `* This index page is automatically updated when new scenarios are generated\n\n`;
  
  wikitext += `[[Category:Education Scenarios]]\n`;
  wikitext += `[[Category:UNICEF Projects]]\n`;
  
  return wikitext;
}

/**
 * Update the Scenario World Builder index page with links to all scenarios
 */
async function updateIndexPage() {
  if (!WIKI_ENABLED || !MEDIAWIKI_API_URL || !MEDIAWIKI_USERNAME || !MEDIAWIKI_PASSWORD) {
    console.log('Wiki functionality disabled or not configured');
    return { success: false, reason: 'not_configured' };
  }
  
  try {
    const isBot = isBotPassword(MEDIAWIKI_USERNAME);
    let authHeader = null;
    
    if (isBot) {
      authHeader = createBasicAuthHeader(MEDIAWIKI_USERNAME, MEDIAWIKI_PASSWORD);
    }
    
    // Fetch all scenario pages
    console.log('Fetching all scenario pages...');
    const allPages = await fetchAllScenarioPages(authHeader);
    console.log(`Found ${allPages.length} scenario pages`);
    
    // Filter to only actual scenario pages (not index pages)
    const scenarioPages = allPages.filter(page => {
      // Exclude the main index page and region/timeframe index pages
      return page.includes('/Scenario_') && !page.endsWith('/');
    });
    
    // Parse scenario titles
    const scenarios = scenarioPages.map(parseScenarioTitle).filter(s => s !== null);
    
    // Generate index page wikitext
    const indexWikitext = generateIndexPageWikitext(scenarios);
    
    // Get CSRF token
    const tokenHeaders = {};
    if (authHeader) {
      tokenHeaders['Authorization'] = authHeader;
    }
    const csrfToken = await getCSRFToken(null, tokenHeaders);
    
    // Update the index page
    const indexPageTitle = 'Scenario_World_Builder';
    const editParams = new URLSearchParams({
      action: 'edit',
      title: indexPageTitle,
      text: indexWikitext,
      token: csrfToken,
      format: 'json',
      summary: `Updated index page with ${scenarios.length} scenarios`
    });
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'UNICEF-World-Builder/1.0'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const editResponse = await fetch(MEDIAWIKI_API_URL, {
      method: 'POST',
      headers: headers,
      body: editParams.toString()
    });
    
    const editData = await editResponse.json();
    
    if (editData.edit && editData.edit.result === 'Success') {
      console.log(`✅ Index page updated with ${scenarios.length} scenarios`);
      return {
        success: true,
        scenarioCount: scenarios.length,
        pageTitle: indexPageTitle
      };
    } else if (editData.error) {
      throw new Error(editData.error.info || editData.error.code || 'Unknown error');
    } else {
      throw new Error('Unknown error from MediaWiki API');
    }
  } catch (error) {
    console.error('Error updating index page:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createOrUpdateWikiPage,
  WIKI_ENABLED
};


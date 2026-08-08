import { regionalInsights } from '../data/regionalInsights';
import { globalScanHits, globalScanHitCategories, techCategories } from '../data/globalScanHits';
import { timeFrameGuidance } from '../data/timeFrameGuidance';
import { getAgeContext } from '../data/ageContexts';
import { getDemoScenario } from '../data/demoScenarios';
import { getAllSafetyInstructions } from './safetyInstructions';
import { sanitizeUserInput } from './inputSanitization';

// Function to extract title and scenario from response
// Title format: "Region, Year, Age X, Scenario Name"
const extractTitleAndScenario = (response) => {
  if (!response || typeof response !== 'string') {
    return { title: null, scenario: response };
  }

  // Look for title in format: "Region, Year, Age X, Scenario Name"
  // Title should be on first line, separated from scenario by double newline
  const lines = response.trim().split('\n\n');

  // Check if first line matches the title pattern
  const titlePattern = /^(.+),\s*(\d{4}),\s*Age\s*(\d+),\s*(.+)$/;
  const firstLine = lines[0].trim();

  if (titlePattern.test(firstLine)) {
    return {
      title: firstLine,
      scenario: lines.slice(1).join('\n\n').trim()
    };
  }

  // Fallback: if first line is short and followed by double newline, treat as title
  if (lines.length > 1 && firstLine.length < 150 && firstLine.includes(',')) {
    return {
      title: firstLine,
      scenario: lines.slice(1).join('\n\n').trim()
    };
  }

  // No title found
  return { title: null, scenario: response };
};

// Function to clean up generated scenario content
const cleanScenarioContent = (scenario) => {
  if (!scenario || typeof scenario !== 'string') return scenario;

  let cleaned = scenario;

  // Remove "Title:" prefix and quotes around titles at the beginning
  cleaned = cleaned.replace(/^Title:\s*["']([^"']+)["']\s*/i, '$1\n\n');
  cleaned = cleaned.replace(/^Title:\s*([^"\n]+)\s*/i, '$1\n\n');
  cleaned = cleaned.replace(/^["']([^"']+)["']\s*/m, '$1\n\n');

  // Fix paragraph breaks in the middle of sentences
  // Look for patterns like: "word\n\nword" where it should be "word word"
  // But preserve intentional paragraph breaks (after periods, exclamation marks, etc.)
  cleaned = cleaned.replace(/([a-z,;:])\n\n([a-z])/g, '$1 $2');

  // Fix single line breaks in the middle of sentences
  cleaned = cleaned.replace(/([a-z,;:])\n([a-z])/g, '$1 $2');

  // Remove various forms of innovations/technologies listing at the end
  cleaned = cleaned.replace(/\n*\[?Innovations used:.*$/is, '');
  cleaned = cleaned.replace(/\n*Innovations used:.*$/is, '');
  cleaned = cleaned.replace(/\n*Technologies featured:.*$/is, '');
  cleaned = cleaned.replace(/\n*Educational innovations included:.*$/is, '');
  cleaned = cleaned.replace(/\n*Key innovations featured:.*$/is, '');
  cleaned = cleaned.replace(/\n*Technologies used:.*$/is, '');
  cleaned = cleaned.replace(/\n*\[Educational innovations:.*$/is, '');
  cleaned = cleaned.replace(/\n*\[Technologies:.*$/is, '');

  // Remove any trailing lists in brackets
  cleaned = cleaned.replace(/\n*\[.*?\]$/s, '');

  // Clean up any trailing whitespace or multiple newlines
  cleaned = cleaned.trim().replace(/\n{3,}/g, '\n\n');

  return cleaned;
};

// --- Randomized scenario spec -------------------------------------------------
// All run-to-run variety is decided here in code and handed to the model as
// requirements. The model cannot randomize on its own (and claude-sonnet-5
// takes no temperature parameter), so this is the variation mechanism: with
// ~6-8 options per dimension across seven dimensions, every generation gets a
// combinatorially distinct brief.

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

const characterNames = {
  'Algeria': ['Amina', 'Youssef', 'Fatima', 'Karim', 'Nour', 'Omar'],
  'Ecuador': ['Sofia', 'Diego', 'Valentina', 'Carlos', 'Isabella', 'Andres'],
  'France': ['Marie', 'Pierre', 'Camille', 'Lucas', 'Emma', 'Thomas'],
  'Ghana': ['Akosua', 'Kwame', 'Ama', 'Kofi', 'Efua', 'Yaw'],
  'Guinea-Bissau': ['Mariama', 'Baba', 'Fatou', 'Sekou', 'Aissatou', 'Mamadou'],
  'Haiti': ['Marie-Claire', 'Jean-Pierre', 'Sylvie', 'Marc', 'Nathalie', 'Ronald'],
  'India': ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram'],
  'Kazakhstan': ['Aida', 'Daniyar', 'Zarina', 'Nurbol', 'Aigerim', 'Askar'],
  'Kenya': ['Wanjiku', 'Kipchoge', 'Akinyi', 'Otieno', 'Grace', 'Mwangi'],
  'Madagascar': ['Rasoa', 'Andry', 'Voahangy', 'Tahina', 'Fara', 'Hery'],
  'Mauritania': ['Fatimetou', 'Mohamed', 'Aminetou', 'Cheikh', 'Mariem', 'Sidi'],
  'Norway': ['Ingrid', 'Erik', 'Astrid', 'Lars', 'Solveig', 'Magnus'],
  'Philippines': ['Maria', 'Jose', 'Ana', 'Juan', 'Carmen', 'Pedro'],
  'Senegal': ['Aissatou', 'Moussa', 'Fatou', 'Ibrahima', 'Khadija', 'Mamadou'],
  'United States of America': ['Emma', 'James', 'Olivia', 'William', 'Sophia', 'Benjamin']
};

const genders = ['a girl', 'a boy'];

const personalityTraits = [
  'curious and methodical',
  'restless, with a quick sense of humor',
  'a quiet observer who notices what others miss',
  'stubborn and determined',
  'anxious but quietly brave',
  'a playful daydreamer',
  'practical, always fixing things',
  'a natural organizer who pulls people together'
];

const familyCircumstances = [
  'the eldest sibling, helping care for younger children',
  'recently moved with their family from the countryside to a bigger town',
  'living with a grandparent while a parent works far away',
  'from a family that runs a small shop',
  'from a farming family',
  'the first in their family to study this far',
  'part of a large multigenerational household',
  'raised by a single parent who works long hours'
];

const settings = [
  'a dense city neighborhood',
  'a small rural village',
  'a coastal community',
  'a highland community',
  'a mid-sized market town',
  'a fast-growing settlement on the edge of a city',
  'a farming community',
  'a riverside community'
];

const narrativeFrames = [
  'a day in the life, told hour by hour',
  'a letter the character writes to a cousin living abroad',
  'a moment when the new system falls short, and how the character and others work around it',
  'a collaborative project with other students that comes to a head today',
  'a conversation with a grandparent, comparing school then and now',
  'an ordinary school morning interrupted by an unexpected discovery',
  'the character teaching or helping someone else learn',
  'a community gathering where the character presents something they made'
];

const stirdeeperLenses = {
  SOCIAL: 'changes in how people interact, learn together, and build community',
  ENVIRONMENTAL: 'climate impacts and sustainability in education',
  POLITICAL: 'governance, policy, and power structures in education',
  EDUCATIONAL: 'pedagogical approaches and learning methods',
  ECONOMIC: 'new economic models for education and work',
  TECHNOLOGICAL: 'technologies that enhance learning'
};

// Pick exactly the innovations the scenario must use. Research mode anchors on
// the region's own Youth Foresight scan hit; remaining picks come from distinct
// categories, with tech-centric categories capped at one per scenario so the
// mix doesn't collapse into AI + VR every time.
const pickInnovations = (timeFrame, useExistingScenario, regional) => {
  const total = timeFrame === '2035' ? 2 : 3;
  const innovations = [];
  if (useExistingScenario && regional && regional.scanHit) {
    innovations.push(regional.scanHit);
  }
  let techUsed = 0;
  for (const category of shuffle(Object.keys(globalScanHitCategories))) {
    if (innovations.length >= total) break;
    const isTech = techCategories.includes(category);
    if (isTech && techUsed >= 1) continue;
    innovations.push(pickRandom(globalScanHitCategories[category]));
    if (isTech) techUsed += 1;
  }
  return innovations;
};

// Two STIRDEEPER lenses per scenario, weighted away from TECHNOLOGICAL.
const pickLenses = () => {
  const lenses = shuffle(Object.keys(stirdeeperLenses).filter(l => l !== 'TECHNOLOGICAL')).slice(0, 2);
  if (Math.random() < 0.2) {
    lenses[1] = 'TECHNOLOGICAL';
  }
  return lenses;
};

// --- Recent-scenario memory ---------------------------------------------------
// Titles of recent generations are fed back into the prompt so the model can
// actively avoid repeating premises across generations (it has no memory of
// its own previous outputs).
const RECENT_TITLES_KEY = 'uwb_recent_scenario_titles';

const getRecentTitles = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    return JSON.parse(window.localStorage.getItem(RECENT_TITLES_KEY)) || [];
  } catch (e) {
    return [];
  }
};

export const recordScenarioTitle = (title) => {
  try {
    if (!title || typeof window === 'undefined' || !window.localStorage) return;
    const titles = [title, ...getRecentTitles().filter(t => t !== title)].slice(0, 8);
    window.localStorage.setItem(RECENT_TITLES_KEY, JSON.stringify(titles));
  } catch (e) {
    // non-essential; ignore storage failures
  }
};

// Stable instructions shared by every request — sent as the system prompt.
const buildSystemPrompt = () => `You are a scenario writer for UNICEF's Young Visionaries World Builder, creating imaginative future-of-education stories used in workshops with young people.

${getAllSafetyInstructions()}

OUTPUT FORMAT:
- First line: a title in the exact format given in the request
- Then a blank line, then the scenario as flowing prose paragraphs
- Do not append lists of technologies or innovations, and add no meta-commentary before or after the story`;

export const generatePrompt = (selectedRegion, timeFrame, learnerAge, useExistingScenario, customDirection) => {
  // Sanitize user inputs before processing
  const sanitizedCustomDirection = customDirection ? sanitizeUserInput(customDirection).sanitized : '';

  const regional = regionalInsights[selectedRegion];
  const guidance = timeFrameGuidance[timeFrame];
  const ageContext = getAgeContext(learnerAge);

  // The randomized brief: character, setting, story shape, lenses, innovations.
  // Name lists alternate feminine/masculine (even/odd indices), so pick the
  // gender first and draw the name from a matching pool. The fallback names
  // are unisex.
  const regionNames = characterNames[selectedRegion] || ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley'];
  const gender = pickRandom(genders);
  const namePool = characterNames[selectedRegion]
    ? regionNames.filter((_, i) => (gender === 'a girl' ? i % 2 === 0 : i % 2 === 1))
    : regionNames;
  const age = learnerAge || (8 + Math.floor(Math.random() * 10));
  const spec = {
    name: pickRandom(namePool),
    gender,
    trait: pickRandom(personalityTraits),
    circumstance: pickRandom(familyCircumstances),
    setting: pickRandom(settings),
    frame: pickRandom(narrativeFrames),
    lenses: pickLenses(),
    innovations: pickInnovations(timeFrame, useExistingScenario, regional)
  };
  const recentTitles = getRecentTitles();

  const user = `Write one education-futures scenario following this brief.

SCENARIO BRIEF
- Region: ${selectedRegion}
- Year: ${timeFrame}
- Main character: ${spec.name}, ${spec.gender}, exactly ${age} years old — ${spec.trait}; ${spec.circumstance}
- Setting: ${spec.setting} in ${selectedRegion} (adapt the setting so it is authentic to the region)
- Narrative frame: tell it as ${spec.frame}
- Emphasize these two STIRDEEPER lenses above all others:
${spec.lenses.map(l => `  • ${l}: ${stirdeeperLenses[l]}`).join('\n')}

${useExistingScenario ? `RESEARCH FOUNDATION (from UNICEF's Youth Foresight Fellows in ${selectedRegion} — this is the heart of the scenario):
- Theme: ${regional.theme}
- Current challenges: ${regional.currentChallenges}
- The fellows' preferred future: ${regional.preferredFuture}

The story's central tension must grow out of these challenges, and its resolution must reflect the fellows' preferred future. The first required innovation below is the fellows' own focus area — keep it central to the story.` : `FRESH SCENARIO: Build the scenario from your own knowledge of ${selectedRegion} — its educational system, languages, culture, geography, economy, and current challenges — so it feels authentic to the region rather than generic.`}

TIME FRAME — ${guidance.novelty} (${timeFrame}):
${guidance.description}
${guidance.constraints}
Register to aim for: ${guidance.examples}

REQUIRED INNOVATIONS — build the story around exactly these ${spec.innovations.length}, no others:
${spec.innovations.map(hit => `• ${hit}`).join('\n')}
Weave each one concretely into ${spec.name}'s story — show it working in daily life, give it a one-sentence backstory, and show a consequence — rather than name-dropping it.
${ageContext ? `
EDUCATIONAL CONTEXT FOR AGE ${age}:
- Educational level: ${ageContext.level}
- Learning focus: ${ageContext.focus}
- Key considerations: ${ageContext.considerations}
` : ''}${recentTitles.length ? `
RECENTLY GENERATED SCENARIOS — do not repeat their premises, settings, or central ideas:
${recentTitles.map(t => `- ${t}`).join('\n')}
` : ''}${sanitizedCustomDirection ? `
USER DIRECTION: ${sanitizedCustomDirection}
` : ''}
Length: 400-450 words.

Start your response with a title on the first line in this exact format:
${selectedRegion}, ${timeFrame}, Age ${age}, [Short evocative title that captures the gist of the scenario]

Then leave a blank line, then the scenario text.`;

  // Debug logging
  console.log('=== PROMPT DEBUG ===');
  console.log('Mode:', useExistingScenario ? 'Young Visionaries Research' : 'Fresh Scenario');
  console.log('Spec:', spec);
  console.log('Recent titles fed back:', recentTitles.length);
  console.log('Prompt length:', user.length);
  console.log('=== END DEBUG ===');

  return { system: buildSystemPrompt(), user };
};

// Words that match the capitalized-name shape but are never character names
const NAME_STOPWORDS = new Set(['In', 'From', 'At', 'The', 'An', 'Experiences']);

const isLikelyName = (word) =>
  typeof word === 'string' && /^[A-Z][a-z]+$/.test(word) && !NAME_STOPWORDS.has(word);

// Helper function to extract character name from scenario
export const extractCharacterName = (scenario) => {
  // Look for patterns like "12-year-old Maria" or "Maria, a 12-year-old"
  const namePatterns = [
    /(\d+)-year-old\s+([A-Z][a-z]+)/,
    /([A-Z][a-z]+),?\s+(?:an?\s+)?(\d+)-year-old/,
    /([A-Z][a-z]+)\s+(?:in|from|at|experiences)/
  ];

  for (const pattern of namePatterns) {
    const match = scenario.match(pattern);
    if (match) {
      // Return the name part (could be in different capture groups depending on pattern)
      const candidate = isLikelyName(match[1]) ? match[1] : match[2];
      if (isLikelyName(candidate)) return candidate;
    }
  }

  // Fallback: look for any capitalized name at the beginning of a sentence
  const fallbackMatch = scenario.match(/(?:^|\. )([A-Z][a-z]+)(?:'s|\s)/);
  return fallbackMatch ? fallbackMatch[1] : null;
};

// Helper function to extract scenario setting/title from scenario
const extractScenarioSetting = (scenario) => {
  // Look for quoted titles or distinctive settings
  const titleMatch = scenario.match(/"([^"]+)"/);
  if (titleMatch) return titleMatch[1];

  // Look for distinctive setting descriptions
  const settingPatterns = [
    /(?:floating|mobile|virtual|digital|sacred|innovative)\s+(?:classroom|school|learning|education)/i,
    /(?:aboard|in|at)\s+(?:one of|the)\s+([^.]+?)(?:\s+[–-]|\.|,)/i
  ];

  for (const pattern of settingPatterns) {
    const match = scenario.match(pattern);
    if (match) return match[0].trim();
  }

  return null;
};

export const generateRegeneratePrompt = (selectedRegion, timeFrame, learnerAge, generatedScenario, feedback, useExistingScenario, existingTitle) => {
  // Sanitize user feedback inputs before processing
  const sanitizedFeedback = {
    liked: feedback.liked ? sanitizeUserInput(feedback.liked).sanitized : '',
    disliked: feedback.disliked ? sanitizeUserInput(feedback.disliked).sanitized : ''
  };

  const regional = regionalInsights[selectedRegion];

  // Extract core elements from the original scenario to preserve them
  const originalCharacterName = extractCharacterName(generatedScenario);
  const originalSetting = extractScenarioSetting(generatedScenario);

  // Only select educational innovations that could address the specific feedback
  // Focus on innovations related to what the user wants to change
  const feedbackKeywords = (feedback.disliked || '').toLowerCase();
  let relevantInnovations = [];

  if (feedbackKeywords.includes('stirdeeper') || feedbackKeywords.includes('social') || feedbackKeywords.includes('political') || feedbackKeywords.includes('environmental')) {
    relevantInnovations = globalScanHits.filter(hit =>
      hit.toLowerCase().includes('social') ||
      hit.toLowerCase().includes('political') ||
      hit.toLowerCase().includes('environmental') ||
      hit.toLowerCase().includes('governance') ||
      hit.toLowerCase().includes('community') ||
      hit.toLowerCase().includes('cultural') ||
      hit.toLowerCase().includes('climate') ||
      hit.toLowerCase().includes('democracy') ||
      hit.toLowerCase().includes('peace')
    );
  } else {
    // If no specific feedback, select a broader range but still focused
    relevantInnovations = shuffle(globalScanHits).slice(0, 30);
  }

  // Limit to a focused set of the most relevant innovations
  const selectedInnovations = relevantInnovations.slice(0, 15);

  const user = `SCENARIO REFINEMENT REQUEST: Improve and enhance the existing scenario based on user feedback while preserving the core story elements.

REFINEMENT OBJECTIVE: Take the existing scenario and enhance it by addressing the user's specific feedback while maintaining the same character, setting, and basic storyline structure.

ORIGINAL SCENARIO TO REFINE:
${generatedScenario}

USER FEEDBACK FOR IMPROVEMENT:
What they liked: ${sanitizedFeedback.liked || 'No specific feedback provided'}
What they want enhanced/added: ${sanitizedFeedback.disliked || 'No specific changes requested'}

PRESERVATION REQUIREMENTS:
- Keep the same character: ${originalCharacterName || 'the original character'} (age ${learnerAge})
- Maintain the same setting: ${originalSetting || 'the same educational environment'}
- Preserve the core storyline structure and basic plot
- Keep the same time period: ${timeFrame}
- Maintain the regional context: ${selectedRegion}
${existingTitle ? `- Keep the same title: "${existingTitle}"` : ''}

REFINEMENT INSTRUCTIONS:
1. Enhance, don't replace: build upon the existing scenario rather than creating something new
2. Address feedback: specifically add or improve the elements the user requested
3. Preserve the core: keep the character name, setting, and main story beats
4. Expand details: add more depth, dialogue, and specific examples where needed
5. Maintain authenticity: keep the regional and cultural context consistent, and keep the futures-craft principles (traceable change, continuity, friction, second-order effects)

${useExistingScenario ? `
REGIONAL CONTEXT (Youth Foresight Fellows research for ${selectedRegion}):
- Theme: ${regional.theme}
- Challenges: ${regional.currentChallenges}
- Vision: ${regional.preferredFuture}
- Focus: ${regional.scanHit}

Use this research context to inform your enhancements while keeping the same basic story.
` : `
REGIONAL CONTEXT FOR ${selectedRegion}:
Use your knowledge of ${selectedRegion}'s educational, cultural, and socioeconomic context to enhance the scenario authentically while maintaining the same basic story structure.
`}

ENHANCEMENT OPPORTUNITIES:
If (and only if) it helps address the user's feedback, you may weave in 1-2 of these innovations:

${selectedInnovations.map(innovation => `• ${innovation}`).join('\n')}

Show any added innovation working concretely in the story — with a brief backstory and a consequence — rather than name-dropping it.

SPECIFIC ENHANCEMENT GUIDELINES:
- If user wants more "STIRDEEPER representation": add more Social, Political, Environmental, or Economic dimensions
- If user wants more dialogue: add conversations between characters
- If user wants more detail: expand on the educational innovations and how they work
- If user wants more emotion: add character feelings, reactions, and personal growth moments
- If user wants different focus: shift emphasis while keeping the same basic story

REFINED SCENARIO REQUIREMENTS:
- Same character (${originalCharacterName || 'original character'}) at age ${learnerAge}
- Same setting (${originalSetting || 'original setting'})
- Enhanced based on feedback: "${sanitizedFeedback.disliked || 'general improvements'}"
- Preserve what they liked: "${sanitizedFeedback.liked || 'existing elements'}"
- 400-450 words with richer detail and better alignment with user preferences
- Maintain regional authenticity for ${selectedRegion}

Create a refined and improved version of the SAME scenario that addresses the user's feedback while preserving the core story elements they already have.

Start your response with a title on the first line. ${existingTitle ? `Use the existing title: "${existingTitle}"` : `Create a title in this format: ${selectedRegion}, ${timeFrame}, Age ${learnerAge || '[age]'}, [Short evocative title that captures the gist of the scenario]`}

Then leave a blank line, then provide the refined scenario text.`;

  // Debug logging
  console.log('=== REGENERATION PROMPT DEBUG ===');
  console.log('useExistingScenario:', useExistingScenario);
  console.log('selectedRegion:', selectedRegion);
  console.log('originalCharacterName:', originalCharacterName);
  console.log('originalSetting:', originalSetting);
  console.log('feedbackKeywords:', feedbackKeywords);
  console.log('relevantInnovations count:', relevantInnovations.length);
  console.log('Mode: REFINEMENT (not new generation)');
  console.log('Prompt length:', user.length);
  console.log('=== END REGENERATION DEBUG ===');

  return { system: buildSystemPrompt(), user };
};

export const callClaudeAPI = async (promptParts, selectedRegion, timeFrame) => {
  // All API calls go through the server proxy which handles API key authentication
  // Client-side code does not need access to the API key for security reasons.
  // Accepts either a plain prompt string or { system, user } parts.
  const { user: prompt, system } = typeof promptParts === 'string'
    ? { user: promptParts, system: undefined }
    : promptParts;

  try {
    // Use the proxy server instead of calling the API directly
    // In development, use the full URL to the Express server
    const apiUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001/api/generate-scenario'
      : '/api/generate-scenario';

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, system })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);

      // If server returns API key error, fall back to demo mode
      if (errorData.error && errorData.error.includes('API key not configured')) {
        console.log('Falling back to demo mode due to server API key error');
        const demoScenario = getDemoScenario(selectedRegion, timeFrame);
        if (demoScenario) {
          const cleaned = cleanScenarioContent(demoScenario);
          return { title: null, scenario: cleaned + '\n\n[Demo Mode: Server API key not configured. This is a sample scenario.]' };
        }
        return { title: null, scenario: `Demo scenario for ${selectedRegion} in ${timeFrame}. Server API key not configured.\n\n[Demo Mode: Configure API key on server for custom scenarios.]` };
      }

      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const cleaned = cleanScenarioContent(data.scenario);
    const { title, scenario } = extractTitleAndScenario(cleaned);

    // Remember this title so future generations can avoid repeating its premise
    if (title) recordScenarioTitle(title);

    return { title, scenario };
  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Fall back to demo mode on any error
    console.log('Falling back to demo mode due to error');
    const demoScenario = getDemoScenario(selectedRegion, timeFrame);
    if (demoScenario) {
      const cleaned = cleanScenarioContent(demoScenario);
      return { title: null, scenario: cleaned + '\n\n[Demo Mode: Server error occurred. This is a sample scenario.]' };
    }
    return { title: null, scenario: `Demo scenario for ${selectedRegion} in ${timeFrame}. Server error occurred.\n\n[Demo Mode: Fix server configuration for custom scenarios.]` };
  }
};

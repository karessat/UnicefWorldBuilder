/**
 * Save scenario to wiki (non-blocking)
 * This function fires and forgets - it doesn't block the user experience
 */
export const saveScenarioToWiki = async (scenarioData) => {
  // Check if wiki is enabled (optional feature flag)
  // Note: This is a client-side check, but the server will also check
  // We do this to avoid unnecessary network calls
  console.log('Wiki save check:', {
    REACT_APP_WIKI_ENABLED: process.env.REACT_APP_WIKI_ENABLED,
    NODE_ENV: process.env.NODE_ENV
  });
  
  if (process.env.REACT_APP_WIKI_ENABLED !== 'true') {
    console.log('Wiki save skipped: REACT_APP_WIKI_ENABLED is not "true"');
    return { success: false, reason: 'disabled' };
  }
  
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/save-to-wiki'
      : '/api/save-to-wiki';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarioData)
    });
    
    // Don't wait for result - fire and forget
    // Just log for debugging
    if (response.ok) {
      console.log('Wiki save initiated');
    } else {
      console.log('Wiki save request failed (non-critical)');
    }
    
    return { success: true };
  } catch (error) {
    // Silently fail - don't interrupt user experience
    // Wiki save is optional and should never block scenario generation
    console.error('Wiki save error (non-critical):', error);
    return { success: false, error: error.message };
  }
};


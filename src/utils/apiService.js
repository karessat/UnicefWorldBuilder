import { regionalInsights } from '../data/regionalInsights';
import { globalScanHits } from '../data/globalScanHits';
import { timeFrameGuidance } from '../data/timeFrameGuidance';
import { getAgeContext } from '../data/ageContexts';
import { getDemoScenario } from '../data/demoScenarios';

export const generatePrompt = (selectedRegion, timeFrame, learnerAge, useExistingScenario, customDirection) => {
  const regional = regionalInsights[selectedRegion];
  const guidance = timeFrameGuidance[timeFrame];
  const ageContext = getAgeContext(learnerAge);

  // Add timestamp and random elements for uniqueness
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 10000);
  
  // Select a different random subset of scan hits each time (40-70 innovations)
  const numInnovations = 40 + Math.floor(Math.random() * 31); // Random between 40-70
  const shuffledScanHits = [...globalScanHits].sort(() => 0.5 - Math.random());
  const selectedScanHits = shuffledScanHits.slice(0, numInnovations);
  
  // Random scenario elements for variety
  const scenarioTypes = [
    'a day in the life', 'a transformative moment', 'a collaborative project', 
    'a challenge overcome', 'an unexpected discovery', 'a community initiative'
  ];
  const randomScenarioType = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
  
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
  const regionNames = characterNames[selectedRegion] || ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley'];
  const randomName = regionNames[Math.floor(Math.random() * regionNames.length)];

  const prompt = `CREATIVITY & UNIQUENESS REQUIREMENT: This is generation #${randomSeed} at ${timestamp}. Create a COMPLETELY UNIQUE scenario that is different from any previous generation. Be creative, unexpected, and original!

MANDATORY REQUIREMENT: The main character in this scenario MUST be exactly ${learnerAge || 'a randomly chosen'} years old. Do NOT use age 15 or any other age. Use ${learnerAge || 'the chosen age'} throughout the entire scenario.

SCENARIO FOCUS: Create ${randomScenarioType} story featuring ${randomName}, a ${learnerAge || 'chosen age'}-year-old student in ${selectedRegion}.

${useExistingScenario ? `
You are helping create an imaginative education scenario for ${timeFrame} based on UNICEF's Youth Foresight Fellows research.

CONTEXT: Young people from ${selectedRegion} have identified key challenges and visions for education futures through the Young Visionaries project.

REGIONAL INSIGHTS FOR ${selectedRegion} (from Youth Foresight Fellows research):
- Current Theme: ${regional.theme}
- Key Challenges: ${regional.currentChallenges}  
- Preferred Future Vision: ${regional.preferredFuture}
- Regional Focus Area: ${regional.scanHit}
` : `
You are helping create a completely fresh, imaginative education scenario for ${timeFrame} using your knowledge of ${selectedRegion}'s educational context, cultural factors, socioeconomic conditions, and current challenges.

FRESH SCENARIO APPROACH FOR ${selectedRegion}:
- Use your understanding of ${selectedRegion}'s educational system, culture, and context
- Consider region-specific challenges like infrastructure, language, economic factors, and social dynamics
- Ensure the scenario feels authentic to ${selectedRegion}'s educational and cultural environment
- Focus on what YOU determine is most appropriate for ${selectedRegion} given the ${timeFrame} timeframe and ${learnerAge ? `age ${learnerAge}` : 'chosen age'} student
- Focus entirely on your own knowledge and understanding of the region
- Draw inspiration from the available innovations below to create something uniquely suited to ${selectedRegion}'s context
`}

CHARACTER REQUIREMENTS (CRITICAL):
${learnerAge ? `- Main character name: ${randomName}, age: EXACTLY ${learnerAge} years old (NOT 15, NOT any other age)` : `- Main character name: ${randomName}, choose a specific age between 8-17 and state it clearly`}
- Gender: Randomly select male, female, or non-binary (do not default to female)
- Make the character feel authentic to ${selectedRegion}
- Give the character unique personality traits, interests, and background

${ageContext ? `
EDUCATIONAL CONTEXT FOR AGE ${learnerAge}:
- Educational Level: ${ageContext.level}
- Learning Focus: ${ageContext.focus}
- Key Considerations: ${ageContext.considerations}
` : ''}

TIME FRAME GUIDANCE - ${guidance.novelty} (${timeFrame}):
${guidance.description}

AVAILABLE EDUCATIONAL INNOVATIONS TO DRAW FROM:
Select and weave in 3-5 of these possibilities that fit your scenario:

${selectedScanHits.map(hit => `• ${hit}`).join('\n')}

CREATIVITY & VARIETY INSTRUCTIONS:
- Create a UNIQUE story that hasn't been told before - avoid generic scenarios
- Use unexpected plot twists, surprising discoveries, or unusual learning situations
- Make the scenario emotionally engaging and memorable
- Include specific, vivid details that bring the story to life
- Don't mention all innovations - select 3-5 that work well together for your specific scenario
- Integrate them naturally into the story rather than listing them
- Show how they work in practice through the character's experience
- Focus on the human impact and learning outcomes, not just the technology

STIRDEEPER FOCUS INSTRUCTIONS:
Focus deeply on just 2-3 STIRDEEPER categories (choose different ones than typical):
- SOCIAL: Changes in how people interact, learn together, and build community
- ENVIRONMENTAL: Climate impacts and sustainability in education
- POLITICAL: Governance, policy, and power structures in education
- EDUCATIONAL: Pedagogical approaches and learning methods
- ECONOMIC: New economic models for education and work
- TECHNOLOGICAL: Innovations that enhance learning (use sparingly)

STORY STRUCTURE VARIETY:
- Start with an unexpected situation or challenge
- Include dialogue and personal interactions
- Show the character's emotions and growth
- End with a meaningful resolution or new beginning

${useExistingScenario ? `START WITH: Use the existing Young Visionaries scenario vision from ${selectedRegion} as your foundation, but project it forward to ${timeFrame} incorporating relevant innovations from the list above.` : `CREATE NEW: Generate a completely fresh scenario for ${selectedRegion} in ${timeFrame} using your knowledge of the region. Rely entirely on your understanding of ${selectedRegion}'s educational context, challenges, and opportunities.`}

${customDirection ? `USER DIRECTION: ${customDirection}` : ''}

FINAL REMINDER: Your main character must be ${learnerAge ? `${learnerAge} years old` : 'the specific age you choose'} - verify this before writing.

Please create a scenario (250-300 words) featuring a ${learnerAge ? `${learnerAge}-year-old` : '[specify age]'} student in ${selectedRegion}, ${timeFrame}.`;

  // Debug logging
  console.log('=== PROMPT DEBUG ===');
  console.log('useExistingScenario:', useExistingScenario);
  console.log('selectedRegion:', selectedRegion);
  console.log('Mode:', useExistingScenario ? 'Young Visionaries Research' : 'Fresh Scenario');
  console.log('Prompt length:', prompt.length);
  console.log('Contains UNICEF research:', prompt.includes('UNICEF'));
  console.log('Contains Young Visionaries:', prompt.includes('Young Visionaries'));
  console.log('=== END DEBUG ===');

  return prompt;
};

// Helper function to extract character name from scenario
const extractCharacterName = (scenario) => {
  // Look for patterns like "12-year-old Maria" or "Maria, a 12-year-old"
  const namePatterns = [
    /(\d+)-year-old\s+([A-Z][a-z]+)/i,
    /([A-Z][a-z]+),?\s+(?:an?\s+)?(\d+)-year-old/i,
    /([A-Z][a-z]+)\s+(?:in|from|at|experiences)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = scenario.match(pattern);
    if (match) {
      // Return the name part (could be in different capture groups depending on pattern)
      return match[1].match(/^[A-Z][a-z]+$/) ? match[1] : match[2];
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

export const generateRegeneratePrompt = (selectedRegion, timeFrame, learnerAge, generatedScenario, feedback, useExistingScenario) => {
  const guidance = timeFrameGuidance[timeFrame];
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
    relevantInnovations = globalScanHits.slice(0, 30);
  }
  
  // Limit to 10-15 most relevant innovations to keep focused
  const selectedInnovations = relevantInnovations.slice(0, 15);

  const prompt = `SCENARIO REFINEMENT REQUEST: Improve and enhance the existing scenario based on user feedback while preserving the core story elements.

REFINEMENT OBJECTIVE: Take the existing scenario and enhance it by addressing the user's specific feedback while maintaining the same character, setting, and basic storyline structure.

ORIGINAL SCENARIO TO REFINE:
${generatedScenario}

USER FEEDBACK FOR IMPROVEMENT:
What they liked: ${feedback.liked || 'No specific feedback provided'}
What they want enhanced/added: ${feedback.disliked || 'No specific changes requested'}

MANDATORY PRESERVATION REQUIREMENTS:
- Keep the same character: ${originalCharacterName || 'the original character'} (age ${learnerAge})
- Maintain the same setting: ${originalSetting || 'the same educational environment'}
- Preserve the core storyline structure and basic plot
- Keep the same time period: ${timeFrame}
- Maintain the regional context: ${selectedRegion}

REFINEMENT INSTRUCTIONS:
1. ENHANCE, don't replace: Build upon the existing scenario rather than creating something new
2. ADDRESS FEEDBACK: Specifically add or improve the elements the user requested
3. PRESERVE CORE: Keep the character name, setting, and main story beats
4. EXPAND DETAILS: Add more depth, dialogue, and specific examples where needed
5. MAINTAIN AUTHENTICITY: Keep the regional and cultural context consistent

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
Based on the user feedback, consider incorporating these relevant educational innovations to address their concerns:

${selectedInnovations.map(innovation => `• ${innovation}`).join('\n')}

SPECIFIC ENHANCEMENT GUIDELINES:
- If user wants more "STIRDEEPER representation": Add more Social, Political, Environmental, or Economic dimensions
- If user wants more dialogue: Add conversations between characters
- If user wants more detail: Expand on the educational innovations and how they work
- If user wants more emotion: Add character feelings, reactions, and personal growth moments
- If user wants different focus: Shift emphasis while keeping the same basic story

REFINED SCENARIO REQUIREMENTS:
- Same character (${originalCharacterName || 'original character'}) at age ${learnerAge}
- Same setting (${originalSetting || 'original setting'})
- Enhanced based on feedback: "${feedback.disliked || 'general improvements'}"
- Preserve what they liked: "${feedback.liked || 'existing elements'}"
- 250-300 words with richer detail and better alignment with user preferences
- Maintain regional authenticity for ${selectedRegion}

Create a refined and improved version of the SAME scenario that addresses the user's feedback while preserving the core story elements they already have.`;

  // Debug logging
  console.log('=== REGENERATION PROMPT DEBUG ===');
  console.log('useExistingScenario:', useExistingScenario);
  console.log('selectedRegion:', selectedRegion);
  console.log('originalCharacterName:', originalCharacterName);
  console.log('originalSetting:', originalSetting);
  console.log('feedbackKeywords:', feedbackKeywords);
  console.log('relevantInnovations count:', relevantInnovations.length);
  console.log('Mode: REFINEMENT (not new generation)');
  console.log('Prompt length:', prompt.length);
  console.log('=== END REGENERATION DEBUG ===');

  return prompt;
};

export const callClaudeAPI = async (prompt, selectedRegion, timeFrame) => {
  // Add debugging to see what environment variables are being read
  console.log('Environment variables check:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_ANTHROPIC_API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
    API_KEY_LENGTH: process.env.REACT_APP_ANTHROPIC_API_KEY?.length || 0
  });

  // Check if we're in demo mode (no API key configured)
  const isDemoMode = !process.env.REACT_APP_ANTHROPIC_API_KEY || 
                     process.env.REACT_APP_ANTHROPIC_API_KEY === 'your_api_key_here' ||
                     process.env.REACT_APP_ANTHROPIC_API_KEY.trim() === '';
  
  console.log('Demo mode:', isDemoMode);
  
  if (isDemoMode) {
    // Return demo scenario if available
    const demoScenario = getDemoScenario(selectedRegion, timeFrame);
    if (demoScenario) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(demoScenario + '\n\n[Demo Mode: This is a sample scenario. Add your Anthropic API key to generate custom scenarios.]');
        }, 1500); // Simulate API delay
      });
    }
    
    // Fallback message
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is a demo scenario for ${selectedRegion} in ${timeFrame}. To generate custom scenarios, please add your Anthropic API key to the .env file.\n\n[Demo Mode: Add your API key to generate personalized scenarios based on your selections.]`);
      }, 1500);
    });
  }

  try {
    // Use the proxy server instead of calling the API directly
    // In development, use the full URL to the Express server
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/generate-scenario'
      : '/api/generate-scenario';
      
    console.log('Calling API server:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      
      // If server returns API key error, fall back to demo mode
      if (errorData.error && errorData.error.includes('API key not configured')) {
        console.log('Falling back to demo mode due to server API key error');
        const demoScenario = getDemoScenario(selectedRegion, timeFrame);
        if (demoScenario) {
          return demoScenario + '\n\n[Demo Mode: Server API key not configured. This is a sample scenario.]';
        }
        return `Demo scenario for ${selectedRegion} in ${timeFrame}. Server API key not configured.\n\n[Demo Mode: Configure API key on server for custom scenarios.]`;
      }
      
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.scenario;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // Fall back to demo mode on any error
    console.log('Falling back to demo mode due to error');
    const demoScenario = getDemoScenario(selectedRegion, timeFrame);
    if (demoScenario) {
      return demoScenario + '\n\n[Demo Mode: Server error occurred. This is a sample scenario.]';
    }
    return `Demo scenario for ${selectedRegion} in ${timeFrame}. Server error occurred.\n\n[Demo Mode: Fix server configuration for custom scenarios.]`;
  }
};

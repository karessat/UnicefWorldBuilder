import { regionalInsights } from '../data/regionalInsights';
import { globalScanHits } from '../data/globalScanHits';
import { timeFrameGuidance } from '../data/timeFrameGuidance';
import { getAgeContext } from '../data/ageContexts';
import { getDemoScenario } from '../data/demoScenarios';

export const generatePrompt = (selectedRegion, timeFrame, learnerAge, useExistingScenario, customDirection) => {
  const regional = regionalInsights[selectedRegion];
  const guidance = timeFrameGuidance[timeFrame];
  const ageContext = getAgeContext(learnerAge);

  // Select 55-60 scan hits to include in prompt, ensuring variety and good coverage
  // This provides ~50% of all 119 innovations while keeping prompt manageable
  const shuffledScanHits = [...globalScanHits].sort(() => 0.5 - Math.random());
  const selectedScanHits = shuffledScanHits.slice(0, 58);

  return `MANDATORY REQUIREMENT: The main character in this scenario MUST be exactly ${learnerAge || 'a randomly chosen'} years old. Do NOT use age 15 or any other age. Use ${learnerAge || 'the chosen age'} throughout the entire scenario.

You are helping create an imaginative education scenario for ${timeFrame} based on UNICEF's Youth Foresight Fellows research.

${useExistingScenario ? `
CONTEXT: Young people from ${selectedRegion} have identified key challenges and visions for education futures through the Young Visionaries project.

REGIONAL INSIGHTS FOR ${selectedRegion} (from Youth Foresight Fellows research):
- Current Theme: ${regional.theme}
- Key Challenges: ${regional.currentChallenges}  
- Preferred Future Vision: ${regional.preferredFuture}
- Regional Focus Area: ${regional.scanHit}
` : `
CONTEXT: Create a fresh education scenario for ${selectedRegion} using your knowledge of the region's educational context, cultural factors, socioeconomic conditions, and current challenges.

REGIONAL APPROACH FOR ${selectedRegion}:
- Use your understanding of ${selectedRegion}'s educational system, culture, and context
- Consider region-specific challenges like infrastructure, language, economic factors, and social dynamics
- Ensure the scenario feels authentic to ${selectedRegion}'s educational and cultural environment
`}

CHARACTER REQUIREMENTS (CRITICAL):
${learnerAge ? `- Main character age: EXACTLY ${learnerAge} years old (NOT 15, NOT any other age)` : '- Choose a specific age between 8-17 and state it clearly'}
- Gender: Randomly select male, female, or non-binary (do not default to female)
- Make the character feel authentic to ${selectedRegion}

${ageContext ? `
EDUCATIONAL CONTEXT FOR AGE ${learnerAge}:
- Educational Level: ${ageContext.level}
- Learning Focus: ${ageContext.focus}
- Key Considerations: ${ageContext.considerations}
` : ''}

TIME FRAME GUIDANCE - ${guidance.novelty} (${timeFrame}):
${guidance.description}

AVAILABLE EDUCATIONAL INNOVATIONS TO DRAW FROM:
Select and weave in 3-5 of these researched possibilities that fit your scenario:

${selectedScanHits.map(hit => `• ${hit}`).join('\n')}

INTEGRATION INSTRUCTIONS:
- Don't mention all innovations - select 3-5 that work well together for your specific scenario
- Integrate them naturally into the story rather than listing them
- Show how they work in practice through the character's experience
- Focus on the human impact and learning outcomes, not just the technology

STIRDEEPER FOCUS INSTRUCTIONS:
Focus deeply on just 2-3 STIRDEEPER categories:
- SOCIAL: Changes in how people interact, learn together, and build community
- ENVIRONMENTAL: Climate impacts and sustainability in education
- POLITICAL: Governance, policy, and power structures in education
- EDUCATIONAL: Pedagogical approaches and learning methods
- ECONOMIC: New economic models for education and work
- TECHNOLOGICAL: Innovations that enhance learning (use sparingly)

${useExistingScenario ? `START WITH: Use the existing Young Visionaries scenario vision from ${selectedRegion} as your foundation, but project it forward to ${timeFrame} incorporating relevant innovations from the list above.` : `CREATE NEW: Generate a completely fresh scenario for ${selectedRegion} in ${timeFrame} using your knowledge of the region. Do not use any specific Young Visionaries research - instead rely on your understanding of ${selectedRegion}'s educational context, challenges, and opportunities.`}

${customDirection ? `USER DIRECTION: ${customDirection}` : ''}

FINAL REMINDER: Your main character must be ${learnerAge ? `${learnerAge} years old` : 'the specific age you choose'} - verify this before writing.

Please create a scenario (250-300 words) featuring a ${learnerAge ? `${learnerAge}-year-old` : '[specify age]'} student in ${selectedRegion}, ${timeFrame}.`;
};

export const generateRegeneratePrompt = (selectedRegion, timeFrame, learnerAge, generatedScenario, feedback, useExistingScenario) => {
  const guidance = timeFrameGuidance[timeFrame];
  const regional = regionalInsights[selectedRegion];
  
  // Select a different set of scan hits for regeneration to provide variety
  // Using 50+ ensures good coverage of all 119 total innovations
  const shuffledScanHits = [...globalScanHits].sort(() => 0.5 - Math.random());
  const selectedScanHits = shuffledScanHits.slice(0, 52);

  return `MANDATORY: The main character MUST be exactly ${learnerAge || 'the specified'} years old. Do NOT use age 15 or any other age.

PREVIOUS SCENARIO:
${generatedScenario}

USER FEEDBACK:
What they liked: ${feedback.liked || 'No specific feedback'}
What they want changed: ${feedback.disliked || 'No specific changes requested'}

${useExistingScenario ? `
REGIONAL CONTEXT (from Youth Foresight Fellows research):
- Theme: ${regional.theme}
- Challenges: ${regional.currentChallenges}  
- Vision: ${regional.preferredFuture}
- Focus: ${regional.scanHit}
` : `
REGIONAL CONTEXT: 
Use your knowledge of ${selectedRegion}'s educational system, culture, and socioeconomic context. Do not reference specific Young Visionaries research.
`}

CHARACTER REQUIREMENTS:
${learnerAge ? `- Main character age: EXACTLY ${learnerAge} years old (verify this!)` : '- Use the same specific age from the previous scenario'}
- Gender: Use diverse gender representation

TIME FRAME: ${timeFrame} - ${guidance.displayText}

ADDITIONAL EDUCATIONAL INNOVATIONS TO CONSIDER:
Select new elements from these research-backed possibilities:

${selectedScanHits.map(hit => `• ${hit}`).join('\n')}

INTEGRATION GUIDANCE:
- Choose 3-5 innovations that address the user's feedback
- Integrate them naturally into the improved scenario
- Show concrete examples of how they enhance the learning experience

STIRDEEPER FOCUS: Deep dive into 2-3 categories only (Social, Environmental, Political, Educational, Economic - minimize technology focus)

Create an improved version (250-300 words) that:
- Features a ${learnerAge ? `${learnerAge}-year-old` : '[same age as before]'} character
- Addresses the user feedback specifically
- Maintains regional context for ${selectedRegion}
- Incorporates new relevant educational innovations
- Focuses deeply on fewer changes for greater impact

FINAL CHECK: Verify the character is ${learnerAge ? `${learnerAge} years old` : 'the correct age'} before submitting.`;
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

import React, { useState } from 'react';
import { ChevronDown, Sparkles, RefreshCw, MapPin, Clock, FileText, Lightbulb, ChevronUp, User, Award, Users } from 'lucide-react';
import { regions } from '../data/regionalInsights';
import { timeFrameGuidance, timeFrames } from '../data/timeFrameGuidance';
import { getAgeLabel } from '../data/ageContexts';
import { getFellowInfo } from '../data/youthForesightFellows';
import { generatePrompt, generateRegeneratePrompt, callClaudeAPI } from '../utils/apiService';
import { validateInputSafety } from '../utils/inputSanitization';

// Inspiration suggestions for custom directions
const inspirationSuggestions = {
  "Character Personalization": [
    "Give the student a specific passion or hobby that shapes their learning journey",
    "Include the student's family background and how it influences their education",
    "Show how the student's personality affects their learning experience",
    "Add details about the student's dreams and aspirations for the future"
  ],
  "Scenario Depth": [
    "Explore what a worst-case scenario could look like and how education adapts",
    "Show how this educational approach impacts the wider community",
    "Include perspectives from teachers, parents, and community elders",
    "Focus on how this student's experience differs from their parents' education"
  ],
  "Emotional Dimensions": [
    "Show a moment of breakthrough when the student overcomes a learning barrier",
    "Include friendships and peer relationships that shape the learning experience",
    "Explore how the student's confidence develops through education",
    "Show how the student becomes a mentor or leader for others"
  ],
  "Learning Focus": [
    "Focus on how the student learns to solve real problems in their community",
    "Show the student discovering something unexpected about themselves",
    "Include hands-on projects that connect learning to daily life",
    "Show collaborative learning where students teach each other"
  ],
  "Innovation & Creativity": [
    "Include an educational innovation the student helps design or improve",
    "Show how art, music, or storytelling enhances the learning experience",
    "Explore how the student uses technology in unexpected ways",
    "Show the student inventing something through their education"
  ]
};

const ScenarioGenerator = () => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [useExistingScenario, setUseExistingScenario] = useState(false);
  const [timeFrame, setTimeFrame] = useState('');
  const [learnerAge, setLearnerAge] = useState('');
  const [customDirection, setCustomDirection] = useState('');
  const [generatedScenario, setGeneratedScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState({ liked: '', disliked: '' });
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);

  // Function to copy suggestion to custom direction field
  const copySuggestion = (suggestion) => {
    if (customDirection) {
      setCustomDirection(customDirection + '\n\n' + suggestion);
    } else {
      setCustomDirection(suggestion);
    }
  };

  // Function to validate all user inputs before generation
  const validateInputs = () => {
    // Validate custom direction
    if (customDirection) {
      const customValidation = validateInputSafety(customDirection);
      if (!customValidation.isSafe) {
        const issueMessages = customValidation.issues.map(issue => issue.message).join(' ');
        const suggestions = customValidation.suggestions.join(' ');
        alert(`Please revise your custom direction:\n\n${issueMessages}\n\n${suggestions}`);
        return false;
      }
    }
    
    // Validate age range
    const age = parseInt(learnerAge);
    if (age && (age < 3 || age > 99)) {
      alert('Please enter a realistic age between 3 and 99.');
      return false;
    }
    
    return true;
  };

  // Function to validate feedback inputs
  const validateFeedback = () => {
    if (feedback.liked) {
      const likedValidation = validateInputSafety(feedback.liked);
      if (!likedValidation.isSafe) {
        alert('Please revise your feedback to focus on positive educational elements.');
        return false;
      }
    }
    
    if (feedback.disliked) {
      const dislikedValidation = validateInputSafety(feedback.disliked);
      if (!dislikedValidation.isSafe) {
        alert('Please revise your feedback to suggest constructive improvements.');
        return false;
      }
    }
    
    return true;
  };

  const generateScenario = async () => {
    if (!selectedRegion || !timeFrame) {
      alert('Please select both a region and time frame');
      return;
    }

    // Validate user inputs for safety
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    setShowFeedback(false);

    try {
      const prompt = generatePrompt(selectedRegion, timeFrame, learnerAge, useExistingScenario, customDirection);
      const scenario = await callClaudeAPI(prompt, selectedRegion, timeFrame);
      setGeneratedScenario(scenario);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error generating scenario:', error);
      alert('Error generating scenario. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateScenario = async () => {
    if (!feedback.liked && !feedback.disliked) {
      alert('Please provide some feedback first');
      return;
    }

    // Validate feedback inputs for safety
    if (!validateFeedback()) {
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = generateRegeneratePrompt(selectedRegion, timeFrame, learnerAge, generatedScenario, feedback, useExistingScenario);
      const scenario = await callClaudeAPI(prompt, selectedRegion, timeFrame);
      setGeneratedScenario(scenario);
      setFeedback({ liked: '', disliked: '' });
    } catch (error) {
      console.error('Error regenerating scenario:', error);
      alert('Error regenerating scenario. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">UNICEF Young Visionaries World Builder</h1>
          <p className="text-gray-600">Create imaginative education scenarios using Youth Foresight Fellows research or fresh regional insights</p>
        </div>

        {/* Input Section */}
        <div className="space-y-6 mb-8">
          {/* Region Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              Select Region
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">Choose a region...</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Youth Foresight Fellow Information */}
            {selectedRegion && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                {(() => {
                  const fellowInfo = getFellowInfo(selectedRegion);
                  if (!fellowInfo) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">
                            Young Visionary research conducted by:
                          </p>
                          <p className="text-sm text-gray-700">
                            {fellowInfo.name === '[Fellow Name TBD]' 
                              ? `Youth Foresight Fellow for ${selectedRegion}`
                              : `Youth Foresight Fellow for ${selectedRegion}, ${fellowInfo.name}`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Quote */}
                      <blockquote className="text-sm italic text-gray-700 border-l-3 border-green-300 pl-3 py-1 bg-white/50 rounded-r">
                        "{fellowInfo.quote}"
                      </blockquote>

                      {/* Statistics */}
                      {(fellowInfo.workshops || fellowInfo.participants) && (
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          {fellowInfo.workshops && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-3 h-3" />
                              <span>{fellowInfo.workshops} workshops</span>
                            </div>
                          )}
                          {fellowInfo.participants && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{fellowInfo.participants} participants</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Focus Areas */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Focus Areas:</p>
                        <div className="flex flex-wrap gap-1">
                          {fellowInfo.focusAreas.map((area, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Child Rights */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Child Rights Focus:</p>
                        <div className="flex flex-wrap gap-1">
                          {fellowInfo.childRights.map((right, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                            >
                              {right}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Starting Point Toggle */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <FileText className="w-4 h-4 mr-2 text-green-500" />
              Scenario Approach
            </label>
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="radio"
                  checked={!useExistingScenario}
                  onChange={() => setUseExistingScenario(false)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Create fresh scenario</span>
                  <p className="text-xs text-gray-500">Generate new scenario using AI's knowledge of regional context</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  checked={useExistingScenario}
                  onChange={() => setUseExistingScenario(true)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Build from Young Visionaries research</span>
                  <p className="text-xs text-gray-500">Use specific themes and visions identified by Youth Foresight Fellows</p>
                </div>
              </label>
            </div>
          </div>


          {/* Time Frame */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2 text-purple-500" />
              Time Frame
            </label>
            <div className="flex space-x-4">
              {timeFrames.map((year) => (
                <button
                  key={year}
                  onClick={() => setTimeFrame(year)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    timeFrame === year
                      ? 'bg-purple-100 border-purple-500 text-purple-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            {timeFrame && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">
                  {timeFrameGuidance[timeFrame].displayText}
                </p>
              </div>
            )}
          </div>

          {/* Learner Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age of Learner Featured in Scenario
            </label>
            <input
              type="number"
              value={learnerAge}
              onChange={(e) => setLearnerAge(e.target.value)}
              placeholder="Enter age (e.g., 8, 15, 22)..."
              min="3"
              max="99"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {learnerAge && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  {getAgeLabel(learnerAge)}
                </p>
              </div>
            )}
          </div>

          {/* Custom Direction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Direction (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowInspiration(!showInspiration)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Need inspiration?
                {showInspiration ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>
            <textarea
              value={customDirection}
              onChange={(e) => setCustomDirection(e.target.value)}
              placeholder="Try: 'Show how the student's passion for music shapes their learning' or 'Explore what happens when traditional teaching methods prove more effective than new technology'..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            
            {/* Inspiration Panel */}
            {showInspiration && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">💡 Click any suggestion to add it to your custom direction:</h4>
                <div className="space-y-4">
                  {Object.entries(inspirationSuggestions).map(([category, suggestions]) => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-blue-800 mb-2 uppercase tracking-wide">{category}</h5>
                      <div className="grid gap-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => copySuggestion(suggestion)}
                            className="text-left text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition-colors border border-transparent hover:border-blue-200"
                          >
                            "{suggestion}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Combine multiple suggestions or use them as starting points for your own ideas!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateScenario}
            disabled={!selectedRegion || !timeFrame || isGenerating}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Scenario...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Scenario
              </>
            )}
          </button>
        </div>

        {/* Generated Scenario */}
        {generatedScenario && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Education in {selectedRegion}, {timeFrame}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({useExistingScenario ? 'Based on Young Visionaries research' : 'Fresh scenario'})
              </span>
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="prose prose-gray max-w-none">
                {generatedScenario.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 italic">
                  This scenario was generated by AI based on research from UNICEF's Youth Foresight Fellows. 
                  It represents one possible future and should be used as a starting point for discussion and 
                  further exploration. The content does not constitute official UNICEF policy or educational 
                  recommendations. Users should critically evaluate all scenarios and adapt them to their 
                  local contexts and needs.
                </p>
              </div>
            </div>

            {/* Feedback Section */}
            {showFeedback && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Refine Your Scenario</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What did you like about this scenario?
                    </label>
                    <textarea
                      value={feedback.liked}
                      onChange={(e) => setFeedback({...feedback, liked: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      placeholder="What elements worked well..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to change?
                    </label>
                    <textarea
                      value={feedback.disliked}
                      onChange={(e) => setFeedback({...feedback, disliked: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                      placeholder="What to modify or add..."
                    />
                  </div>
                </div>
                <button
                  onClick={regenerateScenario}
                  disabled={isGenerating}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Scenario
                    </>
                  )}
                </button>
              </div>
            )}
           </div>
         )}

         {/* Safety Information Section */}
         <div className="mt-8 pt-6 border-t border-gray-200">
           <div className="text-center">
             <button
               onClick={() => setShowSafetyInfo(!showSafetyInfo)}
               className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
             >
               🛡️ Learn about how this tool is safeguarded
               {showSafetyInfo ? (
                 <ChevronUp className="w-4 h-4 ml-2" />
               ) : (
                 <ChevronDown className="w-4 h-4 ml-2" />
               )}
             </button>
           </div>

           {/* Safety Information Content */}
           {showSafetyInfo && (
             <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
               <div className="max-w-4xl mx-auto space-y-6">
                 <div className="text-center mb-6">
                   <h3 className="text-xl font-bold text-gray-900 mb-2">🛡️ Safety & Ethics Framework</h3>
                   <p className="text-gray-600">How this tool follows UNESCO's AI Ethics Recommendations</p>
                 </div>

                 {/* UNESCO AI Ethics Principles */}
                 <div className="space-y-4">
                   <div className="bg-white p-4 rounded-lg border border-blue-100">
                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                       👥 Human-Centered Design
                     </h4>
                     <p className="text-sm text-gray-700">
                       Rather than generating scenarios independently, the tool amplifies authentic research from UNICEF's Youth Foresight Fellows across 15 regions. Users maintain control through meaningful choices about region, timeframe, and scenario direction.
                     </p>
                   </div>

                   <div className="bg-white p-4 rounded-lg border border-blue-100">
                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                       🔍 Transparency
                     </h4>
                     <p className="text-sm text-gray-700">
                       All content is clearly identified as AI-generated based on documented research. The tool serves as a synthesis aid, not an authoritative source, with full disclosure of its AI nature and data sources.
                     </p>
                   </div>

                   <div className="bg-white p-4 rounded-lg border border-blue-100">
                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                       ⚖️ Fairness & Non-Discrimination
                     </h4>
                     <p className="text-sm text-gray-700">
                       Geographic representation prioritizes Global South perspectives often underrepresented in AI systems. Built-in safeguards actively prevent discriminatory content while promoting inclusive educational futures.
                     </p>
                   </div>

                   <div className="bg-white p-4 rounded-lg border border-blue-100">
                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                       🎯 Human Agency
                     </h4>
                     <p className="text-sm text-gray-700">
                       Users shape scenarios through input choices and can refine outputs through feedback mechanisms, maintaining human oversight of the creative process.
                     </p>
                   </div>
                 </div>

                 {/* Safety Features Summary */}
                 <div className="mt-8">
                   <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">🔒 Safety Features Summary</h4>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                     {/* Input Protection */}
                     <div className="bg-white p-4 rounded-lg border border-blue-100">
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         🛡️ Input Protection
                       </h5>
                       <ul className="text-sm text-gray-700 space-y-1">
                         <li>• Scans user inputs for 50+ prohibited content patterns</li>
                         <li>• Validates age ranges and prevents excessive input lengths</li>
                         <li>• Blocks prompt injection attempts to override system instructions</li>
                         <li>• Filters both positive and negative feedback for harmful content</li>
                       </ul>
                     </div>

                     {/* Content Safeguards */}
                     <div className="bg-white p-4 rounded-lg border border-blue-100">
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         ✅ Content Safeguards
                       </h5>
                       <ul className="text-sm text-gray-700 space-y-1">
                         <li>• Prevents violent content, promotes peaceful alternatives</li>
                         <li>• Blocks discriminatory scenarios, emphasizes inclusion</li>
                         <li>• Protects against exploitation or harmful educational practices</li>
                         <li>• Ensures cultural sensitivity and respect for diverse perspectives</li>
                         <li>• Maintains focus on constructive, evidence-based educational futures</li>
                       </ul>
                     </div>

                     {/* User Protection */}
                     <div className="bg-white p-4 rounded-lg border border-blue-100 md:col-span-2">
                       <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                         👤 User Protection
                       </h5>
                       <ul className="text-sm text-gray-700 space-y-1">
                         <li>• Clear disclaimers about AI-generated content limitations</li>
                         <li>• User reporting functionality for inappropriate content</li>
                         <li>• Emergency response protocols for harmful content removal</li>
                       </ul>
                     </div>
                   </div>

                   {/* Prominent Reporting Section */}
                   <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                     <div className="text-center">
                       <h5 className="font-bold text-red-900 mb-2 flex items-center justify-center">
                         🚨 Report Concerns or Problematic Content
                       </h5>
                       <p className="text-sm text-red-800 mb-3">
                         If you encounter any inappropriate content or have safety concerns about this tool,<br />
                         please contact us immediately:
                       </p>
                       <div className="bg-white p-3 rounded border border-red-200">
                         <a 
                           href="mailto:info@conceptia.com?subject=UNICEF World Builder - Safety Concern"
                           className="text-lg font-semibold text-red-700 hover:text-red-900 transition-colors"
                         >
                           📧 info@conceptia.com
                         </a>
                       </div>
                       <p className="text-xs text-red-700 mt-2">
                         Your reports help us maintain a safe, educational environment for all users.
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Close Button */}
                 <div className="text-center mt-6">
                   <button
                     onClick={() => setShowSafetyInfo(false)}
                     className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                   >
                     Got it, thanks!
                     <ChevronUp className="w-4 h-4 ml-2" />
                   </button>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
  );
};

export default ScenarioGenerator;

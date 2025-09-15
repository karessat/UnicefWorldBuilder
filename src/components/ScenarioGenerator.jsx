import React, { useState } from 'react';
import { ChevronDown, Sparkles, RefreshCw, MapPin, Clock, FileText } from 'lucide-react';
import { regionalInsights, regions } from '../data/regionalInsights';
import { timeFrameGuidance, timeFrames } from '../data/timeFrameGuidance';
import { getAgeLabel } from '../data/ageContexts';
import { generatePrompt, generateRegeneratePrompt, callClaudeAPI } from '../utils/apiService';

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

  const generateScenario = async () => {
    if (!selectedRegion || !timeFrame) {
      alert('Please select both a region and time frame');
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

          {/* Display Regional Context */}
          {selectedRegion && (
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">
                {useExistingScenario ? `Young Visionaries Research for ${selectedRegion}:` : `Creating fresh scenario for ${selectedRegion}`}
              </h4>
              {useExistingScenario ? (
                <div className="text-sm text-indigo-800 space-y-1">
                  <p><strong>Theme:</strong> {regionalInsights[selectedRegion]?.theme}</p>
                  <p><strong>Key Challenges:</strong> {regionalInsights[selectedRegion]?.currentChallenges}</p>
                  <p><strong>Preferred Future:</strong> {regionalInsights[selectedRegion]?.preferredFuture}</p>
                </div>
              ) : (
                <p className="text-sm text-indigo-800">
                  AI will use its knowledge of {selectedRegion}'s educational system, culture, infrastructure, and socioeconomic context to create an authentic scenario.
                </p>
              )}
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Direction (Optional)
            </label>
            <textarea
              value={customDirection}
              onChange={(e) => setCustomDirection(e.target.value)}
              placeholder="Describe any specific aspects you'd like the scenario to explore..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
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
      </div>
    </div>
  );
};

export default ScenarioGenerator;

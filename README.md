# UNICEF Young Visionaries World Builder

A React-based web application for creating imaginative education scenarios using UNICEF's Youth Foresight Fellows research or fresh regional insights.

## Features

### Dual Mode Functionality
- **Young Visionaries Mode**: Uses specific themes, challenges, and visions identified by Youth Foresight Fellows
- **Fresh Scenario Mode**: Leverages AI's general knowledge of regional educational contexts

### Comprehensive Innovation Coverage
- 119 educational innovations included in the global scan hits
- 55-60 randomly selected innovations per generation (~50% coverage)
- Different sets for regeneration ensuring broad exposure

### Enhanced User Experience
- Clear visual indicators of which mode is selected
- Regional context preview showing what information will be used
- Improved feedback system for scenario refinement
- Proper labeling of generated scenarios showing their source approach

## Project Structure

```
unicef-world-builder/
├── src/
│   ├── components/
│   │   └── ScenarioGenerator.jsx
│   ├── data/
│   │   ├── regionalInsights.js
│   │   ├── globalScanHits.js
│   │   ├── timeFrameGuidance.js
│   │   └── ageContexts.js
│   ├── utils/
│   │   └── apiService.js
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
./setup-env.sh
```
Then edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
```

3. Start the development servers:
```bash
# Option 1: Use the start script (recommended)
./start-dev.sh

# Option 2: Start manually in separate terminals
# Terminal 1: API server
node server.js

# Terminal 2: React app
npm start
```

This will start both the React app (port 3000) and the API server (port 3001).

## Usage

1. **Select Region**: Choose from 15 regions with Youth Foresight Fellows research
2. **Choose Approach**: 
   - "Create fresh scenario" for AI-generated scenarios based on regional knowledge
   - "Build from Young Visionaries research" for scenarios based on specific research themes
3. **Set Time Frame**: Choose from 2035, 2045, or 2055 with different levels of futurism
4. **Specify Learner Age**: Enter the age of the learner featured in the scenario
5. **Add Custom Direction** (optional): Provide specific aspects to explore
6. **Generate Scenario**: Create your education scenario
7. **Refine**: Provide feedback to regenerate and improve the scenario

## API Integration

The application integrates with Anthropic's Claude API to generate scenarios. Due to CORS restrictions, the API calls are proxied through a local Express server.

### Setup:
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it to your `.env` file as `ANTHROPIC_API_KEY`
3. Ensure you have sufficient API credits

### Demo Mode:
- If no API key is provided, the app will show demo scenarios
- Demo scenarios are available for Algeria-2035, Kenya-2045, and India-2055
- This allows you to test the interface without an API key

## Technologies Used

- React 18
- Tailwind CSS for styling
- Lucide React for icons
- Anthropic Claude API for scenario generation

## Data Sources

- **Regional Insights**: Based on UNICEF Youth Foresight Fellows research from 15 countries
- **Global Scan Hits**: 119 educational innovations identified through comprehensive research
- **Time Frame Guidance**: Structured approach to different levels of futurism
- **Age Contexts**: Educational considerations for different age groups

## Contributing

This project is part of UNICEF's Young Visionaries initiative. For contributions or questions, please contact the UNICEF team.

## License

This project is developed for UNICEF's educational initiatives.

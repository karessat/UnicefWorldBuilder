const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Demo scenarios for server-side fallback
const demoScenarios = {
  'Algeria-2035': `In 2035, 14-year-old Amina in Algiers experiences education that has been completely reimagined. Her school has implemented modular adaptive classrooms where students can choose between VR simulations for history lessons and hands-on workshops for science. The overwhelming curriculum density has been replaced with practical learning modules that connect to real-world challenges.

Amina's afternoon is spent in the "Breathing Life" program, where she explores robotics through building solar-powered irrigation systems for local farms. Alumni mentors from engineering backgrounds guide her projects, bridging the gap between academic learning and practical application. The overcrowded classrooms of the past have been replaced with flexible learning pods that adapt to different learning styles.

The school's new approach emphasizes emotional well-being as much as academic achievement. Students like Amina participate in peer-to-peer learning networks, where they teach each other coding skills while developing empathy and collaboration abilities. The alumni mentorship program connects current students with successful graduates who share their career journeys and provide guidance on future pathways.

Amina's favorite innovation is the AI-powered learning hub that adapts to her individual cognitive patterns. Instead of following a rigid curriculum, she can dive deep into topics that interest her while ensuring she develops all necessary skills. The system tracks her progress through authentic assessments rather than standardized tests, focusing on her ability to solve real problems in her community.`,

  'Kenya-2045': `In 2045, 16-year-old Kipchoge in Nairobi experiences education that has evolved far beyond traditional boundaries. His school operates as a "thinking hub" where students and teachers collaborate with AI systems to explore complex ethical dilemmas. The educational approach has transformed how students learn to work alongside artificial intelligence as partners rather than tools.

Kipchoge's day begins with an AI mentor that understands his individual interests in environmental science and his learning preferences. Together, they design solutions for climate adaptation in his community, using advanced simulation tools to test different approaches. The AI doesn't replace human teachers but amplifies their ability to provide personalized guidance.

The school has implemented emotional intelligence as a core competency, with daily practices that help students develop meta-learning capabilities. Kipchoge participates in cross-age learning programs where he mentors younger students in coding while learning from older peers about entrepreneurship. The traditional emphasis on breadth over depth has been replaced with deep, project-based learning that connects to real-world challenges.

One of Kipchoge's most transformative experiences is designing AI systems to explore ethical dilemmas around climate justice. He works with students from other countries through virtual reality environments, collaborating on solutions that address global challenges while respecting local contexts. The school's approach prepares him not just for jobs that exist today, but for roles that will emerge as AI and climate technologies continue to evolve.`,

  'India-2055': `In 2055, 13-year-old Priya in Mumbai experiences education that has been completely reimagined. Her school operates as a safe space where girls can move and think freely, with gender-neutral environments that celebrate all forms of expression and learning. The restrictive school culture of the past has been replaced with flexible learning arrangements that adapt to each student's needs and circumstances.

Priya's learning journey is supported by AI translation technology that eliminates language barriers, allowing her to access knowledge from around the world while maintaining her connection to local culture and values. She participates in cross-cultural collaboration projects that connect her classroom with students across different continents, all working together on solutions to global challenges.

The school has implemented individualized education plans powered by AI, ensuring that students with diverse learning needs receive the support they require. Priya works alongside students with different abilities, learning from teachers who themselves have disabilities and serve as role models. The curriculum emphasizes empathy-building through real-world projects that address community needs.

One of Priya's most powerful experiences is participating in the school's social innovation lab, where students develop solutions to local challenges as part of their core curriculum. She works on projects that address gender equality in her community while learning about entrepreneurship and digital literacy. The school's approach has created an environment where girls like Priya can thrive, free from the constraints that limited their educational opportunities in the past.`
};

// API proxy endpoint
app.post('/api/generate-scenario', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
      // Return demo scenario instead of error
      console.log('No API key configured, returning demo scenario');
      
      // Try to extract region and time frame from prompt for demo scenario
      let demoScenario = null;
      if (prompt.includes('Algeria') && prompt.includes('2035')) {
        demoScenario = demoScenarios['Algeria-2035'];
      } else if (prompt.includes('Kenya') && prompt.includes('2045')) {
        demoScenario = demoScenarios['Kenya-2045'];
      } else if (prompt.includes('India') && prompt.includes('2055')) {
        demoScenario = demoScenarios['India-2055'];
      }
      
      if (demoScenario) {
        return res.json({ 
          scenario: demoScenario + '\n\n[Demo Mode: Server API key not configured. This is a sample scenario.]' 
        });
      }
      
      // Fallback demo message
      return res.json({ 
        scenario: `This is a demo scenario. To generate custom scenarios, please configure your Anthropic API key in the .env file.\n\n[Demo Mode: Server API key not configured.]` 
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    res.json({ scenario: data.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate scenario' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Catch-all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`API Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

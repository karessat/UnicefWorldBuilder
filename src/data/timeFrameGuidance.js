export const timeFrameGuidance = {
  '2035': {
    novelty: 'NEAR-TERM REALISM',
    description: 'Focus on plausible developments that could realistically happen within 10 years. Use current emerging technologies and evolutionary changes to existing systems. Be optimistic but grounded in today\'s trajectory.',
    constraints: 'Avoid breakthrough technologies that don\'t exist yet. Focus on scaling existing innovations, policy changes, and incremental improvements.',
    examples: 'Widespread VR/AR adoption, improved AI tutoring, better internet connectivity, policy reforms, infrastructure improvements',
    displayText: '🔮 Near-term realism: Plausible developments within 10 years'
  },
  '2045': {
    novelty: 'MODERATELY FUTURISTIC',
    description: 'Include developments that are hard to imagine happening within just 10 years but plausible by 2045. Introduce some surprising technological and social changes while maintaining believability.',
    constraints: 'Mix proven technologies with emerging breakthroughs. Include some "wild card" elements that push boundaries but remain scientifically possible.',
    examples: 'Advanced brain-computer interfaces, holographic classrooms, AI teachers with emotional intelligence, bioenhanced learning, space-based schools',
    displayText: '🚀 Moderately futuristic: Some wild cards and hard-to-imagine developments'
  },
  '2055': {
    novelty: 'HIGHLY FUTURISTIC WITH WILD CARDS',
    description: 'Create scenarios that are hard to imagine within the next 20 years. Include genuine "wild card" elements and breakthrough technologies that seem almost science fiction but remain theoretically possible.',
    constraints: 'Be bold and imaginative! Include multiple breakthrough technologies, radical social changes, and unexpected developments. Push the boundaries while keeping scenarios grounded in possibility.',
    examples: 'Consciousness uploading for learning, time-dilated virtual reality, genetic cognitive enhancement, quantum learning networks, post-human educational paradigms',
    displayText: '⚡ Highly futuristic: Bold breakthrough technologies and radical changes'
  }
};

export const timeFrames = Object.keys(timeFrameGuidance);

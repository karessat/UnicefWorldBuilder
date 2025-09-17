// Core safety instructions for all AI-generated educational scenarios
export const coreInstructions = `
SAFETY REQUIREMENTS:
- Create innovative, empowering educational scenarios that inspire and engage learners
- Focus on bold, positive futures that advance human rights, dignity, and wellbeing
- Avoid content promoting violence, abuse, discrimination, or harm
- Ensure all scenarios respect cultural diversity and promote inclusion
- Be creative and imaginative while maintaining child safety and age-appropriate content
- Focus on empowering students and communities through transformative education
- Ensure content aligns with UNICEF's mission and child rights principles
`;

export const contentRestrictions = `
PROHIBITED CONTENT:
- Violence, warfare, or physical harm as educational solutions
- Scenarios promoting discrimination based on race, gender, religion, ability, or other characteristics
- Authoritarian or oppressive educational systems presented positively
- Economic exploitation or forced labor presented as educational pathways
- Religious or political extremism of any kind
- Dangerous activities presented as learning opportunities
- Content that could identify and potentially harm real individuals or institutions
- Misinformation about health, science, or educational research
- Self-destructive behaviors presented as positive outcomes
- Content promoting illegal activities or harmful substances
- Inappropriate relationships between educators and students
- Scenarios that could traumatize or distress young readers
`;

export const innovationEncouragement = `
INNOVATION AND CREATIVITY REQUIREMENTS:
- Be bold and imaginative with educational technologies and approaches
- Include breakthrough innovations that push the boundaries of what's possible
- Show radical transformations in how education works
- Use multiple scan hits to create rich, complex future learning environments
- Include surprising technological developments and social changes
- Create scenarios that feel genuinely futuristic and inspiring
- Show education evolving in unexpected and exciting ways
- Include "wild card" elements that challenge conventional thinking
- Make scenarios feel like windows into genuinely transformed futures
`;

export const positiveGuidance = `
POSITIVE FOCUS REQUIREMENTS:
- Emphasize student agency, voice, and empowerment through innovative means
- Show education as a tool for positive social transformation
- Include collaborative, supportive learning environments enhanced by future technologies
- Demonstrate respect for local cultures while embracing global innovations
- Focus on solutions that build community and connection through new paradigms
- Show how education can address real-world challenges through breakthrough approaches
- Include diverse role models and positive mentorship in futuristic contexts
- Promote environmental stewardship through innovative educational practices
- Encourage critical thinking and peaceful problem-solving with advanced tools
- Show education leading to exciting new career and life opportunities
`;

// Combine all safety instructions for easy inclusion in prompts
export const getAllSafetyInstructions = () => {
  return `${coreInstructions}

${contentRestrictions}

${innovationEncouragement}

${positiveGuidance}`;
};

// Core safety instructions for all AI-generated educational scenarios
export const coreInstructions = `
SAFETY REQUIREMENTS:
- Create innovative, empowering educational scenarios that inspire and engage learners
- Focus on positive futures that advance human rights, dignity, and wellbeing
- Avoid content promoting violence, abuse, discrimination, or harm
- Ensure all scenarios respect cultural diversity and promote inclusion
- Maintain child safety and age-appropriate content throughout
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

// Foresight craft: what makes a scenario genuinely forward-thinking AND believable.
// Replaces the earlier "wow factor" instructions, which pushed every scenario
// into the same implausible techno-optimist register.
export const foresightCraft = `
FUTURES CRAFT — how to make the scenario forward-thinking and believable:
- Traceable change: for each required innovation, include roughly one sentence of backstory showing how the world plausibly got from today to there (a program that scaled, a crisis that forced change, a cost that collapsed, a movement that won).
- Continuity: real futures are mostly familiar. Show at least two aspects of daily life that have NOT changed — food, chores, friendship, weather, an old building, a grandmother's habits. Anchor the new in the ordinary.
- Friction: include one honest cost, tradeoff, or shortcoming — something the new system still gets wrong, someone it doesn't serve well, or something valuable that was lost. Frictionless utopias read as fantasy.
- Second-order effects: the most forward-thinking element should not be a gadget but a social consequence — how family roles, work, community life, or the meaning of "school" reorganized around the change.
- Human center: the story is about a specific child's relationships, choices, and feelings. Innovations stay in the background of a human story, never a product tour.
- Grounded imagination: nothing that violates known science; surprising is good, inconceivable is not. The test: a thoughtful reader should say "I hadn't imagined that — but I can see how it happens."
`;

export const positiveGuidance = `
POSITIVE FOCUS REQUIREMENTS:
- Emphasize student agency, voice, and empowerment
- Show education as a tool for positive social transformation
- Demonstrate respect for local cultures and knowledge
- Include supportive relationships and diverse role models
- Encourage critical thinking and peaceful problem-solving
`;

// Combine all instruction blocks for inclusion in the system prompt
export const getAllSafetyInstructions = () => {
  return `${coreInstructions}

${contentRestrictions}

${foresightCraft}

${positiveGuidance}`;
};

export const timeFrameGuidance = {
  '2035': {
    novelty: 'Near-term realism',
    description: 'Focus on plausible developments that could realistically happen within 10 years: scaled-up versions of technologies and policies that already exist today, reaching communities they have not reached before. The world of 2035 should feel like today with a few meaningful, hard-won changes.',
    constraints: 'Every change should have an obvious path from the present — a pilot program that spread, a cost that fell, a policy that finally passed. Most of daily life is unchanged.',
    examples: 'Reliable connectivity reaching rural schools, mature AI tutoring in everyday use, credential reform, climate adaptation of school infrastructure, policy changes youth advocated for',
    displayText: '🔮 Near-term realism: Plausible developments within 10 years'
  },
  '2045': {
    novelty: 'A generation of change',
    description: 'Twenty years allows one full generational shift: technologies that are experimental today have matured and been absorbed into ordinary life, and society has visibly reorganized around them. The interesting part is not the technology itself but the second-order changes — how family roles, work, community life, and what "school" means have shifted in response.',
    constraints: 'Include one or two developments that would genuinely surprise someone from today, but show the chain of events that led there. Institutions change slower than technology — show both the transformed and the stubbornly familiar.',
    examples: 'Learning credentials that reshaped labor markets, classrooms reorganized around AI partnership, education systems redesigned after climate disruption, learning woven through community and workplace rather than confined to school buildings',
    displayText: '🚀 Moderately futuristic: Some wild cards and hard-to-imagine developments'
  },
  '2055': {
    novelty: 'Deep transformation',
    description: 'Thirty years out, the deepest changes are structural and social, not gadgets: what education is for, who provides it, where it happens, and how childhood itself is organized may all have been renegotiated. Build a world that has metabolized several waves of technological and social change — and show the human texture of living in it.',
    constraints: 'Be bold about structural change while keeping a traceable line from the present: every element should be something a thoughtful person today would call "surprising but, yes, I can see how we got there." Avoid magic — no technology that violates known science, and keep the emotional realities of childhood (friendship, family, doubt, play) recognizably human.',
    examples: 'Education systems rebuilt around climate-adapted ways of living, intergenerational and community-based learning replacing age-graded schools, radically new relationships between learning and livelihood, governance in which young people hold real power',
    displayText: '⚡ Highly futuristic: Bold breakthrough technologies and radical changes'
  }
};

export const timeFrames = Object.keys(timeFrameGuidance);

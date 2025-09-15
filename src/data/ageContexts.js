export const getAgeContext = (age) => {
  if (!age) return null;
  
  const ageNum = parseInt(age);
  if (ageNum <= 5) {
    return {
      level: 'Early Childhood Education',
      focus: 'Play-based learning, social-emotional development, basic literacy and numeracy, creativity and exploration',
      considerations: 'Developmentally appropriate practices, family involvement, safe and nurturing environments, hands-on activities'
    };
  } else if (ageNum <= 11) {
    return {
      level: 'Primary Education',
      focus: 'Foundational literacy and numeracy, STEM exploration, creative expression, social skills development',
      considerations: 'Age-appropriate technology integration, collaborative learning, building confidence and curiosity'
    };
  } else if (ageNum <= 17) {
    return {
      level: 'Secondary Education',
      focus: 'Critical thinking, subject specialization, identity formation, future preparation, peer relationships',
      considerations: 'Academic choice and pathways, extracurricular activities, mental health support, career exploration'
    };
  } else if (ageNum <= 25) {
    return {
      level: 'Tertiary Education',
      focus: 'Specialized knowledge, research skills, independence, career preparation, global perspectives',
      considerations: 'Accessibility and affordability, diverse pathways, real-world application, networking and mentorship'
    };
  } else {
    return {
      level: 'Adult Education',
      focus: 'Skill updating, career transitions, personal enrichment, adapting to change',
      considerations: 'Flexible scheduling, practical application, prior experience recognition, work-life balance'
    };
  }
};

export const getAgeLabel = (age) => {
  const ageNum = parseInt(age);
  if (ageNum <= 5) return '🧸 Early childhood education';
  if (ageNum <= 11) return '📚 Primary education';
  if (ageNum <= 17) return '🎓 Secondary education';
  if (ageNum <= 25) return '🏛️ Tertiary education';
  return '💼 Adult education';
};

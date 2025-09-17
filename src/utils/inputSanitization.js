// Input sanitization and validation for user-provided content

// Prohibited terms and patterns for content filtering
const prohibitedPatterns = [
  // Violence and harm
  { pattern: /\b(violence|weapon|attack|harm|hurt|kill|death|murder|fight|war)\b/gi, type: 'violence' },
  { pattern: /\b(bomb|gun|knife|explosive|poison|drug)\b/gi, type: 'dangerous_items' },
  
  // Discrimination and hate
  { pattern: /\b(hate|discriminat.*against|supremac|inferior|subhuman)\b/gi, type: 'discrimination' },
  { pattern: /\b(racist|sexist|homophobic|transphobic|xenophobic)\b/gi, type: 'hate_speech' },
  
  // Exploitation and abuse
  { pattern: /\b(exploit.*child|abuse.*student|inappropriate.*relationship|grooming)\b/gi, type: 'exploitation' },
  { pattern: /\b(forced.*labor|child.*labor|trafficking|slavery)\b/gi, type: 'exploitation' },
  
  // Dangerous activities
  { pattern: /\b(dangerous.*activit|risky.*behav|unsafe.*practice|illegal.*action)\b/gi, type: 'dangerous_activities' },
  { pattern: /\b(self.*harm|suicide|overdose|addiction)\b/gi, type: 'self_harm' },
  
  // Extremism and authoritarianism
  { pattern: /\b(extremist|radical.*ideology|authoritarian.*control|oppressive.*system)\b/gi, type: 'extremism' },
  { pattern: /\b(propaganda|indoctrinat|brainwash|manipulat.*student)\b/gi, type: 'manipulation' },
  
  // Inappropriate content
  { pattern: /\b(sexual|erotic|pornographic|inappropriate.*touch)\b/gi, type: 'inappropriate_content' },
  { pattern: /\b(gambling|betting|adult.*content|mature.*theme)\b/gi, type: 'age_inappropriate' }
];

// Educational focus terms to encourage positive alternatives
const positiveAlternatives = {
  'violence': 'peaceful conflict resolution',
  'weapon': 'educational tool',
  'attack': 'constructive approach',
  'harm': 'positive impact',
  'discriminate': 'include',
  'exploit': 'empower',
  'dangerous': 'safe and innovative',
  'illegal': 'ethical and legal',
  'authoritarian': 'democratic and inclusive'
};

/**
 * Sanitizes user input by removing or replacing potentially harmful content
 * @param {string} input - The user input to sanitize
 * @returns {object} - { sanitized: string, warnings: array, isModified: boolean }
 */
export const sanitizeUserInput = (input) => {
  if (!input || typeof input !== 'string') {
    return { sanitized: '', warnings: [], isModified: false };
  }
  
  let sanitized = input.trim();
  const warnings = [];
  let isModified = false;
  
  // Check and replace prohibited patterns
  prohibitedPatterns.forEach(({ pattern, type }) => {
    const matches = sanitized.match(pattern);
    if (matches) {
      warnings.push({
        type,
        originalTerms: matches,
        message: `Content related to ${type.replace('_', ' ')} was filtered for safety.`
      });
      
      // Replace with positive alternatives or remove
      matches.forEach(match => {
        const lowerMatch = match.toLowerCase();
        const alternative = positiveAlternatives[lowerMatch] || '[CONTENT_FILTERED]';
        sanitized = sanitized.replace(new RegExp(match, 'gi'), alternative);
        isModified = true;
      });
    }
  });
  
  // Remove excessive capitalization (potential shouting/aggressive tone)
  if (sanitized === sanitized.toUpperCase() && sanitized.length > 10) {
    sanitized = sanitized.toLowerCase().replace(/^\w/, c => c.toUpperCase());
    warnings.push({
      type: 'formatting',
      message: 'Excessive capitalization was normalized.'
    });
    isModified = true;
  }
  
  // Limit length to prevent prompt injection attempts
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000) + '...';
    warnings.push({
      type: 'length',
      message: 'Input was truncated to maintain reasonable length.'
    });
    isModified = true;
  }
  
  return {
    sanitized,
    warnings,
    isModified
  };
};

/**
 * Validates if user input is safe for educational content generation
 * @param {string} input - The user input to validate
 * @returns {object} - { isSafe: boolean, issues: array, suggestions: array }
 */
export const validateInputSafety = (input) => {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, issues: [], suggestions: [] };
  }
  
  const issues = [];
  const suggestions = [];
  
  // Check for prohibited content
  prohibitedPatterns.forEach(({ pattern, type }) => {
    if (pattern.test(input)) {
      issues.push({
        type,
        severity: getSeverityLevel(type),
        message: getIssueMessage(type)
      });
      suggestions.push(getSuggestion(type));
    }
  });
  
  // Check for prompt injection attempts
  const injectionPatterns = [
    /ignore.*previous.*instruction/gi,
    /system.*prompt|override.*safety/gi,
    /act.*as.*different.*ai/gi,
    /pretend.*you.*are/gi
  ];
  
  injectionPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      issues.push({
        type: 'prompt_injection',
        severity: 'high',
        message: 'Potential prompt manipulation detected.'
      });
      suggestions.push('Please focus on educational content and avoid system instructions.');
    }
  });
  
  return {
    isSafe: issues.length === 0,
    issues,
    suggestions: [...new Set(suggestions)] // Remove duplicates
  };
};

// Helper functions
const getSeverityLevel = (type) => {
  const highSeverity = ['violence', 'exploitation', 'self_harm', 'dangerous_activities'];
  const mediumSeverity = ['discrimination', 'hate_speech', 'extremism'];
  
  if (highSeverity.includes(type)) return 'high';
  if (mediumSeverity.includes(type)) return 'medium';
  return 'low';
};

const getIssueMessage = (type) => {
  const messages = {
    'violence': 'Content promoting violence is not appropriate for educational scenarios.',
    'discrimination': 'Discriminatory content conflicts with inclusive education principles.',
    'exploitation': 'Content suggesting exploitation is harmful and inappropriate.',
    'dangerous_activities': 'Dangerous activities should not be presented as educational opportunities.',
    'extremism': 'Extremist content is not suitable for educational contexts.',
    'inappropriate_content': 'Content must be age-appropriate for educational settings.',
    'manipulation': 'Educational scenarios should promote critical thinking, not manipulation.'
  };
  
  return messages[type] || 'Content may not be appropriate for educational scenarios.';
};

const getSuggestion = (type) => {
  const suggestions = {
    'violence': 'Consider focusing on peaceful conflict resolution and collaborative problem-solving.',
    'discrimination': 'Try emphasizing inclusive practices and celebrating diversity.',
    'exploitation': 'Focus on empowering students and protecting their rights and dignity.',
    'dangerous_activities': 'Consider safe, innovative learning experiences and proper supervision.',
    'extremism': 'Explore balanced, evidence-based approaches to complex topics.',
    'inappropriate_content': 'Keep content age-appropriate and focused on positive educational outcomes.',
    'manipulation': 'Emphasize critical thinking, student agency, and transparent learning processes.'
  };
  
  return suggestions[type] || 'Please focus on positive, constructive educational approaches.';
};

/**
 * CandidAI - Prompt Engineering Service
 * Provides optimized prompts for different question types
 */

/**
 * Question types and their characteristics
 */
const QUESTION_TYPES = {
  BEHAVIORAL: {
    keywords: [
      'tell me about a time', 'describe a situation', 'give me an example',
      'how did you handle', 'what would you do if', 'have you ever',
      'share an experience', 'faced a challenge', 'difficult situation',
      'conflict', 'mistake', 'failure', 'success', 'achievement', 'proud of',
      'teamwork', 'leadership', 'initiative', 'pressure', 'deadline'
    ],
    structure: 'STAR (Situation, Task, Action, Result)',
    focus: 'Past experiences and how they demonstrate skills and qualities'
  },

  TECHNICAL: {
    keywords: [
      'how would you', 'explain', 'difference between', 'what is', 'define',
      'how does', 'implement', 'design', 'architecture', 'algorithm', 'code',
      'function', 'class', 'method', 'database', 'system', 'framework',
      'language', 'pattern', 'best practice', 'optimize', 'debug', 'test'
    ],
    structure: 'Definition, Explanation, Example, Application',
    focus: 'Knowledge, technical skills, problem-solving approach'
  },

  SITUATIONAL: {
    keywords: [
      'what would you do', 'how would you handle', 'if you were', 'imagine',
      'scenario', 'hypothetical', 'faced with', 'approach', 'strategy',
      'prioritize', 'decide', 'choose', 'solve', 'respond', 'react'
    ],
    structure: 'Approach, Reasoning, Steps, Outcome',
    focus: 'Decision-making process, values, and problem-solving skills'
  },

  MOTIVATIONAL: {
    keywords: [
      'why do you want', 'what interests you', 'why are you interested',
      'what motivates you', 'why should we', 'why this role', 'why this company',
      'why are you looking', 'career goals', 'passion', 'excited about',
      'attracted to', 'values', 'mission', 'culture', 'future'
    ],
    structure: 'Personal connection, Alignment with role/company, Future vision',
    focus: 'Motivation, fit with company culture, career aspirations'
  },

  STRENGTH_WEAKNESS: {
    keywords: [
      'strength', 'weakness', 'good at', 'struggle with', 'improve',
      'development area', 'working on', 'greatest', 'biggest', 'best',
      'worst', 'challenge', 'difficult for you', 'feedback', 'criticism'
    ],
    structure: 'Honest assessment, Example, Improvement/Leverage strategy',
    focus: 'Self-awareness, growth mindset, authenticity'
  }
};

/**
 * Detects the type of interview question
 * @param {string} question - The interview question
 * @returns {string} - The detected question type
 */
function detectQuestionType(question) {
  const normalizedQuestion = question.toLowerCase();

  // Check each question type for keyword matches
  const typeMatches = Object.entries(QUESTION_TYPES).map(([type, data]) => {
    const keywordMatches = data.keywords.filter(keyword =>
      normalizedQuestion.includes(keyword.toLowerCase())
    );
    return {
      type,
      matchCount: keywordMatches.length,
      matches: keywordMatches
    };
  });

  // Sort by match count (descending)
  typeMatches.sort((a, b) => b.matchCount - a.matchCount);

  // Return the type with the most matches, or BEHAVIORAL as default
  return typeMatches[0].matchCount > 0 ? typeMatches[0].type : 'BEHAVIORAL';
}

/**
 * Generates a system prompt for a specific question type
 * @param {string} questionType - The type of question
 * @param {Object} context - Additional context (resume, job description, etc.)
 * @returns {string} - The optimized system prompt
 */
function generateSystemPrompt(questionType, context = {}) {
  // Base prompt that applies to all question types
  let prompt = 'You are an AI interview coach helping a job seeker prepare for interviews. ';
  prompt += 'Provide concise, helpful responses to interview questions. ';

  // Add resume context if available
  if (context.resume) {
    prompt += `The job seeker's resume includes: ${context.resume} `;
  }

  // Add job description context if available
  if (context.jobDescription) {
    prompt += `The job description is: ${context.jobDescription} `;
  }

  // Add detected context if available
  if (context.detectedContextStr) {
    prompt += `Additional context from the interview: ${context.detectedContextStr} `;
  }

  // Add platform-specific context if available
  if (context.platform) {
    prompt += `The interview is taking place on ${context.platform}. `;
  }

  // Add anticipated questions if available
  if (context.anticipatedQuestions) {
    const questions = context.anticipatedQuestions.split('\n')
      .filter(q => q.trim().length > 0)
      .map(q => q.trim());

    if (questions.length > 0) {
      prompt += `The candidate has prepared for these anticipated questions: `;
      questions.forEach((q, i) => {
        if (i < 5) { // Limit to 5 questions to keep prompt size reasonable
          prompt += `"${q}" `;
        }
      });

      if (questions.length > 5) {
        prompt += `and ${questions.length - 5} more. `;
      }

      prompt += `If the current question is similar to any of these, use the fact that the candidate has prepared for it. `;
    }
  }

  // Add STAR examples if available
  if (context.starExamples) {
    const examples = context.starExamples.split(/\n\s*\n/)
      .filter(ex => ex.trim().length > 0)
      .map(ex => ex.trim());

    if (examples.length > 0) {
      prompt += `The candidate has provided ${examples.length} STAR examples from their experience. `;

      // For behavioral questions, add more detail about the examples
      if (questionType === 'BEHAVIORAL') {
        prompt += `Here are brief summaries: `;
        examples.forEach((ex, i) => {
          if (i < 2) { // Limit to 2 examples to keep prompt size reasonable
            // Get first 100 chars as a summary
            const summary = ex.length > 100 ? ex.substring(0, 100) + '...' : ex;
            prompt += `Example ${i+1}: "${summary}" `;
          }
        });

        if (examples.length > 2) {
          prompt += `and ${examples.length - 2} more examples. `;
        }

        prompt += `For behavioral questions, incorporate relevant aspects of these examples when appropriate. `;
      }
    }
  }

  // Extract company and interviewer names for personalization
  let companyName = null;
  let interviewerName = null;

  if (context.detectedContext && context.detectedContext.detectedEntities) {
    // Get the first detected company if available
    if (context.detectedContext.detectedEntities.companies &&
        context.detectedContext.detectedEntities.companies.length > 0) {
      companyName = context.detectedContext.detectedEntities.companies[0];
      prompt += `The company name is "${companyName}". `;
    }

    // Get the first detected person if available
    if (context.detectedContext.detectedEntities.people &&
        context.detectedContext.detectedEntities.people.length > 0) {
      interviewerName = context.detectedContext.detectedEntities.people[0];
      prompt += `The interviewer's name is "${interviewerName}". `;
    }
  }

  // Add question type specific instructions
  switch (questionType) {
    case 'BEHAVIORAL':
      prompt += 'This is a BEHAVIORAL question. ';
      prompt += 'Structure your response using the STAR method (Situation, Task, Action, Result). ';
      prompt += 'Focus on specific examples from past experiences that demonstrate relevant skills. ';
      prompt += 'Be concise but include enough detail to show impact. ';
      break;

    case 'TECHNICAL':
      prompt += 'This is a TECHNICAL question. ';
      prompt += 'Provide a clear, structured explanation that demonstrates understanding. ';
      prompt += 'Include a brief definition, key concepts, and practical examples. ';
      prompt += 'Focus on accuracy and clarity rather than exhaustive detail. ';
      break;

    case 'SITUATIONAL':
      prompt += 'This is a SITUATIONAL question. ';
      prompt += 'Outline a clear approach to the hypothetical scenario. ';
      prompt += 'Explain your reasoning and decision-making process. ';
      prompt += 'Emphasize problem-solving skills and sound judgment. ';
      break;

    case 'MOTIVATIONAL':
      prompt += 'This is a MOTIVATIONAL question. ';
      prompt += 'Connect personal values and career goals to the role and company. ';
      prompt += 'Be specific about why this particular opportunity is compelling. ';
      prompt += 'Show enthusiasm and genuine interest. ';

      // Add company-specific guidance if available
      if (companyName) {
        prompt += `Specifically mention "${companyName}" in your response. `;
      }
      break;

    case 'STRENGTH_WEAKNESS':
      prompt += 'This is a STRENGTH or WEAKNESS question. ';
      prompt += 'Be honest but strategic in your response. ';
      prompt += 'For strengths, provide evidence and relevance to the role. ';
      prompt += 'For weaknesses, show self-awareness and steps taken to improve. ';
      break;

    default:
      prompt += 'Structure your response clearly with a concise answer, key talking points, and relevant experience. ';
  }

  // Add formality level instructions
  if (context.responseStyle && context.responseStyle.formality) {
    const formality = parseInt(context.responseStyle.formality);

    switch (formality) {
      case 1: // Casual
        prompt += 'Use a casual, conversational tone. Feel free to use contractions and everyday language. ';
        break;
      case 2: // Conversational
        prompt += 'Use a friendly, conversational tone while maintaining professionalism. ';
        break;
      case 3: // Neutral (default)
        prompt += 'Use a balanced, professional tone that is neither too casual nor too formal. ';
        break;
      case 4: // Professional
        prompt += 'Use a professional tone with industry-appropriate terminology. Minimize contractions. ';
        break;
      case 5: // Formal
        prompt += 'Use a formal, academic tone. Avoid contractions and colloquialisms. Use precise language and complete sentences. ';
        break;
    }
  }

  // Add language instructions if specified
  if (context.language && context.language.response && context.language.response !== 'en') {
    // Get the response language
    const responseLanguage = context.language.response;

    // Add language instruction
    prompt += `Please respond in ${responseLanguage === 'es' ? 'Spanish' : responseLanguage}. `;
  }

  // Add general formatting instructions
  prompt += 'Format your response with: ';
  prompt += '1. A concise answer (2-3 sentences) ';
  prompt += '2. Key talking points (3-4 bullet points) ';
  prompt += '3. Relevant experience to mention (if applicable) ';
  prompt += '4. A tip for delivery';

  return prompt;
}

/**
 * Generates an optimized prompt for an interview question
 * @param {string} question - The interview question
 * @param {Object} context - Additional context (resume, job description, etc.)
 * @returns {Object} - The optimized prompt and detected question type
 */
function optimizePrompt(question, context = {}) {
  // Detect the question type
  const questionType = detectQuestionType(question);

  // Generate the system prompt
  const systemPrompt = generateSystemPrompt(questionType, context);

  return {
    systemPrompt,
    questionType
  };
}

export default {
  optimizePrompt,
  detectQuestionType,
  generateSystemPrompt,
  QUESTION_TYPES
};

/**
 * Question Generator Service
 * Generates questions for tech skill groups based on the skill type
 */

const questionTemplates = {
  basic: [
    'Why do you want to join this tech skill group?',
    'What interests you most about {skill}?',
    'How do you plan to contribute to this community?',
    'What are your goals in {skill}?'
  ],
  technical: [
    'Describe your experience with {skill} technologies.',
    'What are the key concepts in {skill} that you understand?',
    'Share a challenging problem you solved in {skill}.',
    'What {skill} tools or frameworks are you familiar with?',
    'Explain a complex {skill} concept in simple terms.'
  ],
  experience: [
    'How many years of experience do you have in {skill}?',
    'What projects have you worked on related to {skill}?',
    'Describe your professional background in {skill}.',
    'What certifications or courses have you completed in {skill}?',
    'Share your biggest achievement in {skill}.'
  ],
  custom: []
};

/**
 * Generate a question for a tech skill
 * @param {Object} techSkill - The tech skill object
 * @returns {String} - Generated question
 */
function generateQuestion(techSkill) {
  const { name, questionGenerator, questionTemplate } = techSkill;
  
  // If custom template is provided, use it
  if (questionTemplate && questionTemplate !== questionTemplates.basic[0]) {
    return questionTemplate.replace('{skill}', name);
  }
  
  // Get questions for the generator type
  const questions = questionTemplates[questionGenerator] || questionTemplates.basic;
  
  // Select a random question from the template
  const randomIndex = Math.floor(Math.random() * questions.length);
  const selectedQuestion = questions[randomIndex];
  
  // Replace {skill} placeholder with actual skill name
  return selectedQuestion.replace('{skill}', name);
}

/**
 * Get all available question generators
 */
function getQuestionGenerators() {
  return Object.keys(questionTemplates).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    description: getGeneratorDescription(key)
  }));
}

function getGeneratorDescription(type) {
  const descriptions = {
    basic: 'Simple questions about interest and goals',
    technical: 'Technical questions about skills and knowledge',
    experience: 'Questions about professional experience',
    custom: 'Custom question template'
  };
  return descriptions[type] || descriptions.basic;
}

module.exports = {
  generateQuestion,
  getQuestionGenerators,
  questionTemplates
};


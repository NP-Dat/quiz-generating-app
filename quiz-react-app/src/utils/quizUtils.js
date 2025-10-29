/**
 * Quiz Utilities
 * Helper functions for quiz operations
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled copy of the array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Shuffles questions array for randomized quiz experience
 * @param {Array} questions - Array of question objects
 * @returns {Array} Shuffled questions array
 */
export const shuffleQuestions = (questions) => {
  return shuffleArray(questions);
};

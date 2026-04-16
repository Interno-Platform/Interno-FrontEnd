export const mockExtractSkills = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return {
    success: true,
    extractedSkills: [
      'React.js',
      'JavaScript',
      'HTML/CSS',
      'Node.js',
      'Python',
      'SQL',
      'Git',
      'REST APIs',
      'Problem Solving',
      'Team Collaboration',
      'Communication',
    ],
  };
};

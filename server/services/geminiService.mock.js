// Mock version of Gemini service for testing without valid API key

// Function to enhance item description using mock data
async function enhanceItemDescription(originalDescription, itemTitle, itemCategory) {
  try {
    // Mock enhancement logic based on examples
    if (originalDescription.toLowerCase().includes('calci') || originalDescription.toLowerCase().includes('calculator')) {
      return 'Scientific calculator used for two semesters, in good working condition and suitable for first-year engineering subjects.';
    }
    
    if (originalDescription.toLowerCase().includes('book') || originalDescription.toLowerCase().includes('notes')) {
      return `Well-maintained ${itemCategory.toLowerCase()} in excellent condition, perfect for ${itemTitle} studies with comprehensive notes and highlights.`;
    }
    
    if (originalDescription.toLowerCase().includes('used') || originalDescription.toLowerCase().includes('old')) {
      return `${itemTitle} in good used condition, fully functional and ideal for students looking for affordable options.`;
    }
    
    // Default enhancement
    return `${itemTitle} - ${originalDescription}. This item is in good condition and ready for immediate use.`;
  } catch (error) {
    console.error('Error enhancing item description:', error);
    return originalDescription;
  }
}

// Function to categorize and tag doubts using mock data
async function categorizeAndTagDoubt(doubtTitle, doubtContent) {
  try {
    const titleLower = doubtTitle.toLowerCase();
    const contentLower = doubtContent.toLowerCase();
    
    // Mock categorization logic
    let category = 'General';
    let tags = [];
    
    if (titleLower.includes('drawing') || titleLower.includes('projection') || contentLower.includes('engineering drawing')) {
      category = 'Engineering Drawing';
      tags = ['#FirstYear', '#Projections', '#Exams'];
    }
    else if (titleLower.includes('dsa') || contentLower.includes('data structure') || contentLower.includes('algorithm')) {
      category = 'DSA';
      tags = ['#Programming', '#Algorithms', '#Placements'];
    }
    else if (titleLower.includes('internship') || contentLower.includes('internship')) {
      category = 'Internships';
      tags = ['#Career', '#Placements', '#SummerInternship'];
    }
    else if (titleLower.includes('exam') || contentLower.includes('exam')) {
      category = 'Exams';
      tags = ['#Preparation', '#StudyTips', '#Academics'];
    }
    else if (titleLower.includes('placement') || contentLower.includes('placement')) {
      category = 'Placements';
      tags = ['#Jobs', '#Interview', '#Career'];
    }
    else if (titleLower.includes('project') || contentLower.includes('project')) {
      category = 'Projects';
      tags = ['#TeamWork', '#Innovation', '#Academics'];
    }
    
    return {
      category: category,
      tags: tags
    };
  } catch (error) {
    console.error('Error categorizing doubt:', error);
    return {
      category: 'General',
      tags: []
    };
  }
}

// Function to summarize opportunities using mock data
async function summarizeOpportunity(opportunityData) {
  try {
    const { title, deadline, skills, teamSize, mode } = opportunityData;
    
    // Mock summary format
    const summary = `
Deadline: ${deadline}
Skills: ${skills}
Team Size: ${teamSize}
Mode: ${mode}
`;
    
    return summary;
  } catch (error) {
    console.error('Error summarizing opportunity:', error);
    return '';
  }
}

module.exports = {
  enhanceItemDescription,
  categorizeAndTagDoubt,
  summarizeOpportunity
};
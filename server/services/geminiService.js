const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to enhance item description using Gemini
async function enhanceItemDescription(originalDescription, itemTitle, itemCategory) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an AI assistant helping students write better marketplace listings.
      
      Original description: "${originalDescription}"
      Item title: "${itemTitle}"
      Category: "${itemCategory}"
      
      Please rewrite this description to:
      1. Make it clear and professional
      2. Fix any grammar or spelling errors
      3. Make it more trustworthy and appealing
      4. Keep it concise and student-friendly
      5. Include relevant details about condition, usage, and suitability
      
      Example transformation:
      Input: "calci used 2 sem"
      Output: "Scientific calculator used for two semesters, in good working condition and suitable for first-year engineering subjects."
      
      Enhanced description:
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedDescription = response.text();
    
    return enhancedDescription;
  } catch (error) {
    console.error('Error enhancing item description:', error);
    // Return original description if enhancement fails
    return originalDescription;
  }
}

// Function to categorize and tag doubts using Gemini
async function categorizeAndTagDoubt(doubtTitle, doubtContent) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an AI assistant helping categorize and tag student doubts.
      
      Doubt title: "${doubtTitle}"
      Doubt content: "${doubtContent}"
      
      Please analyze this doubt and provide:
      1. Category: One of [DSA, Drawing, Exams, Internships, Academics, General, Placements, Projects]
      2. Tags: 2-4 relevant hashtags (e.g., #FirstYear, #Projections, #Exams)
      
      Example:
      Doubt: "How to prepare projections for engg drawing?"
      Category: Engineering Drawing
      Tags: #FirstYear #Projections #Exams
      
      Format your response as:
      Category: [category]
      Tags: [tag1], [tag2], [tag3]
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    // Parse the response
    const categoryMatch = analysis.match(/Category:\s*([^\n]+)/);
    const tagsMatch = analysis.match(/Tags:\s*([^\n]+)/);
    
    return {
      category: categoryMatch ? categoryMatch[1].trim() : 'General',
      tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : []
    };
  } catch (error) {
    console.error('Error categorizing doubt:', error);
    return {
      category: 'General',
      tags: []
    };
  }
}

// Function to summarize opportunities using Gemini
async function summarizeOpportunity(opportunityData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const { title, description, deadline, skills, teamSize, mode } = opportunityData;
    
    const prompt = `
      You are an AI assistant helping summarize competition/opportunity posts.
      
      Opportunity title: "${title}"
      Description: "${description}"
      Deadline: "${deadline}"
      Skills: "${skills}"
      Team size: "${teamSize}"
      Mode: "${mode}"
      
      Please extract and summarize this opportunity into a concise format:
      1. Deadline: [formatted date]
      2. Skills: [comma-separated key skills]
      3. Team Size: [size or range]
      4. Mode: [Online/Offline/Hybrid]
      
      Example transformation:
      Input: Long paragraph about a hackathon
      Output:
      Deadline: 12 Oct
      Skills: Frontend, ML
      Team Size: 3-4
      Mode: Online
      
      Summary:
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
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
const { enhanceItemDescription, categorizeAndTagDoubt, summarizeOpportunity } = require('./services/geminiService.mock');

async function testGeminiFeatures() {
  console.log('Testing Gemini AI Features...\n');
  
  // Test 1: Smart Item Description Assistant
  console.log('1. Testing Smart Item Description Assistant:');
  const originalDescription = 'calci used 2 sem';
  const itemTitle = 'Scientific Calculator';
  const itemCategory = 'Calculators';
  
  try {
    const enhancedDescription = await enhanceItemDescription(originalDescription, itemTitle, itemCategory);
    console.log('Original:', originalDescription);
    console.log('Enhanced:', enhancedDescription);
    console.log('✅ Smart Item Description Assistant working!\n');
  } catch (error) {
    console.error('❌ Error in Smart Item Description Assistant:', error.message);
  }
  
  // Test 2: Doubt Categorization & Smart Tagging
  console.log('2. Testing Doubt Categorization & Smart Tagging:');
  const doubtTitle = 'How to prepare projections for engg drawing?';
  const doubtContent = 'I need help understanding how to draw engineering projections for my first year exams.';
  
  try {
    const { category, tags } = await categorizeAndTagDoubt(doubtTitle, doubtContent);
    console.log('Doubt:', doubtTitle);
    console.log('Category:', category);
    console.log('Tags:', tags);
    console.log('✅ Doubt Categorization & Smart Tagging working!\n');
  } catch (error) {
    console.error('❌ Error in Doubt Categorization:', error.message);
  }
  
  // Test 3: Opportunity Summarizer
  console.log('3. Testing Opportunity Summarizer:');
  const opportunityData = {
    title: 'HackMIT 2025',
    type: 'Hackathon',
    mode: 'Online',
    deadline: '2025-10-12',
    teamSize: '3-4',
    skills: 'Frontend, ML, UI/UX Design',
    description: 'HackMIT is an annual hackathon organized by MIT students. This year we are focusing on AI and machine learning applications. Participants will have 48 hours to build innovative projects. There are cash prizes, mentorship opportunities, and potential internships for winning teams.'
  };
  
  try {
    const summary = await summarizeOpportunity(opportunityData);
    console.log('Opportunity:', opportunityData.title);
    console.log('Summary:', summary);
    console.log('✅ Opportunity Summarizer working!\n');
  } catch (error) {
    console.error('❌ Error in Opportunity Summarizer:', error.message);
  }
  
  console.log('All Gemini AI features tested!');
}

testGeminiFeatures().catch(console.error);
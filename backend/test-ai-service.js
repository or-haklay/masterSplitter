require('dotenv').config();
const { analyzeMessageForExpense } = require('./services/aiService');

async function test() {
    console.log('🧪 Testing AI Service...\n');
    
    // Test 1: Simple expense
    console.log('Test 1: "סושי 50"');
    const result1 = await analyzeMessageForExpense('סושי 50', 'TestUser');
    console.log('Result:', JSON.stringify(result1, null, 2));
    console.log('');
    
    // Test 2: Another expense
    console.log('Test 2: "חומוס 30 שקל"');
    const result2 = await analyzeMessageForExpense('חומוס 30 שקל', 'TestUser');
    console.log('Result:', JSON.stringify(result2, null, 2));
    console.log('');
    
    // Test 3: Non-expense
    console.log('Test 3: "שלום מה נשמע"');
    const result3 = await analyzeMessageForExpense('שלום מה נשמע', 'TestUser');
    console.log('Result:', JSON.stringify(result3, null, 2));
}

test().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
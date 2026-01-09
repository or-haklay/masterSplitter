// services/aiService.js
const OpenAI = require('openai');

async function analyzeMessageForExpense(text, senderName) {
    console.log(`🔍 DEBUG: Analyzing with GPT-5-Nano: ${text}`);
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ OPENAI_API_KEY is missing!");
        return { is_expense: false };
    }
    console.log(`🔑 Using API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);

    // Create client fresh each time to ensure env vars are loaded
    const openai = new OpenAI({
        apiKey: apiKey,
    });

    try {
        const response = await openai.responses.create({
            prompt: {
                "id": "pmpt_69399eb0f1908196b592104ad2687b8a038b42e5e1b5b5b8",
                "version": "4"
            },
            input: [
                { 
                    role: "user", 
                    content: `${text}`
                }
            ], 
            reasoning: {},
            store: true
        });
        console.log("🔍 DEBUG: Raw Response Structure:", response);
        
        const rawResult = response.output_text.replace(/,\s*}/g, '}');
        const parsedAI = JSON.parse(rawResult);
        console.log("🔍 DEBUG: Parsed AI:", parsedAI);

        if (parsedAI.is_expenses === true || parsedAI.is_expense === true) {
            console.log("RETURN: YES");
            return {
                is_expense: true,
                amount: parsedAI.amount,
                title: parsedAI.title || parsedAI.description || "הוצאה ללא תיאור",
                payerName: senderName,
                rawMessage: text
            };
        } else {
            console.log("RETURN: NO");
            return { is_expense: false };
        }

    } catch (error) {
        console.error("⚠️ AI Analysis Failed:", error.message);
        if (error.response) {
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        return { is_expense: false };
    }
}

module.exports = { analyzeMessageForExpense };
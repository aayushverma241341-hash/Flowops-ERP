require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testHistoryCrash() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const functionDeclarations = [{
    name: "get_employee_count",
    description: "Returns the total number of employees registered in the ERP system.",
    parameters: { type: "OBJECT", properties: {} }
  }];

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      tools: [{ functionDeclarations }]
    });

    const mockHistoryFromFrontend = [
      { role: 'user', parts: [{ text: "employees" }] },
      { role: 'model', parts: [{ text: "I'm having trouble connecting to my external AI brain right now." }], isOffline: true }
    ];

    const chat = model.startChat({
      history: mockHistoryFromFrontend,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.5 },
    });

    console.log("Sending new message with history attached...");
    const result = await chat.sendMessage("How many employees do we have?");
    console.log("SUCCESS!");

  } catch (error) {
    console.error("❌ CRASH:", error.message);
  }
}

testHistoryCrash();

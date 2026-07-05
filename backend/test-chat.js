require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, '../schema.sql');
const dbSchema = fs.readFileSync(schemaPath, 'utf8');

async function testChatRouteSimulation() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const functionDeclarations = [{
    name: "execute_sql_query",
    description: "Executes a raw PostgreSQL query on the ERP database and returns the result rows. You have FULL ACCESS.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING" }
      },
      required: ["query"]
    }
  }];

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      tools: [{ functionDeclarations }],
      systemInstruction: "You are the FlowOps AI Database Agent. Schema: \n" + dbSchema
    });

    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.5 },
    });

    console.log("Sending message: 'Can you show me the name of the first employee?'");
    const result = await chat.sendMessage("Can you show me the name of the first employee?");
    console.log("First RESPONSE SUCCESS!");
    
    const calls = result.response.functionCalls ? result.response.functionCalls() : null;
    const call = (calls && calls.length > 0) ? calls[0] : null;
    if (call) {
      console.log(`Executing function: ${call.name}, with ID: ${call.id}`);
      const secondResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: { count: 42 },
          id: call.id // Include ID if present
        }
      }]);
      console.log("SECOND RESPONSE SUCCESS!");
      console.log(secondResult.response.text());
    }

  } catch (error) {
    console.error("❌ CRASH DURING CHAT ROUTE SIMULATION:");
    console.error(error.message);
    if (error.stack) console.error(error.stack);
  }
}

testChatRouteSimulation();

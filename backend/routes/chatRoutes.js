const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const fs = require('fs');
const path = require('path');

// Load database schema for AI injection
const schemaPath = path.join(__dirname, '../../schema.sql');
let dbSchema = "Schema not loaded";
try {
  dbSchema = fs.readFileSync(schemaPath, 'utf8');
} catch (err) {
  console.error("Warning: Could not load schema.sql for AI context", err.message);
}

// Define the universal SQL execution tool
const functionDeclarations = [
  {
    name: "execute_sql_query",
    description: "Executes a raw PostgreSQL query on the ERP database and returns the result rows. You have FULL ACCESS. Use this to answer ANY question about data or to INSERT/UPDATE/DELETE data if requested by the user.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "The raw PostgreSQL query to execute (e.g., SELECT * FROM employees)"
        }
      },
      required: ["query"]
    }
  }
];

// Implementation of the function
const functions = {
  execute_sql_query: async ({ query }) => {
    try {
      console.log(`[AI Executing SQL]: ${query}`);
      const result = await db.query(query);
      return { 
        success: true, 
        rowCount: result.rowCount, 
        rows: result.rows,
        message: result.command !== 'SELECT' ? `${result.command} executed successfully on ${result.rowCount} rows.` : undefined
      };
    } catch (err) {
      console.error(`[AI SQL Error]:`, err.message);
      return { error: err.message };
    }
  }
};

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      text: "⚠️ **System Notice**: The Gemini API key is missing. Please add `GEMINI_API_KEY` to your backend `.env` file to enable the AI Agent. Until then, I am running in Offline Mode.",
      isOffline: true
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // System instruction to guide the AI
    const systemInstruction = `You are the FlowOps AI Database Agent. You have FULL ACCESS to a PostgreSQL ERP Database.
Here is the exact schema of the database you are managing:
\`\`\`sql
${dbSchema}
\`\`\`
When the user asks a question, write the appropriate SQL query and use the execute_sql_query tool to run it.
If the user asks to add, update, or delete data, use the tool to run INSERT, UPDATE, or DELETE queries!
Never show the user the raw JSON tool response, always synthesize it into a natural, helpful conversational answer using markdown tables if there is a lot of data.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      tools: [{ functionDeclarations }],
      systemInstruction: systemInstruction
    });

    // Gemini requires the history to start with a 'user' message. 
    // If the frontend sent an initial greeting from the 'model', strip it out.
    let validHistory = history || [];
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory = validHistory.slice(1);
    }
    
    // Sanitize history to strictly match Gemini schema (remove custom properties like isOffline)
    const sanitizedHistory = validHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    const chat = model.startChat({
      history: sanitizedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.5,
      },
    });

    // Send the user's message
    const result = await chat.sendMessage(message);
    let response = result.response;

    // Check if the model wants to call a function safely
    const calls = response.functionCalls ? response.functionCalls() : null;
    const call = (calls && calls.length > 0) ? calls[0] : null;

    if (call) {
      console.log(`[AI Agent] Executing function: ${call.name}`);
      
      // Execute the requested backend function
      const apiResponse = await functions[call.name](call.args);
      
      // Send the function result back to the model to get a natural language response
      const secondResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: apiResponse,
          id: call.id
        }
      }]);
      
      response = secondResult.response;
    }

    res.json({
      text: response.text(),
      history: await chat.getHistory()
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    
    // Smart Fallback Mode for Demonstration if API Key fails
    let fallbackText = "I'm having trouble connecting to my external AI brain right now. Please check your API Key!";
    
    // Add debug info to help resolve the issue
    fallbackText += `\n\n*(Debug Error: ${error.message})*`;

    res.json({
      text: fallbackText,
      isOffline: true
    });
  }
});

module.exports = router;

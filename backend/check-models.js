require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAllAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Contacting Google to list all available models for this key...");
    
    // The SDK might not have a direct listModels exposed nicely without using the REST endpoint,
    // but let's try a direct fetch to the REST endpoint using the key to be absolutely sure.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }
    
    const data = await response.json();
    console.log("SUCCESS! Here are the models your key can access:");
    data.models.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
    });
    
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}

listAllAvailableModels();

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    return;
  }
  
  console.log(`✅ Key format accepted (Starts with ${apiKey.substring(0, 4)})`);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  let successModel = null;
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🤖 Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Reply with YES");
      console.log(`✅ SUCCESS! Model ${modelName} works.`);
      successModel = modelName;
      break; // Stop testing if we found one that works
    } catch (e) {
      console.log(`❌ FAILED on ${modelName}: ${e.message.split('\n')[0]}`);
    }
  }
  
  if (successModel) {
    console.log(`\n🎉 CONCLUSION: Your API key is perfectly valid!`);
    console.log(`👉 You should use '${successModel}' as your model name in the code.`);
  } else {
    console.log(`\n❌ CONCLUSION: Your API key was rejected by EVERY model. Either the key is inactive, or you are in a country where Google AI Studio is blocked.`);
  }
}

testAllModels();

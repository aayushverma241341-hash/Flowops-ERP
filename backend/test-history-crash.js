async function testHistoryCrash() {
  try {
    const history = [
      { role: 'model', parts: [{ text: "Hello!" }] }, // Should be stripped
      { role: 'user', parts: [{ text: "employees" }] },
      { role: 'model', parts: [{ text: "I'm having trouble..." }], isOffline: true },
      { role: 'user', parts: [{ text: "employees" }] },
      { role: 'model', parts: [{ text: "I'm having trouble..." }], isOffline: true }
    ];
    
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "How many employees do we have?",
        history: history
      })
    });
    
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

testHistoryCrash();

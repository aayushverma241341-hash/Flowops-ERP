async function testPost() {
  try {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "How many employees do we have?",
        history: []
      })
    });
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

testPost();

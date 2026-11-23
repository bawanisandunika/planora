const test = async () => {
    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not set.");
        return;
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "hello" }] }]
        }),
      });
      console.log(response.status);
      const data = await response.json();
      console.log(data);
    } catch(e) {
      console.log(e);
    }
}
test();

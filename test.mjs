const test = async () => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBWMkkg5cLy-8aoRSN4NdesUwN7gZNCAOA', {
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

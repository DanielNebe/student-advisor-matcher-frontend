// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("🔄 Proxying registration request to backend...");
      
      const backendResponse = await fetch('https://student-advisor-matcher-bckend-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const data = await backendResponse.json();
      
      console.log("✅ Proxy response:", { status: backendResponse.status, data });
      
      // Forward the backend response with the same status code
      res.status(backendResponse.status).json(data);
    } catch (error) {
      console.error("❌ Proxy error:", error);
      res.status(500).json({ 
        message: 'Proxy error: ' + error.message,
        details: 'Cannot connect to backend server'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

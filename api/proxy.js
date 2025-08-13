// api/proxy.js
export const config = {
    runtime: "nodejs",            
    regions: ["iad1", "lhr1"],      // optional: close to you
  };
  
  // Helper: safely parse body for both prod & local dev
  async function readJsonBody(req) {
    try {
      if (req.body && typeof req.body === "object") return req.body; // already parsed
      if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
      if (typeof req.json === "function") return await req.json();   // some adapters expose this
    } catch (e) {
      // fallthrough
    }
    return {};
  }
  
  export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
      }
  
      const body = await readJsonBody(req);
  
      // Build the upstream payload to Expensify
      const upstreamURL = process.env.EXPENSIFY_API_URL || "https://www.expensify.com/api";
      const partnerName = process.env.PARTNER_NAME || "applicant";
      const partnerPassword = process.env.PARTNER_PASSWORD || "";
  
      const payload = {
        ...body,
        partnerName,
        partnerPassword,
      };
  
      const upstream = await fetch(upstreamURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const text = await upstream.text();
  
      // Expensify sometimes returns HTML when blocked by CF; guard JSON parse
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(502).json({
          error: "Upstream returned non-JSON",
          status: upstream.status,
          snippet: text.slice(0, 500),
        });
      }
  
      // Bubble up any upstream error, otherwise pass through JSON
      if (!upstream.ok || data.error) {
        return res.status(upstream.ok ? 400 : upstream.status).json(data);
      }
  
      return res.status(200).json(data);
    } catch (err) {
      console.error("proxy error", err);
      return res.status(500).json({ error: "Proxy failed", detail: String(err?.message || err) });
    }
  }
  
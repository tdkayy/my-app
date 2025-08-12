export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
      const body = req.body || {};
      const { command } = body;
      if (!command) return res.status(400).json({ error: 'Missing command' });
  
      const EXPENSIFY_API_URL = 'https://www.expensify.com/api';
      const PARTNER_NAME = process.env.EXPENSIFY_PARTNER_NAME;
      const PARTNER_PASSWORD = process.env.EXPENSIFY_PARTNER_PASSWORD;
  
      // Small helper for posting JSON form (Expensify expects x-www-form-urlencoded or JSON)
      async function postExpensify(payload) {
        const r = await fetch(EXPENSIFY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error(`Expensify HTTP ${r.status}`);
        return r.json();
      }
  
      // ---- Commands ----
      if (command === 'Authenticate') {
        const { partnerUserID, partnerUserSecret } = body;
        if (!partnerUserID || !partnerUserSecret) {
          return res.status(400).json({ error: 'Missing email or password' });
        }
        const payload = {
          command: 'Authenticate',
          partnerName: PARTNER_NAME,
          partnerPassword: PARTNER_PASSWORD,
          partnerUserID,
          partnerUserSecret,
        };
        const json = await postExpensify(payload);
        return res.status(200).json(json);
      }
  
      if (command === 'Get') {
        const { authToken } = body;
        if (!authToken) return res.status(401).json({ error: 'Missing authToken' });
  
        const payload = {
          command: 'Get',
          authToken,
          returnValueList: 'transactionList',
        };
        const json = await postExpensify(payload);
        return res.status(200).json(json);
      }
  
      if (command === 'CreateTransaction') {
        const { authToken, created, merchant, amount, currency = 'GBP' } = body;
        if (!authToken) return res.status(401).json({ error: 'Missing authToken' });
        if (!created || !merchant || typeof amount !== 'number') {
          return res.status(400).json({ error: 'Missing created/merchant/amount' });
        }
  
        const payload = {
          command: 'CreateTransaction',
          authToken,
          created,       // epoch seconds
          merchant,      // string
          amount,        // decimal (e.g. 12.34)
          currency,      // e.g. "GBP"
        };
        const json = await postExpensify(payload);
        return res.status(200).json(json);
      }
  
      return res.status(400).json({ error: `Unsupported command: ${command}` });
    } catch (err) {
      const msg = err?.message || 'Internal Server Error';
      return res.status(500).json({ error: msg });
    }
  }
  
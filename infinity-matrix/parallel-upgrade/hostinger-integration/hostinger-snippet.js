/* Minimal Hostinger frontend snippet
   This snippet expects the Hostinger environment to provide FRONTEND_ACCESS_TOKEN
   via a runtime secret injection. The snippet fetches a small chat widget manifest
   and exposes a simple `window.InfinityWidget` object to open a chat.
*/
(function () {
  const ORCHESTRATOR = 'https://orchestrator-896380409704.us-east1.run.app';
  function getToken() {
    // Hostinger should inject the token into a global variable or template or via server-side injection.
    // If missing, the widget will attempt unauthenticated calls (which may be rejected by the orchestrator).
    const t = (window.FRONTEND_ACCESS_TOKEN && typeof window.FRONTEND_ACCESS_TOKEN === 'string') ? window.FRONTEND_ACCESS_TOKEN : '';
    if (!t) console.warn('InfinityWidget: FRONTEND_ACCESS_TOKEN not found. Please provide it using Hostinger runtime secrets.');
    return t;
  }

  async function callChat(messages) {
    const token = getToken();
    const res = await fetch(ORCHESTRATOR + '/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Chat call failed: ' + res.status + ' ' + text);
    }
    return res.json();
  }

  // Expose a minimal API
  window.InfinityWidget = {
    ping: function () {
      return callChat([{ role: 'user', content: 'ping' }]);
    },
    chat: function (userMsg) {
      return callChat([{ role: 'user', content: userMsg }]);
    }
  };
})();

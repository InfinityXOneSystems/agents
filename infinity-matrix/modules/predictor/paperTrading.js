// Advanced paper trading system
const trades = {};

async function paperTrade({ userId, ticker, action, amount, price }) {
  if (!trades[userId]) trades[userId] = [];
  trades[userId].push({ ticker, action, amount, price, time: Date.now() });
  return { success: true, trade: { ticker, action, amount, price } };
}

async function getTradeHistory(userId) {
  return trades[userId] || [];
}

module.exports = { paperTrade, getTradeHistory };
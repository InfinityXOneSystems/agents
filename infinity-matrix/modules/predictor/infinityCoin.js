// Infinity Coin (testnet) trading logic
const wallets = {};

async function tradeInfinityCoin({ userId, action, amount }) {
  if (!wallets[userId]) wallets[userId] = { balance: 1000, history: [] };
  if (action === 'buy') wallets[userId].balance += amount;
  if (action === 'sell') wallets[userId].balance -= amount;
  wallets[userId].history.push({ action, amount, time: Date.now() });
  return { success: true, balance: wallets[userId].balance };
}

async function getCoinWallet(userId) {
  return wallets[userId] || { balance: 0, history: [] };
}

module.exports = { tradeInfinityCoin, getCoinWallet };
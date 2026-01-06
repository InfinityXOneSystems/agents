// Paper Trading Module
// This module defines the paper trading simulation.

class PaperTrading {
  constructor() {
    this.accounts = {};
  }

  createAccount(userId) {
    if (this.accounts[userId]) {
      throw new Error(`Paper trading account already exists for user ${userId}`);
    }
    this.accounts[userId] = { balance: 100000, trades: [] };
    console.log(`Paper trading account created for user ${userId}`);
  }

  executeTrade(userId, trade) {
    const account = this.accounts[userId];
    if (!account) {
      throw new Error(`No paper trading account found for user ${userId}`);
    }
    account.trades.push(trade);
    account.balance -= trade.amount;
    console.log(`Trade executed for user ${userId}:`, trade);
  }

  getAccount(userId) {
    return this.accounts[userId];
  }
}

const paperTrading = new PaperTrading();

module.exports = paperTrading;
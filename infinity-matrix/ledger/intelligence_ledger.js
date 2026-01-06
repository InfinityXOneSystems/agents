// Intelligence Ledger
// Tracks all activities in the intelligence-gathering system.

class IntelligenceLedger {
  constructor() {
    this.entries = [];
  }

  addEntry(entry) {
    console.log('Adding entry to ledger...');
    this.entries.push(entry);
  }

  getEntries() {
    return this.entries;
  }
}

const intelligenceLedger = new IntelligenceLedger();

module.exports = intelligenceLedger;
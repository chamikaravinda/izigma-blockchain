const Transaction = require("../wallet/transaction");

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  // update or add a new transaction to the pool
  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(
      (t) => t.id === transaction.id
    );

    if (transactionWithId) {
      this.transactions[
        this.transactions.indexOf(transactionWithId)
      ] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  // check for existing transaction
  existingTransaction(address) {
    return this.transactions.find((t) => t.input.address === address);
  }

  // get the valid transaction
  validTransactions(algorithm) {
    return this.transactions.filter((transaction) => {
      let isValidTransaction = true;

      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        isValidTransaction = false;
      }

      if (!Transaction.verifyTransaction(transaction, algorithm)) {
        console.log(`Invalid signature from ${transaction.input.address}.`);
        isValidTransaction = false;
      }

      if (isValidTransaction) return transaction;
    });
  }

  // clear the transaction pool
  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;

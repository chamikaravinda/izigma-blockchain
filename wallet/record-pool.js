const Record = require("../wallet/record");

class RecordPool {
  constructor() {
    this.records = [];
  }

  // add a record to the record pool
  addRecord(record) {
    this.records.push(record);
  }

  // get the valid records in the record pool
  validRecords(algorithm) {
    return this.records.filter((record) => {
      let isValidRecord = true;

      if (!Record.verifyRecord(record, algorithm)) {
        console.log(`Invalid signature from ${record.features.createdBy}.`);
        isValidRecord = false;
      }

      if (isValidRecord) return record;
    });
  }

  // clear the record pool
  clear() {
    this.records = [];
  }
}

module.exports = RecordPool;

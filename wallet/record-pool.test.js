const RecordPool = require("./record-pool");
const Record = require("./record");
const Wallet = require("./index");
const Blockchain = require("../blockchain");

describe("RecordPool", () => {
  let rp, wallet, record, bc;

  beforeEach(async () => {
    rp = new RecordPool();
    wallet = new Wallet();
    await wallet.createWallet();
    bc = new Blockchain();
    await bc.addGenesisBlock();
    await bc.getChain();
    record = wallet.createRecord("foo-record", rp);
  });

  it("adds records to the pool", () => {
    expect(rp.records.find((r) => r.id === record.id)).toEqual(record);
  });

  it("clear records", () => {
    rp.clear();
    expect(rp.records).toEqual([]);
  });

  describe("mixing valid and corrupt records", () => {
    let validRecords;

    beforeEach(async () => {
      rp.clear();
      validRecords = [];
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        await wallet.createWallet();
        record = wallet.createRecord("r4nd-r3c0rd", rp);
        if (i % 2 == 0) {
          record.data = 99999;
          rp.records[i] = record;
        } else {
          validRecords.push(record);
        }
      }
    });

    it("shows a difference between valid and corrupt records", () => {
      expect(JSON.stringify(rp.transactions)).not.toEqual(
        JSON.stringify(validRecords)
      );
    });

    it("grabs valid transaction", () => {
      expect(rp.validRecords()).toEqual(validRecords);
    });
  });
});

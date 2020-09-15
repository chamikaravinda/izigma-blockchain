const Record = require("./record");
const Wallet = require("./index");
describe("Record", () => {
  let record;

  beforeEach(async () => {
    wallet = new Wallet();
    await wallet.createWallet();
    record = Record.newRecord(wallet, "foo-record");
  });

  it("Validate a valid record", () => {
    expect(Record.verifyRecord(record)).toBe(true);
  });

  it("Invalid corrupt record", () => {
    record.data = "invalid-foo-record";
    expect(Record.verifyRecord(record)).toBe(false);
  });
});

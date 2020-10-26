const IzigmaBlockchain = require("./index");
const { SECP256K1_ALGORITHM } = require("./common-constant");

describe.skip("Wallet  - Operations on New Chain ", () => {
  let chain;

  beforeAll(async () => {
    chain = new IzigmaBlockchain();
    chain.createWallet();
  });

  it("Read the chain only with genesis block", async () => {
    let current_chain = await chain.getChain();
    expect(current_chain.length).toEqual(1);
  });

  it("Create a block without any validation", async () => {
    let new_block = await chain.addBlock("New Data");
    expect(new_block).not.toBe(undefined);
  });

  it("Create a a tranasaction", async () => {
    let new_transaction = await chain.createTransaction(
      "52345344fdsffdssfds",
      2
    );
    expect(new_transaction).not.toBe(undefined);
  });

  it("Create a a Record", async () => {
    let new_record = await chain.createRecord("This is a new record");
    expect(new_record).not.toBe(undefined);
  });

  it("Mine transaction", async () => {
    let new_block = await chain.mineTransactions();
    expect(new_block).not.toBe(undefined);
  });

  it("Mine record", async () => {
    let new_block = await chain.mineTransactions();
    expect(new_block).not.toBe(undefined);
  });

  describe(" After adding 200 Blocks", () => {
    beforeAll(async () => {
      for (i = 0; i < 200; i++) {
        await chain.createTransaction(
          "5234" + "i" + "344fdsff" + "i" + "ssf" + "i" + "s",
          2
        );
        await chain.mineTransactions();
      }
    });

    it("Read the chain after 200 blocks", async () => {
      let current_chain = await chain.getChain();
      expect(current_chain.length).toBeGreaterThan(200);
    });

    it("Create a block without any validation", async () => {
      let new_block = await chain.addBlock("New Data");
      expect(new_block).not.toBe(undefined);
    });

    it("Create a a tranasaction", async () => {
      let new_transaction = await chain.createTransaction(
        "52345344fdsffdssfds",
        2
      );
      expect(new_transaction).not.toBe(undefined);
    });

    it("Create a a Record", async () => {
      let new_record = await chain.createRecord("This is a new record");
      expect(new_record).not.toBe(undefined);
    });

    it("Mine transaction", async () => {
      let new_block = await chain.mineTransactions();
      expect(new_block).not.toBe(undefined);
    });

    it("Mine record", async () => {
      let new_block = await chain.mineTransactions();
      expect(new_block).not.toBe(undefined);
    });
  });
});

describe.skip("Wallet with SECP256K1 algorithm - Operations on New Chain ", () => {
  let chain2;
  beforeAll(async () => {
    chain2 = new IzigmaBlockchain();
    let privateKey =
      "d898a0f5264c7470e95195a270c3bdd0ad67de815c5f509a0caca9bf36ed0916";
    let publicKey =
      "033af71cd3a5e392e2c28ba1cda32606584b19735056e54d03d2dd8bd210d99395";
    await chain2.createWallet(publicKey, privateKey, SECP256K1_ALGORITHM);
  });

  it("Read the chain only with genesis block", async () => {
    let current_chain = await chain2.getChain();
    expect(current_chain.length).toEqual(1);
  });

  it("Create a block without any validation", async () => {
    let new_block = await chain2.addBlock("New Data");
    expect(new_block).not.toBe(undefined);
  });

  it("Create a a tranasaction", async () => {
    let new_transaction = await chain2.createTransaction(
      "033af71cd3a5e392e2cfdba1cda32606584b19735056yu4d03d2dd8bd220d99395",
      2
    );
    expect(new_transaction).not.toBe(undefined);
  });

  it("Create a a Record", async () => {
    let new_record = await chain2.createRecord("This is a new record");
    expect(new_record).not.toBe(undefined);
  });

  it("Mine transaction", async () => {
    await chain2.createWallet();
    let new_block = await chain2.mineTransactions();
    expect(new_block).not.toBe(undefined);
  });

  it("Mine record", async () => {
    await chain2.createWallet();
    let new_block = await chain2.mineTransactions();
    expect(new_block).not.toBe(undefined);
  });

  describe(" After 200 Blocks", () => {
    beforeAll(async () => {
      for (i = 0; i < 200; i++) {
        await chain2.createTransaction(
          "5234" + "i" + "344fdsff" + "i" + "ssf" + "i" + "s",
          2
        );
        await chain2.mineTransactions();
      }
    });

    it("Read the chain after 200 blocks", async () => {
      let current_chain = await chain2.getChain();
      expect(current_chain.length).toBeGreaterThan(200);
    });

    it("Create a block without any validation", async () => {
      let new_block = await chain2.addBlock("New Data");
      expect(new_block).not.toBe(undefined);
    });

    it("Create a a tranasaction", async () => {
      let new_transaction = await chain2.createTransaction(
        "52345344fdsffdssfds",
        2
      );
      expect(new_transaction).not.toBe(undefined);
    });

    it("Create a a Record", async () => {
      let new_record = await chain2.createRecord("This is a new record");
      expect(new_record).not.toBe(undefined);
    });

    it("Mine transaction", async () => {
      let new_block = await chain2.mineTransactions();
      expect(new_block).not.toBe(undefined);
    });

    it("Mine record", async () => {
      let new_block = await chain2.mineTransactions();
      expect(new_block).not.toBe(undefined);
    });
  });
});

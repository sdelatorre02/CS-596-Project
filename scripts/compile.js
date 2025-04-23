const fs = require("fs");
const path = require("path");
const solc = require("solc");

const contractPath = path.resolve(__dirname, "../contracts/Lottery.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["Lottery.sol"]["BlockchainLottery"];

const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

fs.writeFileSync(path.resolve(__dirname, "../frontend/src/contracts/LotteryABI.json"), JSON.stringify(abi, null, 2));
fs.writeFileSync(path.resolve(__dirname, "../frontend/src/contracts/LotteryBytecode.json"), JSON.stringify(bytecode));
console.log("✅ ABI and Bytecode files generated successfully.");
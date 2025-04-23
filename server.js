const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const account = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

app.get("/balance", async (req, res) => {
  try {
    const balance = await provider.getBalance(account);
    res.json({
      account,
      balance: ethers.utils.formatEther(balance),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

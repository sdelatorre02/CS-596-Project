# CS-596-Project

## How to run the React app with local blockchain simulation

### 1. Install the dependencies (frontend and backend)
```bash
# Root level (for solc and deploy scripts)
npm install

# Then go into the frontend
cd frontend
npm install
cd ..
```

---

### 2. Install and run Ganache
```bash
# If not installed yet:
npm install -g ganache

# Start Ganache
ganache --deterministic
# This simulates a blockchain at http://127.0.0.1:8545
# It will provide 10 pre-funded local accounts
```

---

### 3. Compile the Lottery.sol contract
```bash
node scripts/compile.js
```
This creates:

- `frontend/src/contracts/LotteryABI.json`
- `frontend/src/contracts/LotteryBytecode.json`

---

### 4. Deploy the smart contract
```bash
node scripts/deploy.js
```
This deploys the compiled contract to Ganache and creates:

- `frontend/src/contracts/ContractAddress.json`

You do **not** need to manually copy the address into your frontend. It is automatically loaded.

---

### 5. Start the backend server (Express)
```bash
node server.js
```
This connects to Ganache and serves API routes to the frontend via:

- `GET /accounts` — List of Ganache accounts and balances
- `GET /balance?address=...` — Balance of one account
- `GET /players` — List of players and their guesses
- `POST /enter` — Submit a guess to the smart contract

The server runs at `http://localhost:4000`

---

### 6. Start the React app
```bash
cd frontend
npm run dev
```

Open your browser to:  
[http://localhost:5173](http://localhost:5173)

## TODO
- [x] Smart Contract Skeleton:
    - Registration with a ticket price and guess validation
    - One ticket per-wallet uniqueness check.
    - Emits events for transparency.
    - Pseudo-random winner selection with keccak256.
    - Reset mechanism.
    - Modifier-based access control (onlyByOwner, lotteryIsOpen).
    - Guard clauses to prevent early or duplicate joins.
- [ ] Use [VRF](https://docs.chain.link/vrf) to do proper randomization
- [ ] Make the max players configurable by either...
    - allow unlimited players but lottery stops at a certain date
    - contract owner can set the stoppage
- [ ] Build the frontend
    - add basic functionality with vite, ganache, and node.js
    - clean up the code and make sure it's good
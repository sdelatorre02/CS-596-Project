# CS-596-Project

## How to run the react app
1. Install the dependencies (frontend and backend)
```
// Root level (for solc and deploy scripts)
>> npm install

// Then go into the frontend
>> cd frontend
>> npm install
>> cd ..
```

2. Install and run ganache
```
// If not installed yet:
>> npm install -g ganache

// Start it:
>> ganache --deterministic
// This will simulate a blockchain at http://127.0.0.1:8545.
```

3. Compile the Lottery.sol contract
```
>> node scripts/compile.js
// This creates:
// frontend/src/contracts/LotteryABI.json
// frontend/src/contracts/LotteryBytecode.json
```

4. Deploy the contract
```
>> node scripts/deploy.js
// It will output something like: Contract deployed to: 0xABC123...
// IMPORTANT: Copy this address.
```

5. Plug contract address into the frontend
```
// Edit frontend/src/App.jsx and replace:
const CONTRACT_ADDRESS = "0x...";
// With the address from step 5.
```

6. Start the React app
```
cd frontend
npm run dev
// Now visit http://localhost:5173
```

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
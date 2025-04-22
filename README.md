# CS-596-Project

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
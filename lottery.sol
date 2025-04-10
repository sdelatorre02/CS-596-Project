// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 ** @title BlockchainLottery
 ** @dev Lottery system with players
 ** @custom:dev-run-script lottery.sol
*/

contract BlockchainLottery {
    address public owner;
    uint256 public maxPlayers = 10;
    uint256 public minGuess = 1;
    uint256 public maxGuess = 10000;
    uint256 public ticketPrice = 10 gwei;

    struct Player {
        address payable addr;
        uint256 guess;
    }

    Player[] public players;
    bool public lotteryOpen = true;

    event LotteryJoined(address indexed player, uint256 guess);
    event WinnerChosen(address indexed winner, uint256 closestGuess);

    modifier onlyByOwner() {
        require(msg.sender == owner, "You are not the contract owner");
        _;
    }

    modifier lotteryIsOpen() {
        require(lotteryOpen, "The lottery is closed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function joinLottery(uint256 _guess) external payable lotteryIsOpen {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(_guess >= minGuess && _guess <= maxGuess, "Guess out of range");
        require(players.length < maxPlayers, "Max players has already been reached");

        for (uint256 i = 0; i < players.length; i++) {
            require(players[i].addr != msg.sender, "Player has already joined the lottery");
        }

        players.push(Player(payable(msg.sender), _guess));
        emit LotteryJoined(msg.sender, _guess);

        if (players.length == maxPlayers) {
            selectWinner();
        }
    }

    function selectWinner() internal {
        require(players.length == maxPlayers, "Not enough players have joined");
        uint256 winningIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % maxPlayers;
        Player memory winner = players[winningIndex];

        lotteryOpen = false;
        payable(winner.addr).transfer(address(this).balance);

        emit WinnerChosen(winner.addr, winner.guess);
    }

    function resetLottery() external onlyByOwner {
        require(!lotteryOpen, "Lottery is still open");
        delete players;
        lotteryOpen = true;
    }

    function getPlayerAddresses() external view returns (address[] memory) {
        address[] memory addresses = new address[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            addresses[i] = players[i].addr;
        }
        return addresses;
    }

    function getPlayerGuesses() external view returns (uint256[] memory) {
        uint256[] memory guesses = new uint256[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            guesses[i] = players[i].guess;
        }
        return guesses;
    }
}

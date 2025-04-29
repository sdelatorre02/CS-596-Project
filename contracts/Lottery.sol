// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

//Ethereum based lottery game where the user who guesses closest to the random numnber wins.
contract BlockchainLottery {
    address public owner;
    uint256 public ticketPrice = 10 wei;
    uint256 public minGuess = 1;
    uint256 public maxGuess = 10000;
    bool public lotteryOpen = true;

    uint256 public startTime;
    uint256 public duration = 2 minutes;

    //Player Info
    struct Player {
        address payable addr;
        uint256 guess;
    }

    //All players joined
    Player[] public players;

    //Winner info for recent round
    address public recentWinner;
    uint256 public recentWinningGuess;
    uint256 public recentTarget;

    //Winner Info
    struct Winner {
        address winnerAddress;
        uint256 guess;
    }

    Winner[] public winnerHistory;

    event LotteryJoined(address indexed player, uint256 guess);
    event WinnerChosen(address indexed winner, uint256 guess, uint256 target);
    event LotteryClosed();

    //Restric function to only contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    //Lottery is open only if time not expired and is open
    modifier isLotteryOpen() {
        require(lotteryOpen && block.timestamp <= startTime + duration, "Lottery closed");
        _;
    }

    //Sets owner and start time
    constructor() {
        owner = msg.sender;
        startTime = block.timestamp;
    }

    //Players can join the lottery by entering their guess and submitting payment
    function joinLottery(uint256 _guess) external payable isLotteryOpen {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(_guess >= minGuess && _guess <= maxGuess, "Guess out of range");

        //Makes sure player can only join once
        for (uint256 i = 0; i < players.length; i++) {
            require(players[i].addr != msg.sender, "You already joined");
        }

        players.push(Player(payable(msg.sender), _guess));
        emit LotteryJoined(msg.sender, _guess);
    }

    //Lottery is closed manually by contract owner, or when time expires
    function closeLottery() public {
        require(lotteryOpen, "Already closed");
        require(msg.sender == owner || block.timestamp >= startTime + duration, "Not allowed yet");

        lotteryOpen = false;
        emit LotteryClosed();

        selectWinner();
    }

    //Picks the winner by whoevers guess is closest to random number
    function selectWinner() internal {
        require(players.length > 0, "No players have joined");

        //Creates the random number
        uint256 target = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, players.length))
        ) % (maxGuess - minGuess + 1) + minGuess;

        uint256 closestDiff = type(uint256).max;
        uint256 winningIndex = 0;

        //Searches through each guess to see who is closest
        for (uint256 i = 0; i < players.length; i++) {
            uint256 diff = players[i].guess > target
                ? players[i].guess - target
                : target - players[i].guess;

            if (diff < closestDiff) {
                closestDiff = diff;
                winningIndex = i;
            }
        }

        //Save winner info
        Player memory winner = players[winningIndex];
        recentWinner = winner.addr;
        recentWinningGuess = winner.guess;
        recentTarget = target;

        winnerHistory.push(Winner(winner.addr, winner.guess));

        //Send winner payment
        payable(winner.addr).transfer(address(this).balance);

        emit WinnerChosen(winner.addr, winner.guess, target);
    }

    //Returns a list of all player addresses only if lottery is closed
    function getPlayerAddresses() external view returns (address[] memory) {
        require(!lotteryOpen, "Wait until lottery closes");
        address[] memory addresses = new address[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            addresses[i] = players[i].addr;
        }
        return addresses;
    }

    //Returns a list of all player guesses only if lottery is closed
    function getPlayerGuesses() external view returns (uint256[] memory) {
        require(!lotteryOpen, "Wait until lottery closes");
        uint256[] memory guesses = new uint256[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            guesses[i] = players[i].guess;
        }
        return guesses;
    }

    //View history of winners from all previous rounds
    function getWinnerHistory() external view returns (Winner[] memory) {
        return winnerHistory;
    }

    //Resets the lottery to allow new users to join 
    function resetLottery() external onlyOwner {
        require(!lotteryOpen, "Lottery still running");
        delete players;
        lotteryOpen = true;
        startTime = block.timestamp;
    }

    receive() external payable {}
}

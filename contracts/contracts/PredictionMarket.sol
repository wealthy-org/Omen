// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarket is Ownable, ReentrancyGuard {
    enum MarketStatus { Active, ResolvedYes, ResolvedNo, Cancelled }

    struct Market {
        uint256 id;
        string title;
        uint256 deadline;
        uint256 totalYesPool;
        uint256 totalNoPool;
        MarketStatus status;
        bool exists;
    }

    struct UserBet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserBet)) public bets;

    event MarketCreated(uint256 indexed marketId, string title, uint256 deadline);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool side, uint256 amount);
    event MarketResolved(uint256 indexed marketId, MarketStatus status);
    event MarketCancelled(uint256 indexed marketId);
    event PayoutClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createMarket(string calldata title, uint256 deadline) external onlyOwner returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(deadline > block.timestamp, "Deadline must be in future");

        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            id: marketId,
            title: title,
            deadline: deadline,
            totalYesPool: 0,
            totalNoPool: 0,
            status: MarketStatus.Active,
            exists: true
        });

        emit MarketCreated(marketId, title, deadline);
        return marketId;
    }

    function placeBet(uint256 marketId, bool side) external payable nonReentrant {
        require(msg.value > 0, "Bet amount must be greater than zero");
        Market storage market = markets[marketId];
        require(market.exists, "Market does not exist");
        require(market.status == MarketStatus.Active, "Market is not active");
        require(block.timestamp < market.deadline, "Betting deadline has passed");

        if (side) {
            market.totalYesPool += msg.value;
            bets[marketId][msg.sender].yesAmount += msg.value;
        } else {
            market.totalNoPool += msg.value;
            bets[marketId][msg.sender].noAmount += msg.value;
        }

        emit BetPlaced(marketId, msg.sender, side, msg.value);
    }

    function resolveMarket(uint256 marketId, bool result) external onlyOwner nonReentrant {
        Market storage market = markets[marketId];
        require(market.exists, "Market does not exist");
        require(market.status == MarketStatus.Active, "Market is not active");
        require(block.timestamp >= market.deadline, "Deadline has not arrived");

        MarketStatus newStatus = result ? MarketStatus.ResolvedYes : MarketStatus.ResolvedNo;
        market.status = newStatus;

        emit MarketResolved(marketId, newStatus);
    }

    function cancelMarket(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.exists, "Market does not exist");
        require(market.status == MarketStatus.Active, "Market is not active");

        market.status = MarketStatus.Cancelled;

        emit MarketCancelled(marketId);
    }

    function claim(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.exists, "Market does not exist");
        require(market.status != MarketStatus.Active, "Market is still active");

        UserBet storage bet = bets[marketId][msg.sender];
        require(!bet.claimed, "Payout already claimed");

        uint256 payout = calculatePayout(marketId, msg.sender);
        require(payout > 0, "No payout available");

        bet.claimed = true;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit PayoutClaimed(marketId, msg.sender, payout);
    }

    function calculatePayout(uint256 marketId, address user) public view returns (uint256) {
        Market storage market = markets[marketId];
        if (!market.exists) {
            return 0;
        }

        UserBet storage bet = bets[marketId][user];
        if (bet.claimed) {
            return 0;
        }

        if (market.status == MarketStatus.Cancelled) {
            return bet.yesAmount + bet.noAmount;
        }

        uint256 totalPool = market.totalYesPool + market.totalNoPool;

        if (market.status == MarketStatus.ResolvedYes) {
            if (market.totalYesPool == 0) {
                return 0;
            }
            return (bet.yesAmount * totalPool) / market.totalYesPool;
        }

        if (market.status == MarketStatus.ResolvedNo) {
            if (market.totalNoPool == 0) {
                return 0;
            }
            return (bet.noAmount * totalPool) / market.totalNoPool;
        }

        return 0;
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        require(markets[marketId].exists, "Market does not exist");
        return markets[marketId];
    }

    function getUserBet(uint256 marketId, address user) external view returns (UserBet memory) {
        return bets[marketId][user];
    }
}

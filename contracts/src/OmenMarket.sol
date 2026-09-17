// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IOmenMarket} from "./interfaces/IOmenMarket.sol";
import {OmenFactory} from "./OmenFactory.sol";
import {MarketStatus, Outcome, ResolutionConfig} from "./types/MarketTypes.sol";

contract OmenMarket is IOmenMarket, ReentrancyGuard, Pausable {
    uint256 public immutable override marketId;
    address public immutable override factory;
    bytes32 public immutable override beliefHash;
    bytes32 public immutable override sourceHash;
    bytes32 public immutable override resolutionHash;
    uint256 public immutable override openTime;
    uint256 public immutable override closeTime;
    ResolutionConfig public resolutionConfig;

    MarketStatus public override status;
    Outcome public override winner;

    uint256 public override agreePool;
    uint256 public override disagreePool;

    mapping(address => uint256) public override agreePositions;
    mapping(address => uint256) public override disagreePositions;
    mapping(address => bool) public override hasClaimed;

    error InvalidTimeRange();
    error MarketNotOpen();
    error MarketNotClosed();
    error MarketAlreadyResolved();
    error ZeroDeposit();
    error Unauthorized();
    error AlreadyClaimed();
    error NoWinningPosition();
    error TransferFailed();
    error NothingToRefund();

    modifier onlyFactoryOrResolver() {
        if (
            msg.sender != factory &&
            !OmenFactory(factory).hasRole(OmenFactory(factory).RESOLVER_ROLE(), msg.sender) &&
            !OmenFactory(factory).hasRole(OmenFactory(factory).DEFAULT_ADMIN_ROLE(), msg.sender)
        ) {
            revert Unauthorized();
        }
        _;
    }

    constructor(
        uint256 _marketId,
        address _factory,
        bytes32 _beliefHash,
        bytes32 _sourceHash,
        bytes32 _resolutionHash,
        uint256 _openTime,
        uint256 _closeTime,
        ResolutionConfig memory _config
    ) {
        if (_closeTime <= _openTime) {
            revert InvalidTimeRange();
        }
        marketId = _marketId;
        factory = _factory;
        beliefHash = _beliefHash;
        sourceHash = _sourceHash;
        resolutionHash = _resolutionHash;
        openTime = _openTime;
        closeTime = _closeTime;
        resolutionConfig = _config;
        status = MarketStatus.OPEN;
        winner = Outcome.UNRESOLVED;
    }

    function resolver() public view override returns (address) {
        return factory;
    }

    function depositAgree() external payable override nonReentrant whenNotPaused {
        if (status != MarketStatus.OPEN || block.timestamp >= closeTime) {
            revert MarketNotOpen();
        }
        if (msg.value == 0) {
            revert ZeroDeposit();
        }

        agreePositions[msg.sender] += msg.value;
        agreePool += msg.value;

        emit PositionTaken(
            msg.sender,
            Outcome.AGREE,
            msg.value,
            agreePool + disagreePool
        );
    }

    function depositDisagree() external payable override nonReentrant whenNotPaused {
        if (status != MarketStatus.OPEN || block.timestamp >= closeTime) {
            revert MarketNotOpen();
        }
        if (msg.value == 0) {
            revert ZeroDeposit();
        }

        disagreePositions[msg.sender] += msg.value;
        disagreePool += msg.value;

        emit PositionTaken(
            msg.sender,
            Outcome.DISAGREE,
            msg.value,
            agreePool + disagreePool
        );
    }

    function resolveMarket(Outcome outcome) external override onlyFactoryOrResolver {
        if (status != MarketStatus.OPEN && status != MarketStatus.CLOSED) {
            revert MarketAlreadyResolved();
        }
        if (block.timestamp < closeTime) {
            revert MarketNotClosed();
        }

        if (outcome == Outcome.VOID) {
            status = MarketStatus.VOID;
            winner = Outcome.VOID;
            emit MarketVoided(marketId, block.timestamp);
            return;
        }

        status = MarketStatus.RESOLVED;
        winner = outcome;
        emit MarketResolved(marketId, outcome, block.timestamp);
    }

    function voidMarket() external override onlyFactoryOrResolver {
        if (status == MarketStatus.SETTLED) {
            revert MarketAlreadyResolved();
        }
        status = MarketStatus.VOID;
        winner = Outcome.VOID;
        emit MarketVoided(marketId, block.timestamp);
    }

    function claimPayout() external override nonReentrant {
        if (hasClaimed[msg.sender]) {
            revert AlreadyClaimed();
        }

        if (status == MarketStatus.VOID) {
            uint256 refundAmount = agreePositions[msg.sender] + disagreePositions[msg.sender];
            if (refundAmount == 0) {
                revert NothingToRefund();
            }
            hasClaimed[msg.sender] = true;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            if (!success) {
                revert TransferFailed();
            }
            emit PayoutClaimed(msg.sender, refundAmount, block.timestamp);
            return;
        }

        if (status != MarketStatus.RESOLVED) {
            revert MarketNotOpen();
        }

        uint256 totalPool = agreePool + disagreePool;
        uint256 winningStake;
        uint256 winningPool;

        if (winner == Outcome.AGREE) {
            winningStake = agreePositions[msg.sender];
            winningPool = agreePool;
        } else if (winner == Outcome.DISAGREE) {
            winningStake = disagreePositions[msg.sender];
            winningPool = disagreePool;
        } else {
            revert NoWinningPosition();
        }

        if (winningStake == 0 || winningPool == 0) {
            revert NoWinningPosition();
        }

        hasClaimed[msg.sender] = true;
        uint256 payout = (winningStake * totalPool) / winningPool;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        if (!sent) {
            revert TransferFailed();
        }

        emit PayoutClaimed(msg.sender, payout, block.timestamp);
    }

    function pause() external onlyFactoryOrResolver {
        _pause();
    }

    function unpause() external onlyFactoryOrResolver {
        _unpause();
    }
}

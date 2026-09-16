import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PredictionMarket } from "../typechain-types";

describe("PredictionMarket", function () {
  async function deployPredictionMarketFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
    const predictionMarket = (await PredictionMarketFactory.deploy(owner.address)) as unknown as PredictionMarket;
    await predictionMarket.waitForDeployment();
    return { predictionMarket, owner, user1, user2, user3 };
  }

  describe("Market Creation", function () {
    it("allows owner to create a market with valid title and future deadline", async function () {
      const { predictionMarket, owner } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 3600;

      await expect(predictionMarket.createMarket("Will BTC reach $100k in 2026?", futureTime))
        .to.emit(predictionMarket, "MarketCreated")
        .withArgs(0, "Will BTC reach $100k in 2026?", futureTime);

      const market = await predictionMarket.getMarket(0);
      expect(market.id).to.equal(0n);
      expect(market.title).to.equal("Will BTC reach $100k in 2026?");
      expect(market.deadline).to.equal(BigInt(futureTime));
      expect(market.totalYesPool).to.equal(0n);
      expect(market.totalNoPool).to.equal(0n);
      expect(market.status).to.equal(0);
      expect(market.exists).to.be.true;
    });

    it("prevents non-owner from creating a market", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 3600;

      await expect(predictionMarket.connect(user1).createMarket("Unauthorized Market", futureTime))
        .to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });

    it("reverts when title is empty", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 3600;

      await expect(predictionMarket.createMarket("", futureTime))
        .to.be.revertedWith("Title cannot be empty");
    });

    it("reverts when deadline is not in the future", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);
      const pastTime = (await time.latest()) - 60;

      await expect(predictionMarket.createMarket("Past Market", pastTime))
        .to.be.revertedWith("Deadline must be in future");
    });
  });

  describe("Betting Lifecycle", function () {
    it("allows placing bets on YES and NO with native ETH", async function () {
      const { predictionMarket, user1, user2 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 3600;
      await predictionMarket.createMarket("Will ETH flip BTC?", futureTime);

      await expect(predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("1.0") }))
        .to.emit(predictionMarket, "BetPlaced")
        .withArgs(0, user1.address, true, ethers.parseEther("1.0"));

      await expect(predictionMarket.connect(user2).placeBet(0, false, { value: ethers.parseEther("2.0") }))
        .to.emit(predictionMarket, "BetPlaced")
        .withArgs(0, user2.address, false, ethers.parseEther("2.0"));

      const market = await predictionMarket.getMarket(0);
      expect(market.totalYesPool).to.equal(ethers.parseEther("1.0"));
      expect(market.totalNoPool).to.equal(ethers.parseEther("2.0"));

      const betUser1 = await predictionMarket.getUserBet(0, user1.address);
      expect(betUser1.yesAmount).to.equal(ethers.parseEther("1.0"));
      expect(betUser1.noAmount).to.equal(0n);
      expect(betUser1.claimed).to.be.false;

      const betUser2 = await predictionMarket.getUserBet(0, user2.address);
      expect(betUser2.yesAmount).to.equal(0n);
      expect(betUser2.noAmount).to.equal(ethers.parseEther("2.0"));
      expect(betUser2.claimed).to.be.false;
    });

    it("reverts when betting with zero ETH", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 3600;
      await predictionMarket.createMarket("Zero Bet Test", futureTime);

      await expect(predictionMarket.connect(user1).placeBet(0, true, { value: 0n }))
        .to.be.revertedWith("Bet amount must be greater than zero");
    });

    it("reverts when betting on a non-existent market", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);

      await expect(predictionMarket.connect(user1).placeBet(99, true, { value: ethers.parseEther("0.1") }))
        .to.be.revertedWith("Market does not exist");
    });

    it("reverts when betting after the deadline has passed", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Expired Market", futureTime);

      await time.increaseTo(futureTime + 1);

      await expect(predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("0.5") }))
        .to.be.revertedWith("Betting deadline has passed");
    });
  });

  describe("Market Resolution", function () {
    it("allows owner to resolve market after deadline", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Resolution Market", futureTime);

      await time.increaseTo(futureTime + 1);

      await expect(predictionMarket.resolveMarket(0, true))
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(0, 1);

      const market = await predictionMarket.getMarket(0);
      expect(market.status).to.equal(1);
    });

    it("prevents non-owner from resolving market", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Non-owner Resolution", futureTime);

      await time.increaseTo(futureTime + 1);

      await expect(predictionMarket.connect(user1).resolveMarket(0, true))
        .to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });

    it("reverts when resolving before deadline", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Premature Resolution", futureTime);

      await expect(predictionMarket.resolveMarket(0, true))
        .to.be.revertedWith("Deadline has not arrived");
    });

    it("reverts when resolving an already resolved market", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Double Resolution", futureTime);

      await time.increaseTo(futureTime + 1);
      await predictionMarket.resolveMarket(0, true);

      await expect(predictionMarket.resolveMarket(0, false))
        .to.be.revertedWith("Market is not active");
    });
  });

  describe("Proportional Payout Claims (YES Winner)", function () {
    it("correctly calculates and distributes proportional payouts to YES winners", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Arbitrum TVL New High", futureTime);

      await predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).placeBet(0, true, { value: ethers.parseEther("3.0") });
      await predictionMarket.connect(user3).placeBet(0, false, { value: ethers.parseEther("4.0") });

      await time.increaseTo(futureTime + 1);
      await predictionMarket.resolveMarket(0, true);

      expect(await predictionMarket.calculatePayout(0, user1.address)).to.equal(ethers.parseEther("2.0"));
      expect(await predictionMarket.calculatePayout(0, user2.address)).to.equal(ethers.parseEther("6.0"));
      expect(await predictionMarket.calculatePayout(0, user3.address)).to.equal(0n);

      await expect(predictionMarket.connect(user1).claim(0))
        .to.changeEtherBalance(user1, ethers.parseEther("2.0"));

      await expect(predictionMarket.connect(user2).claim(0))
        .to.changeEtherBalance(user2, ethers.parseEther("6.0"));

      const betUser1 = await predictionMarket.getUserBet(0, user1.address);
      expect(betUser1.claimed).to.be.true;

      await expect(predictionMarket.connect(user3).claim(0))
        .to.be.revertedWith("No payout available");

      await expect(predictionMarket.connect(user1).claim(0))
        .to.be.revertedWith("Payout already claimed");
    });
  });

  describe("Proportional Payout Claims (NO Winner)", function () {
    it("correctly calculates and distributes proportional payouts to NO winners", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Solana Down 24h", futureTime);

      await predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user2).placeBet(0, false, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user3).placeBet(0, false, { value: ethers.parseEther("6.0") });

      await time.increaseTo(futureTime + 1);
      await predictionMarket.resolveMarket(0, false);

      expect(await predictionMarket.calculatePayout(0, user1.address)).to.equal(0n);
      expect(await predictionMarket.calculatePayout(0, user2.address)).to.equal(ethers.parseEther("2.5"));
      expect(await predictionMarket.calculatePayout(0, user3.address)).to.equal(ethers.parseEther("7.5"));

      await expect(predictionMarket.connect(user2).claim(0))
        .to.changeEtherBalance(user2, ethers.parseEther("2.5"));

      await expect(predictionMarket.connect(user3).claim(0))
        .to.changeEtherBalance(user3, ethers.parseEther("7.5"));

      await expect(predictionMarket.connect(user1).claim(0))
        .to.be.revertedWith("No payout available");
    });
  });

  describe("Market Cancellation & 100% Refunds", function () {
    it("allows owner to cancel market and lets all participants claim 100% refund", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Cancelled Event", futureTime);

      await predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("1.5") });
      await predictionMarket.connect(user2).placeBet(0, false, { value: ethers.parseEther("2.5") });

      await expect(predictionMarket.cancelMarket(0))
        .to.emit(predictionMarket, "MarketCancelled")
        .withArgs(0);

      const market = await predictionMarket.getMarket(0);
      expect(market.status).to.equal(3);

      expect(await predictionMarket.calculatePayout(0, user1.address)).to.equal(ethers.parseEther("1.5"));
      expect(await predictionMarket.calculatePayout(0, user2.address)).to.equal(ethers.parseEther("2.5"));
      expect(await predictionMarket.calculatePayout(0, user3.address)).to.equal(0n);

      await expect(predictionMarket.connect(user1).claim(0))
        .to.changeEtherBalance(user1, ethers.parseEther("1.5"));

      await expect(predictionMarket.connect(user2).claim(0))
        .to.changeEtherBalance(user2, ethers.parseEther("2.5"));

      await expect(predictionMarket.connect(user1).claim(0))
        .to.be.revertedWith("Payout already claimed");
    });

    it("prevents non-owner from cancelling market", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Cancel Guard Test", futureTime);

      await expect(predictionMarket.connect(user1).cancelMarket(0))
        .to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Edge Cases & State Checks", function () {
    it("returns exact initial deposit if only one side bet placed and that side won", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("One Sided Market", futureTime);

      await predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("3.0") });

      await time.increaseTo(futureTime + 1);
      await predictionMarket.resolveMarket(0, true);

      expect(await predictionMarket.calculatePayout(0, user1.address)).to.equal(ethers.parseEther("3.0"));

      await expect(predictionMarket.connect(user1).claim(0))
        .to.changeEtherBalance(user1, ethers.parseEther("3.0"));
    });

    it("reverts claim if market is still active", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployPredictionMarketFixture);
      const futureTime = (await time.latest()) + 1000;
      await predictionMarket.createMarket("Active Market", futureTime);

      await predictionMarket.connect(user1).placeBet(0, true, { value: ethers.parseEther("1.0") });

      await expect(predictionMarket.connect(user1).claim(0))
        .to.be.revertedWith("Market is still active");
    });

    it("reverts getMarket for non-existent market", async function () {
      const { predictionMarket } = await loadFixture(deployPredictionMarketFixture);

      await expect(predictionMarket.getMarket(999))
        .to.be.revertedWith("Market does not exist");
    });
  });
});

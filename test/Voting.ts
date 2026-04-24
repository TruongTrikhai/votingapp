import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Voting Contract", function () {
  const candidateNames = ["Alice", "Bob", "Charlie"];
  const durationInMinutes = 10;

  async function deployVotingFixture() {
    const [owner, voter1, voter2, otherAccount] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidateNames, durationInMinutes);
    return { voting, owner, voter1, voter2, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize candidates correctly", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates.length).to.equal(3);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[0].voteCount).to.equal(0n);
    });

    it("Should set correct voting start and end times", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      const start = await voting.votingStart();
      const end = await voting.votingEnd();
      expect(end - start).to.equal(BigInt(durationInMinutes * 60));
    });
  });

  describe("Voting Process", function () {
    it("Should allow a voter to vote for a valid candidate", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(voter1).vote(0);
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates[0].voteCount).to.equal(1n);
      expect(await voting.voters(voter1.address)).to.be.true;
    });

    it("Should revert if voter tries to vote twice", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(voter1).vote(0);
      try {
        await voting.connect(voter1).vote(1);
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("You have already voted.");
      }
    });

    it("Should revert if invalid candidate index is provided", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      try {
        await voting.connect(voter1).vote(5);
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("Invalid candidate index.");
      }
    });

    it("Should revert if voting is closed", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      // Fast forward time to after votingEnd
      await time.increase(durationInMinutes * 60 + 1);
      try {
        await voting.connect(voter1).vote(0);
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("Voting is closed.");
      }
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add candidate", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      await voting.connect(owner).addCandidate("Dave");
      const candidates = await voting.getAllVotesOfCandiates();
      expect(candidates.length).to.equal(4);
      expect(candidates[3].name).to.equal("Dave");
    });

    it("Should revert if non-owner tries to add candidate", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      // Error is custom OpenZeppelin Ownable error from v5
      try {
        await voting.connect(voter1).addCandidate("Dave");
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("OwnableUnauthorizedAccount");
      }
    });
  });

  describe("Status & Remaining Time", function () {
    it("Should return correct status", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.getVotingStatus()).to.be.true;

      await time.increase(durationInMinutes * 60 + 1);
      expect(await voting.getVotingStatus()).to.be.false;
    });

    it("Should return remaining time properly", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      const remainingTime = await voting.getRemainingTime();
      expect(remainingTime > 0n).to.be.true;

      await time.increase(durationInMinutes * 60 + 1);
      expect(await voting.getRemainingTime()).to.equal(0n);
    });
  });
});

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  const candidateNames = ["Khai", "Kiet", "Nam", "Linh", "Loan"];
  const durationInMinutes = 10;

  const voting = m.contract("Voting", [candidateNames, durationInMinutes]);

  return { voting };
});

export default VotingModule;

import { defineConfig } from "hardhat/config";
import toolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const { API_URL, PRIVATE_KEY } = process.env;

export default defineConfig({
  plugins: [toolboxMochaEthers],
  solidity: {
    version: "0.8.24",
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      url: API_URL || "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    }
  },
});

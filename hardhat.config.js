/*export default {
  solidity: "0.8.19",
  paths: {
    sources: "./src/contracts",   
    artifacts: "./src/artifacts"   
  },
  networks: {
    localhost: { url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545" },
  }
};
*/
import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/artifacts",
    cache: "./cache",
    tests: "./test"
  },
  networks: {
    localhost: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
      chainId: 31337
    },
    hardhat: {
      chainId: 31337
    }
  }
};

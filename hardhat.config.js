require("@nomicfoundation/hardhat-toolbox"); // Включает все нужные плагины

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/dNlAASd6W-E2mW5mM7849MrHZcASbxju", // Ваш API-ключ Alchemy
      accounts: ["8a0a4bebcc26656c3d7cb0f97804b1134e945f3ac502335f00b31b89f78ea202",
      "e678b822ef1e3c0bffb3180701aa42def26a747278cf486ab7b1c97d01d432f1",
      "18f596b4061fb24056fea743b2bfd7ee4f702a65a552407e948b1ca4f602c444"], // Ваш приватный ключ
    },
  },
  etherscan: {
    apiKey: {
      sepolia: "6VN77BS2WU8TTBGTEJ1VM3SY2IW9FJJYKP", // Ваш API-ключ Etherscan
    },
  },
};

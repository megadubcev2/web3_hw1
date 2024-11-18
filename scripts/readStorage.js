const { ethers } = require("hardhat");

async function readBalances() {
  try {
    // Получение деплоера и двух других пользователей
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("Деплоер:", deployer.address);

    // Адреса токенов
    const tokens = {
      ERC20: "0x358fb3823e145D8cDb09C620d5f65f0E1091Bbb4",
      ERC721: "0x9b5A3e425cF034e55C7336C2942857Ef6Bc732B1",
      ERC1155: "0x8c2726BE09bD4f0188BCd1AaC28382FBcF988d14",
    };

    // ABI стандартных контрактов
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
    ];

    const ERC721_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const ERC1155_ABI = [
      "function balanceOf(address account, uint256 id) view returns (uint256)",
      "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
    ];

    // Создание экземпляров контрактов
    const erc20Contract = new ethers.Contract(tokens.ERC20, ERC20_ABI, ethers.provider);
    const erc721Contract = new ethers.Contract(tokens.ERC721, ERC721_ABI, ethers.provider);
    const erc1155Contract = new ethers.Contract(tokens.ERC1155, ERC1155_ABI, ethers.provider);

    // Пользователи, чьи балансы проверяем
    const users = [deployer, user1, user2];

    // Функция для получения баланса ERC20 и ERC721
    async function getERC20Balance(contract, userAddress) {
      return await contract.balanceOf(userAddress);
    }

    async function getERC721Balance(contract, userAddress) {
      return await contract.balanceOf(userAddress);
    }

    // Функция для получения баланса ERC1155
    // Для примера предположим, что у нас есть несколько известных tokenId
    const erc1155TokenIds = [1, 2, 3]; // Замените на ваши актуальные tokenId

    async function getERC1155Balance(contract, userAddress, tokenId) {
      return await contract.balanceOf(userAddress, tokenId);
    }

    // Проверяем балансы для каждого токена и каждого пользователя
    for (const [tokenType, tokenAddress] of Object.entries(tokens)) {
      console.log(`\n--- Балансы для ${tokenType} ---`);
      for (const user of users) {
        if (tokenType === "ERC20") {
          const balance = await getERC20Balance(erc20Contract, user.address);
          console.log(`Баланс ${user.address} в ${tokenType}: ${ethers.formatUnits(balance, 18)} ERC20`);
        } else if (tokenType === "ERC721") {
          const balance = await getERC721Balance(erc721Contract, user.address);
          console.log(`Баланс ${user.address} в ${tokenType}: ${balance.toString()} ERC721 токенов`);
        } else if (tokenType === "ERC1155") {
          // Для ERC1155 выводим баланс по каждому tokenId
          for (const tokenId of erc1155TokenIds) {
            const balance = await getERC1155Balance(erc1155Contract, user.address, tokenId);
            console.log(`Баланс ${user.address} в ${tokenType} (tokenId: ${tokenId}): ${balance.toString()}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Ошибка при чтении балансов:", error);
    process.exit(1);
  }
}

readBalances()
  .then(() => console.log("Чтение балансов завершено"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

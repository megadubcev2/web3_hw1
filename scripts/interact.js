const hre = require("hardhat");
const { ethers, artifacts } = hre;

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();

  console.log("Deployer address:", deployer.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);

  // Адреса развернутых контрактов
  const erc20Address = "0x358fb3823e145D8cDb09C620d5f65f0E1091Bbb4";
  const erc721Address = "0x9b5A3e425cF034e55C7336C2942857Ef6Bc732B1";
  const erc1155Address = "0x8c2726BE09bD4f0188BCd1AaC28382FBcF988d14";

  // Получение экземпляров контрактов
  const erc20Token = await ethers.getContractAt("MyERC20Token", erc20Address);

  const erc721Artifact = await artifacts.readArtifact("MyERC721Token");
  const erc721Token = await ethers.getContractAt(erc721Artifact.abi, erc721Address);

  const erc1155Token = await ethers.getContractAt("MyERC1155Token", erc1155Address);



  // ERC20: Перевод токенов
  console.log("ERC20: Перевод 10 токенов...");
  const tx1 = await erc20Token.transfer(user1.address, 10);
  console.log("Хэш транзакции:", tx1.hash);
  await tx1.wait();
  console.log(`Переведено 10 токенов на ${user1.address}`);

  // ERC20: Approve
  console.log("ERC20: Approving transferFrom...");
  const approveTx = await erc20Token.connect(user1).approve(user2.address, 5);
  console.log("Хэш одобрения:", approveTx.hash);
  await approveTx.wait();
  console.log("Одобрено 5 токенов");

  // ERC20: transferFrom
  console.log("ERC20: Выполнение transferFrom...");
  const transferFromTx = await erc20Token.connect(user2).transferFrom(user1.address, user2.address, 5);
  console.log("Хэш transferFrom:", transferFromTx.hash);
  await transferFromTx.wait();
  console.log(`User2 перевел 5 токенов от User1 к себе`);

  // ERC721: Mint
  // Mint tokens using the mint function
  await erc721Token.mint(deployer.address);
  await erc721Token.mint(user1.address);
  await erc721Token.mint(user2.address);



  console.log("ERC721: Чеканка токена...");
  const mint721Tx = await erc721Token.connect(deployer).mint(user1.address);
  console.log("Хэш чеканки ERC721:", mint721Tx.hash);
  const mintReceipt = await mint721Tx.wait();

  // Логирование всех логов транзакции mint
  console.log("Все логи из транзакции mint:", mintReceipt.logs);

  // Извлечение tokenId из события Transfer
  let tokenId;
  for (const log of mintReceipt.logs) {
    try {
      const parsedLog = erc721Token.interface.parseLog(log);
      if (parsedLog.name === "Transfer" && parsedLog.args.from === ethers.constants.AddressZero) {
        tokenId = parsedLog.args.tokenId.toNumber();
        break;
      }
    } catch (e) {
      // Игнорируем логи, которые не соответствуют событиям контракта ERC721
    }
  }

  if (tokenId === undefined) {
    // Если событие Transfer не найдено, используем nextTokenId - 1
    tokenId = Number((await erc721Token.nextTokenId()) - 1n);
    console.log(`Предполагаемый tokenId: ${tokenId}`);
  } else {
    console.log(`Чеканен ERC721 токен ID ${tokenId} для ${user1.address}`);
  }

  // Проверка владельца токена
  const owner = await erc721Token.ownerOf(tokenId);
  console.log(`Владелец токена ID ${tokenId}: ${owner}`);
  if (owner.toLowerCase() !== user1.address.toLowerCase()) {
    throw new Error(`User1 не владеет токеном ID ${tokenId}`);
  }

  // ERC721: transferFrom
  console.log(`ERC721: Перевод токена ID ${tokenId}...`);
  const transfer721Tx = await erc721Token.connect(user1).transferFrom(user1.address, user2.address, tokenId);
  console.log("Хэш перевода ERC721:", transfer721Tx.hash);
  await transfer721Tx.wait();
  console.log(`User1 перевел токен ID ${tokenId} на User2`);

  // ERC721: buy (предполагается, что функция buyToken доступна и реализована)
  console.log("ERC721: Покупка токена...");
  const tokenPrice = await erc721Token.tokenPrice();
  const buyTx = await erc721Token.connect(user1).buyToken({ value: tokenPrice });
  console.log("Хэш покупки ERC721:", buyTx.hash);
  await buyTx.wait();
  console.log(`User1 купил ERC721 токен`);

  // Определение переменных addr1 и addr2
  const addr1 = user1;
  const addr2 = user2;

  // SafeTransfer ERC721 (пример использования safeTransferFrom)
  console.log("ERC721: Безопасный перевод токена...");
  const safeTransferTx = await erc721Token.connect(user2)["safeTransferFrom(address,address,uint256)"](user2.address, user1.address, tokenId);
  console.log("Хэш безопасного перевода ERC721:", safeTransferTx.hash);
  await safeTransferTx.wait();
  console.log(`User2 безопасно перевел токен ID ${tokenId} обратно на User1`);

  // --- Взаимодействие с ERC1155 ---
  console.log("ERC1155: Чеканка токенов...");
  const mint1155Tx = await erc1155Token.connect(deployer).mint(user1.address, 1, 10, "0x");
  console.log("Хэш чеканки ERC1155:", mint1155Tx.hash);
  await mint1155Tx.wait();
  console.log(`Чеканено 10 токенов ID 1 для ${user1.address}`);

  // Покупка токенов ERC1155
  console.log("ERC1155: Покупка токенов...");
  const buy1155Tx = await erc1155Token.connect(user2).buyToken(5, { value: ethers.parseEther("0.0005") });
  console.log("Хэш покупки ERC1155:", buy1155Tx.hash);
  await buy1155Tx.wait();
  console.log(`User2 купил 5 токенов ERC1155`);

  // Перевод токенов ERC1155
  console.log("ERC1155: Перевод токенов...");
  const transfer1155Tx = await erc1155Token.connect(user1).safeTransferFrom(user1.address, user2.address, 1, 5, "0x");
  console.log("Хэш перевода ERC1155:", transfer1155Tx.hash);
  await transfer1155Tx.wait();
  console.log(`User1 перевел 5 токенов ERC1155 ID 1 на User2`);

  // Перевод пакета токенов ERC1155
  console.log("ERC1155: Перевод пакета токенов...");
  const transferBatch1155Tx = await erc1155Token.connect(user1).safeBatchTransferFrom(
    user1.address,
    user2.address,
    [1],
    [5],
    "0x"
  );
  console.log("Хэш перевода пакета ERC1155:", transferBatch1155Tx.hash);
  await transferBatch1155Tx.wait();
  console.log(`User1 перевел пакет из 5 токенов ERC1155 ID 1 на User2`);

  console.log("Скрипт успешно завершен");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Ошибка в взаимодействии:", error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await hre.ethers.getSigners();

  // Подключение к развернутым контрактам
  const erc20Address = "0x5B1F4956703581b40961e441785BBE85E25ce9c4";
  const erc721Address = "0x9b5A3e425cF034e55C7336C2942857Ef6Bc732B1";
  const erc1155Address = "0x8c2726BE09bD4f0188BCd1AaC28382FBcF988d14";

  const ERC20Token = await hre.ethers.getContractFactory("MyERC20Token");
  const erc20Token = await ERC20Token.attach(erc20Address);

  const ERC721Token = await hre.ethers.getContractFactory("MyERC721Token");
  const erc721Token = await ERC721Token.attach(erc721Address);

  const ERC1155Token = await hre.ethers.getContractFactory("MyERC1155Token");
  const erc1155Token = await ERC1155Token.attach(erc1155Address);

  // ERC20: transfer
  console.log("ERC20: transfer");
  await erc20Token.transfer(user1.address, 100);
  console.log(`Transferred 100 tokens to ${user1.address}`);

  // ERC20: transferFrom
  console.log("ERC20: transferFrom");
  await erc20Token.connect(user1).approve(user2.address, 50);
  await erc20Token.connect(user2).transferFrom(user1.address, user2.address, 50);
  console.log(`User2 transferred 50 tokens from User1 to User2`);

  // ERC20: mint (в данном контракте нет функции mint для публичного вызова, но если бы была)
  // await erc20Token.mint(user1.address, 100);

  // ERC721: mint
  console.log("ERC721: mint");
  await erc721Token.mint(user1.address);
  console.log(`Minted ERC721 token to ${user1.address}`);

  // ERC721: safeMint (если бы функция была реализована)
  // await erc721Token.safeMint(user1.address);

  // ERC721: transferFrom
  console.log("ERC721: transferFrom");
  await erc721Token.connect(user1).transferFrom(user1.address, user2.address, 0);
  console.log(`User1 transferred token ID 0 to User2`);

  // ERC721: buy
  console.log("ERC721: buy");
  const tokenPrice = await erc721Token.tokenPrice();
  await erc721Token.connect(user1).buyToken({ value: tokenPrice });
  console.log(`User1 bought an ERC721 token`);

  // ERC1155: mint
  console.log("ERC1155: mint");
  await erc1155Token.mint(user1.address, 2, 50, "0x");
  console.log(`Minted 50 tokens of ID 2 to ${user1.address}`);

  // ERC1155: transfer
  console.log("ERC1155: safeTransferFrom");
  await erc1155Token.connect(user1).safeTransferFrom(user1.address, user2.address, 1, 10, "0x");
  console.log(`User1 transferred 10 tokens of ID 1 to User2`);

  // ERC1155: buy
  console.log("ERC1155: buy");
  const amountToBuy = 5;
  const totalPrice = (await erc1155Token.tokenPrice()).mul(amountToBuy);
  await erc1155Token.connect(user2).buyToken(amountToBuy, { value: totalPrice });
  console.log(`User2 bought ${amountToBuy} ERC1155 tokens`);

  // Другие вызовы функций по необходимости
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in interaction:", error);
    process.exit(1);
  });

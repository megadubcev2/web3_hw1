async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Деплой ERC20
  const ERC20Token = await ethers.getContractFactory("MyERC20Token");
  const erc20Token = await ERC20Token.deploy(1000); // Задаем начальное количество токенов, например, 1000
  await erc20Token.waitForDeployment();
  console.log("ERC20 Token deployed to:", await erc20Token.getAddress());

  // Деплой ERC721
  const ERC721Token = await ethers.getContractFactory("MyERC721Token");
  const erc721Token = await ERC721Token.deploy();
  await erc721Token.waitForDeployment();
  console.log("ERC721 Token deployed to:", await erc721Token.getAddress());

  // Деплой ERC1155
  const ERC1155Token = await ethers.getContractFactory("MyERC1155Token");
  const erc1155Token = await ERC1155Token.deploy();
  await erc1155Token.waitForDeployment();
  console.log("ERC1155 Token deployed to:", await erc1155Token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

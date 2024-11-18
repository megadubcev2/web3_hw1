const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyERC721Token", function () {
  let ERC721Token, erc721Token, owner, addr1, addr2;
  const AddressZero = "0x0000000000000000000000000000000000000000"; // Определяем вручную

  beforeEach(async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();
    ERC721Token = await ethers.getContractFactory("MyERC721Token");
    erc721Token = await ERC721Token.deploy();
    await erc721Token.waitForDeployment(); // ethers v6
    const erc721Address = await erc721Token.getAddress();
    console.log("erc721Token address:", erc721Address);
  });

  describe("Deployment", function () {
    it("Должен установить имя и символ токена", async function () {
      expect(await erc721Token.name()).to.equal("MyERC721Token");
      expect(await erc721Token.symbol()).to.equal("M721");
    });

    it("Должен установить начальное значение nextTokenId", async function () {
      expect(await erc721Token.nextTokenId()).to.equal(0n);
    });
  });

  describe("Buy Token", function () {
    it("Должен позволить пользователю покупать токен за ETH", async function () {
      const tokenPrice = await erc721Token.tokenPrice(); // BigInt
      const amountToBuy = 1n; // ERC721 обычно покупается по одному токену
      const totalPrice = tokenPrice * amountToBuy; // BigInt

      await expect(
        erc721Token.connect(addr1).buyToken({ value: totalPrice })
      )
        .to.emit(erc721Token, "Transfer")
        .
        (
          AddressZero,
          addr1.address,
          0n
        );

      expect(await erc721Token.ownerOf(0n)).to.equal(addr1.address);
      expect(await erc721Token.nextTokenId()).to.equal(1n);
    });

    it("Должен отклонить покупку с недостаточным ETH", async function () {
      const tokenPrice = await erc721Token.tokenPrice(); // BigInt
      const amountToBuy = 1n;
      const totalPrice = tokenPrice - 1n; // Меньше на 1 wei

      await expect(
        erc721Token.connect(addr1).buyToken({ value: totalPrice })
      ).to.be.revertedWith("Insufficient funds for purchase");
    });

    it("Должен отклонить покупку с избыточным ETH", async function () {
      const tokenPrice = await erc721Token.tokenPrice(); // BigInt
      const amountToBuy = 1n;
      const totalPrice = tokenPrice + 1n; // Больше на 1 wei

      await expect(
        erc721Token.connect(addr1).buyToken({ value: totalPrice })
      ).to.be.revertedWith("Insufficient funds for purchase");
    });
  });

  describe("Set Token Price", function () {
    it("Должен позволить владельцу изменять цену токена", async function () {
      const newPrice = ethers.parseEther("0.001"); // BigInt
      await erc721Token.setTokenPrice(newPrice);
      expect(await erc721Token.tokenPrice()).to.equal(newPrice);
    });

    it("Должен отклонить установку цены токена не владельцем", async function () {
      const newPrice = ethers.parseEther("0.001"); // BigInt
      await expect(
        erc721Token.connect(addr1).setTokenPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Token URI", function () {
    it("Должен возвращать правильный tokenURI", async function () {
      const tokenPrice = await erc721Token.tokenPrice(); // BigInt
      await erc721Token.connect(addr1).buyToken({ value: tokenPrice });

      const tokenURI = await erc721Token.tokenURI(0n);
      expect(tokenURI).to.equal("https://myapi.com/metadata/0.json");
    });

    it("Должен отклонить запрос tokenURI для несуществующего токена", async function () {
      await expect(erc721Token.tokenURI(1n)).to.be.revertedWith(
        "ERC721Metadata: URI query for nonexistent token"
      );
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      const tokenPrice = await erc721Token.tokenPrice(); // BigInt
      await erc721Token.connect(addr1).buyToken({ value: tokenPrice });
    });

    it("Должен позволить владельцу передавать NFT", async function () {
      await erc721Token.connect(addr1).transferFrom(addr1.address, addr2.address, 0n);
      expect(await erc721Token.ownerOf(0n)).to.equal(addr2.address);
    });

    it("Должен отклонить передачу не владельцем", async function () {
      await expect(
        erc721Token.connect(addr2).transferFrom(addr1.address, addr2.address, 0n)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });
});

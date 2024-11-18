const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyERC1155Token", function () {
  let ERC1155Token, erc1155Token, owner, addr1, addr2;
  const TOKEN_ID = 1n;
  const initialSupply = 100n;
  const tokenPrice = ethers.parseEther("0.0001"); // BigInt
  const AddressZero = "0x0000000000000000000000000000000000000000"; // Определяем вручную

  beforeEach(async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();
    ERC1155Token = await ethers.getContractFactory("MyERC1155Token");
    erc1155Token = await ERC1155Token.deploy();
    await erc1155Token.waitForDeployment(); // ethers v6
    const erc1155Address = await erc1155Token.getAddress();
    console.log("erc1155Token address:", erc1155Address);
  });

  describe("Deployment", function () {
    it("Должен установить базовый URI", async function () {
      expect(await erc1155Token.uri(TOKEN_ID)).to.equal("https://myapi.com/metadata/{id}.json");
    });

    it("Должен минтить начальное количество токенов владельцу", async function () {
      const ownerBalance = await erc1155Token.balanceOf(owner.address, TOKEN_ID);
      expect(ownerBalance).to.equal(initialSupply);
    });
  });

  describe("Buy Token", function () {
    it("Должен позволить пользователю покупать ERC1155 токены за ETH", async function () {
      const amountToBuy = 10n;
      const totalPrice = tokenPrice * amountToBuy;

      await expect(
        erc1155Token.connect(addr1).buyToken(amountToBuy, { value: totalPrice })
      )
        .to.emit(erc1155Token, "TransferSingle")
        .withArgs(
          addr1.address, // operator должен быть addr1.address
          AddressZero,
          addr1.address,
          TOKEN_ID,
          amountToBuy
        );

      const addr1Balance = await erc1155Token.balanceOf(addr1.address, TOKEN_ID);
      expect(addr1Balance).to.equal(amountToBuy);
    });

    it("Должен отклонить покупку с недостаточным ETH", async function () {
      const amountToBuy = 10n;
      const totalPrice = tokenPrice * amountToBuy - 1n; // Меньше на 1 wei

      await expect(
        erc1155Token.connect(addr1).buyToken(amountToBuy, { value: totalPrice })
      ).to.be.revertedWith("Insufficient funds for purchase");
    });

    it("Должен отклонить покупку с избыточным ETH", async function () {
      const amountToBuy = 10n;
      const totalPrice = tokenPrice * amountToBuy + 1n; // Больше на 1 wei

      await expect(
        erc1155Token.connect(addr1).buyToken(amountToBuy, { value: totalPrice })
      ).to.be.revertedWith("Insufficient funds for purchase");
    });
  });

  describe("Set Token Price", function () {
    it("Должен позволить владельцу изменять цену токена", async function () {
      const newPrice = ethers.parseEther("0.001"); // BigInt
      await erc1155Token.setTokenPrice(newPrice);
      expect(await erc1155Token.tokenPrice()).to.equal(newPrice);
    });

    it("Должен отклонить установку цены токена не владельцем", async function () {
      const newPrice = ethers.parseEther("0.001");
      await expect(
        erc1155Token.connect(addr1).setTokenPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Minting", function () {
    it("Должен позволить владельцу минтить дополнительные токены", async function () {
      const amountToMint = 50n;
      await erc1155Token.mint(addr1.address, TOKEN_ID, amountToMint, "0x");

      const addr1Balance = await erc1155Token.balanceOf(addr1.address, TOKEN_ID);
      expect(addr1Balance).to.equal(amountToMint);
    });

    it("Должен отклонить минтинг не владельцем", async function () {
      const amountToMint = 50n;
      await expect(
        erc1155Token.connect(addr1).mint(addr1.address, TOKEN_ID, amountToMint, "0x")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      // Минтим токены addr1 для тестов передачи
      const amountToBuy = 10n;
      const totalPrice = tokenPrice * amountToBuy;
      await erc1155Token.connect(addr1).buyToken(amountToBuy, { value: totalPrice });
    });

    it("Должен позволить передавать ERC1155 токены", async function () {
      await erc1155Token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, TOKEN_ID, 5n, "0x");

      const addr1Balance = await erc1155Token.balanceOf(addr1.address, TOKEN_ID);
      const addr2Balance = await erc1155Token.balanceOf(addr2.address, TOKEN_ID);
      expect(addr1Balance).to.equal(5n);
      expect(addr2Balance).to.equal(5n);
    });

    it("Должен отклонить передачу больше, чем баланс", async function () {
      await expect(
        erc1155Token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, TOKEN_ID, 15n, "0x")
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });

    it("Должен отклонить передачу не владельцем", async function () {
      await expect(
        erc1155Token.connect(addr2).safeTransferFrom(addr1.address, addr2.address, TOKEN_ID, 5n, "0x")
      ).to.be.revertedWith("ERC1155: caller is not token owner or approved");
    });
  });
});

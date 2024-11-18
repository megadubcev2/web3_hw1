// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyERC721Token
/// @author
/// @notice ERC721 токен с возможностью покупки за ETH и управления владельцем
contract MyERC721Token is ERC721, Ownable {
    /// @notice Следующий ID токена, который будет создан
    uint256 public nextTokenId = 0;

    /// @notice Текущая цена одного токена в ETH
    uint256 public tokenPrice = 0.001 ether;

    /// @notice Конструктор контракта токена
    constructor() ERC721("MyERC721Token", "M721") {}

    /**
     * @notice Позволяет пользователю покупать NFT за ETH.
     * @dev Требует отправки точного количества ETH, равного цене токена.
     *      После успешной оплаты токен минтится на адрес отправителя.
     */
    function buyToken() external payable {
        require(msg.value == tokenPrice, "Insufficient funds for purchase");

        _safeMint(msg.sender, nextTokenId);
        nextTokenId += 1;
    }

    /**
     * @notice Позволяет владельцу изменять цену токена.
     * @dev Доступно только владельцу контракта.
     * @param newPrice Новая цена токена.
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }

    /**
     * @notice Позволяет владельцу минтить дополнительные токены.
     * @dev Доступно только владельцу контракта. Токен отправляется указанному получателю.
     * @param to Адрес получателя токена.
     */
    function mint(address to) public onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId += 1;
    }

    /**
     * @notice Возвращает URI токена.
     * @dev Используется для получения метаданных токена.
     *      Генерирует URI на основе ID токена.
     * @param tokenId ID токена.
     * @return string URI токена в формате строки.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked("https://myapi.com/metadata/", Strings.toString(tokenId), ".json"));
    }
}

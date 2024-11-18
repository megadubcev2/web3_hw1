// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyERC1155Token
/// @author
/// @notice Контракт ERC1155 с функциями покупки токенов за ETH и управления владельцем
contract MyERC1155Token is ERC1155, Ownable {
    /// @notice ID токена, который используется по умолчанию
    uint256 public constant TOKEN_ID = 1;

    /// @notice Цена за единицу токена в ETH
    uint256 public tokenPrice = 0.0001 ether;

    /// @notice Конструктор контракта
    /// @dev Минтит 100 токенов с ID TOKEN_ID для владельца контракта
    constructor() ERC1155("https://myapi.com/metadata/{id}.json") {
        _mint(msg.sender, TOKEN_ID, 100, "");
    }

    /**
     * @notice Позволяет пользователю покупать ERC1155 токены за ETH.
     * @dev Пользователь должен отправить точное количество ETH, равное `amount * tokenPrice`.
     * @param amount Количество токенов для покупки.
     */
    function buyToken(uint256 amount) external payable {
        require(msg.value == amount * tokenPrice, "Insufficient funds for purchase");

        _mint(msg.sender, TOKEN_ID, amount, ""); // Покупка токена
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
     * @dev Минтит указанное количество токенов с заданным ID на указанный адрес.
     * @param to Адрес получателя.
     * @param id ID токена.
     * @param amount Количество токенов для минтинга.
     * @param data Дополнительные данные (может быть пустым).
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }
}

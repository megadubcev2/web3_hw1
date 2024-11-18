// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyERC20Token
/// @author
/// @notice ERC20 токен с возможностью установки комиссии за перевод
contract MyERC20Token is ERC20Permit, Ownable {
    /// @notice Процент комиссии за перевод (1 = 0.001%)
    uint256 public transferFeePercentage = 1; // Комиссия 0.001%

    /// @notice Конструктор контракта токена
    /// @param initialSupply Начальное количество токенов, которое будет создано
    constructor(uint256 initialSupply) ERC20("MyERC20Token", "M20") ERC20Permit("MyERC20Token") {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Устанавливает новую комиссию за перевод.
     * @dev Функция доступна только владельцу контракта.
     * @param newFee Новое значение комиссии (не должно превышать 100).
     */
    function setTransferFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee cannot exceed 100%");
        transferFeePercentage = newFee;
    }

    /**
     * @notice Переводит указанное количество токенов получателю с удержанием комиссии.
     * @param recipient Адрес получателя токенов.
     * @param amount Количество токенов для перевода.
     * @return bool Успешность операции перевода.
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        uint256 fee = (amount * transferFeePercentage) / 100000;
        uint256 amountAfterFee = amount - fee;

        _transfer(_msgSender(), address(this), fee); // Отправляем комиссию контракту
        _transfer(_msgSender(), recipient, amountAfterFee);

        return true;
    }

    /**
     * @notice Переводит указанное количество токенов от одного адреса к другому с удержанием комиссии.
     * @param sender Адрес отправителя токенов.
     * @param recipient Адрес получателя токенов.
     * @param amount Количество токенов для перевода.
     * @return bool Успешность операции перевода.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        uint256 fee = (amount * transferFeePercentage) / 100000;
        uint256 amountAfterFee = amount - fee;

        _transfer(sender, address(this), fee); // Отправляем комиссию контракту
        _transfer(sender, recipient, amountAfterFee);

        uint256 currentAllowance = allowance(sender, _msgSender());
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, _msgSender(), currentAllowance - amount);

        return true;
    }
}


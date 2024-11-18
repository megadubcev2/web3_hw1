const { ethers } = require("hardhat");
const chalk = require('chalk'); // Для цветного вывода (опционально)

// Функция для форматирования больших чисел (BigNumber) в строку
function formatBigNumber(value, decimals = 18) {
  try {
    return ethers.utils.formatUnits(value, decimals);
  } catch (error) {
    // Если форматирование не удалось, возвращаем исходное значение
    return value.toString();
  }
}

// Функция для форматирования событий ERC20 Transfer
function formatERC20Transfer(event) {
  const { from, to, value } = event.args;
  return {
    Транзакция: event.transactionHash,
    Блок: event.blockNumber,
    От: from,
    Кому: to,
    Сумма: formatBigNumber(value),
  };
}

// Функция для форматирования событий ERC1155 TransferSingle
function formatERC1155TransferSingle(event) {
  const { operator, from, to, id, value } = event.args;
  return {
    Транзакция: event.transactionHash,
    Блок: event.blockNumber,
    Оператор: operator,
    От: from,
    Кому: to,
    ИдентификаторТокена: id.toString(),
    Количество: value.toString(),
  };
}

// Функция для форматирования событий ERC1155 TransferBatch
function formatERC1155TransferBatch(event) {
  const { operator, from, to, ids, values } = event.args;

  // Проверяем, что ids и values являются массивами
  const idsArray = Array.isArray(ids) ? ids.map(id => id.toString()) : [ids.toString()];
  const valuesArray = Array.isArray(values) ? values.map(value => value.toString()) : [values.toString()];

  return {
    Транзакция: event.transactionHash,
    Блок: event.blockNumber,
    Оператор: operator,
    От: from,
    Кому: to,
    ИдентификаторыТокенов: idsArray.join(", "),
    Количества: valuesArray.join(", "),
  };
}

async function queryEvents() {
  try {
    // Адреса контрактов
    const erc20Address = "0x358fb3823e145D8cDb09C620d5f65f0E1091Bbb4";
    const erc1155Address = "0x8c2726BE09bD4f0188BCd1AaC28382FBcF988d14";

    // Подключение к контрактам
    const ERC20Token = await ethers.getContractFactory("MyERC20Token");
    const erc20Token = ERC20Token.attach(erc20Address);

    const ERC1155Token = await ethers.getContractFactory("MyERC1155Token");
    const erc1155Token = ERC1155Token.attach(erc1155Address);

    console.log(chalk.blue("\n=== События Transfer ERC20 ==="));
    // Запрос событий Transfer из ERC20
    const transferEventsERC20 = await erc20Token.queryFilter(
      erc20Token.filters.Transfer(null, null),
      "earliest",
      "latest"
    );

    if (transferEventsERC20.length === 0) {
      console.log("Нет событий Transfer ERC20.");
    } else {
      transferEventsERC20.forEach(event => {
        const formattedEvent = formatERC20Transfer(event);
        console.log(chalk.green("----------------------------------------"));
        console.table(formattedEvent);
      });
    }

    console.log(chalk.blue("\n=== События TransferSingle ERC1155 ==="));
    // Запрос событий TransferSingle из ERC1155
    const transferSingleEvents = await erc1155Token.queryFilter(
      erc1155Token.filters.TransferSingle(null, null, null),
      "earliest",
      "latest"
    );

    if (transferSingleEvents.length === 0) {
      console.log("Нет событий TransferSingle ERC1155.");
    } else {
      transferSingleEvents.forEach(event => {
        const formattedEvent = formatERC1155TransferSingle(event);
        console.log(chalk.green("----------------------------------------"));
        console.table(formattedEvent);
      });
    }

    console.log(chalk.blue("\n=== События TransferBatch ERC1155 ==="));
    // Запрос событий TransferBatch из ERC1155
    const transferBatchEvents = await erc1155Token.queryFilter(
      erc1155Token.filters.TransferBatch(null, null, null),
      "earliest",
      "latest"
    );

    if (transferBatchEvents.length === 0) {
      console.log("Нет событий TransferBatch ERC1155.");
    } else {
      transferBatchEvents.forEach(event => {
        const formattedEvent = formatERC1155TransferBatch(event);
        console.log(chalk.green("----------------------------------------"));
        console.table(formattedEvent);
      });
    }

    console.log(chalk.blue("\nЗапрос событий завершен."));
  } catch (error) {
    console.error(chalk.red("Ошибка при запросе событий:"), error);
    process.exit(1);
  }
}

queryEvents()
  .catch((error) => {
    console.error(chalk.red("Необработанная ошибка:"), error);
    process.exit(1);
  });

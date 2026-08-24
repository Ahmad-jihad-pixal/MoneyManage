-- Adds Account.openingBalance: the immutable balance set at account creation,
-- kept separate from Account.balance (which mutates as transactions/transfers happen).
ALTER TABLE `Account` ADD COLUMN `openingBalance` DECIMAL(12, 2) NOT NULL DEFAULT 0;
UPDATE `Account` SET `openingBalance` = `balance`;

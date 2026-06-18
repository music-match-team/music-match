/*
  Warnings:

  - You are about to drop the `match` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `match`;

-- CreateTable
CREATE TABLE `match_utente` (
    `idMatch` INTEGER NOT NULL AUTO_INCREMENT,
    `dataMatch` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idUtenteOrigina` INTEGER NOT NULL,
    `idUtenteOttiene` INTEGER NOT NULL,

    PRIMARY KEY (`idMatch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

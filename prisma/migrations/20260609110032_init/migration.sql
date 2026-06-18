-- CreateTable
CREATE TABLE `Utente` (
    `idUtente` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `ruolo` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `livelloEsperienza` VARCHAR(191) NULL,
    `lat` DOUBLE NULL,
    `long` DOUBLE NULL,
    `dataCreazione` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Utente_username_key`(`username`),
    UNIQUE INDEX `Utente_email_key`(`email`),
    PRIMARY KEY (`idUtente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Amministratore` (
    `idAdmin` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Amministratore_username_key`(`username`),
    UNIQUE INDEX `Amministratore_email_key`(`email`),
    PRIMARY KEY (`idAdmin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Strumento` (
    `idStrumento` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idStrumento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genere` (
    `idGenere` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idGenere`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Citta` (
    `idCitta` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idCitta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evento` (
    `idEvento` INTEGER NOT NULL AUTO_INCREMENT,
    `titolo` VARCHAR(191) NOT NULL,
    `descrizione` VARCHAR(191) NULL,
    `luogo` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idEvento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `idMedia` INTEGER NOT NULL AUTO_INCREMENT,
    `source` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descrizione` VARCHAR(191) NULL,
    `dataUpload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idUtente` INTEGER NOT NULL,

    PRIMARY KEY (`idMedia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `idMatch` INTEGER NOT NULL AUTO_INCREMENT,
    `dataMatch` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idUtenteOrigina` INTEGER NOT NULL,
    `idUtenteOttiene` INTEGER NOT NULL,

    PRIMARY KEY (`idMatch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messaggio` (
    `idMessaggio` INTEGER NOT NULL AUTO_INCREMENT,
    `contenuto` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idMatch` INTEGER NOT NULL,
    `idUtenteMittente` INTEGER NOT NULL,

    PRIMARY KEY (`idMessaggio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Segnalazione` (
    `idSegnalazione` INTEGER NOT NULL AUTO_INCREMENT,
    `motivo` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idMittente` INTEGER NOT NULL,
    `idDestinatario` INTEGER NOT NULL,

    PRIMARY KEY (`idSegnalazione`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sanzione` (
    `idSanzione` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `dataInizio` DATETIME(3) NOT NULL,
    `dataFine` DATETIME(3) NULL,
    `idAdmin` INTEGER NOT NULL,
    `idUtente` INTEGER NOT NULL,

    PRIMARY KEY (`idSanzione`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suona` (
    `idUtente` INTEGER NOT NULL,
    `idStrumento` INTEGER NOT NULL,

    PRIMARY KEY (`idUtente`, `idStrumento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preferisce` (
    `idUtente` INTEGER NOT NULL,
    `idGenere` INTEGER NOT NULL,

    PRIMARY KEY (`idUtente`, `idGenere`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreferisceLuogo` (
    `idUtente` INTEGER NOT NULL,
    `idCitta` INTEGER NOT NULL,

    PRIMARY KEY (`idUtente`, `idCitta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partecipa` (
    `idUtente` INTEGER NOT NULL,
    `idEvento` INTEGER NOT NULL,

    PRIMARY KEY (`idUtente`, `idEvento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

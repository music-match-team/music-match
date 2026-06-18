-- AddForeignKey
ALTER TABLE `messaggio` ADD CONSTRAINT `messaggio_idUtenteMittente_fkey` FOREIGN KEY (`idUtenteMittente`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

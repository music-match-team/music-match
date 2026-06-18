-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_idUtente_fkey` FOREIGN KEY (`idUtente`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

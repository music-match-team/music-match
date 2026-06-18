-- AddForeignKey
ALTER TABLE `messaggio` ADD CONSTRAINT `messaggio_idMatch_fkey` FOREIGN KEY (`idMatch`) REFERENCES `match_utente`(`idMatch`) ON DELETE RESTRICT ON UPDATE CASCADE;

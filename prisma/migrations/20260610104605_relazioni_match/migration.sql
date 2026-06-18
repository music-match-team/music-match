-- AddForeignKey
ALTER TABLE `match_utente` ADD CONSTRAINT `match_utente_idUtenteOrigina_fkey` FOREIGN KEY (`idUtenteOrigina`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_utente` ADD CONSTRAINT `match_utente_idUtenteOttiene_fkey` FOREIGN KEY (`idUtenteOttiene`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

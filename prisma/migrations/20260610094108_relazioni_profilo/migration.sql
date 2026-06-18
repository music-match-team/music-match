-- AddForeignKey
ALTER TABLE `Suona` ADD CONSTRAINT `Suona_idUtente_fkey` FOREIGN KEY (`idUtente`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suona` ADD CONSTRAINT `Suona_idStrumento_fkey` FOREIGN KEY (`idStrumento`) REFERENCES `Strumento`(`idStrumento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preferisce` ADD CONSTRAINT `Preferisce_idUtente_fkey` FOREIGN KEY (`idUtente`) REFERENCES `Utente`(`idUtente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preferisce` ADD CONSTRAINT `Preferisce_idGenere_fkey` FOREIGN KEY (`idGenere`) REFERENCES `Genere`(`idGenere`) ON DELETE RESTRICT ON UPDATE CASCADE;

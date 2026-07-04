-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Utente" (
    "idUtente" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ruolo" TEXT NOT NULL,
    "bio" TEXT,
    "livelloEsperienza" TEXT,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "citta" TEXT,
    "dataCreazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("idUtente")
);

-- CreateTable
CREATE TABLE "Amministratore" (
    "idAdmin" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Amministratore_pkey" PRIMARY KEY ("idAdmin")
);

-- CreateTable
CREATE TABLE "Strumento" (
    "idStrumento" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Strumento_pkey" PRIMARY KEY ("idStrumento")
);

-- CreateTable
CREATE TABLE "Genere" (
    "idGenere" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Genere_pkey" PRIMARY KEY ("idGenere")
);

-- CreateTable
CREATE TABLE "Citta" (
    "idCitta" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Citta_pkey" PRIMARY KEY ("idCitta")
);

-- CreateTable
CREATE TABLE "evento" (
    "idEvento" SERIAL NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT,
    "idCitta" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("idEvento")
);

-- CreateTable
CREATE TABLE "media" (
    "idMedia" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descrizione" TEXT,
    "dataUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUtente" INTEGER NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("idMedia")
);

-- CreateTable
CREATE TABLE "match_utente" (
    "idMatch" SERIAL NOT NULL,
    "dataMatch" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUtenteOrigina" INTEGER NOT NULL,
    "idUtenteOttiene" INTEGER NOT NULL,

    CONSTRAINT "match_utente_pkey" PRIMARY KEY ("idMatch")
);

-- CreateTable
CREATE TABLE "messaggio" (
    "idMessaggio" SERIAL NOT NULL,
    "contenuto" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idMatch" INTEGER NOT NULL,
    "idUtenteMittente" INTEGER NOT NULL,

    CONSTRAINT "messaggio_pkey" PRIMARY KEY ("idMessaggio")
);

-- CreateTable
CREATE TABLE "Segnalazione" (
    "idSegnalazione" SERIAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idMittente" INTEGER NOT NULL,
    "idDestinatario" INTEGER NOT NULL,

    CONSTRAINT "Segnalazione_pkey" PRIMARY KEY ("idSegnalazione")
);

-- CreateTable
CREATE TABLE "sanzione" (
    "idSanzione" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "dataInizio" TIMESTAMP(3) NOT NULL,
    "dataFine" TIMESTAMP(3),
    "idAdmin" INTEGER NOT NULL,
    "idUtente" INTEGER NOT NULL,

    CONSTRAINT "sanzione_pkey" PRIMARY KEY ("idSanzione")
);

-- CreateTable
CREATE TABLE "Suona" (
    "idUtente" INTEGER NOT NULL,
    "idStrumento" INTEGER NOT NULL,

    CONSTRAINT "Suona_pkey" PRIMARY KEY ("idUtente","idStrumento")
);

-- CreateTable
CREATE TABLE "Preferisce" (
    "idUtente" INTEGER NOT NULL,
    "idGenere" INTEGER NOT NULL,

    CONSTRAINT "Preferisce_pkey" PRIMARY KEY ("idUtente","idGenere")
);

-- CreateTable
CREATE TABLE "PreferisceLuogo" (
    "idUtente" INTEGER NOT NULL,
    "idCitta" INTEGER NOT NULL,

    CONSTRAINT "PreferisceLuogo_pkey" PRIMARY KEY ("idUtente","idCitta")
);

-- CreateTable
CREATE TABLE "Crea" (
    "idUtente" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,

    CONSTRAINT "Crea_pkey" PRIMARY KEY ("idUtente","idEvento")
);

-- CreateTable
CREATE TABLE "partecipa" (
    "idUtente" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,

    CONSTRAINT "partecipa_pkey" PRIMARY KEY ("idUtente","idEvento")
);

-- CreateTable
CREATE TABLE "Notifica" (
    "idNotifica" SERIAL NOT NULL,
    "messaggio" TEXT NOT NULL,
    "letta" BOOLEAN NOT NULL DEFAULT false,
    "dataCreazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUtente" INTEGER NOT NULL,

    CONSTRAINT "Notifica_pkey" PRIMARY KEY ("idNotifica")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utente_username_key" ON "Utente"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Utente_email_key" ON "Utente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Amministratore_username_key" ON "Amministratore"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Amministratore_email_key" ON "Amministratore"("email");

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_idCitta_fkey" FOREIGN KEY ("idCitta") REFERENCES "Citta"("idCitta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_utente" ADD CONSTRAINT "match_utente_idUtenteOrigina_fkey" FOREIGN KEY ("idUtenteOrigina") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_utente" ADD CONSTRAINT "match_utente_idUtenteOttiene_fkey" FOREIGN KEY ("idUtenteOttiene") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaggio" ADD CONSTRAINT "messaggio_idMatch_fkey" FOREIGN KEY ("idMatch") REFERENCES "match_utente"("idMatch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaggio" ADD CONSTRAINT "messaggio_idUtenteMittente_fkey" FOREIGN KEY ("idUtenteMittente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_idMittente_fkey" FOREIGN KEY ("idMittente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_idDestinatario_fkey" FOREIGN KEY ("idDestinatario") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanzione" ADD CONSTRAINT "sanzione_idAdmin_fkey" FOREIGN KEY ("idAdmin") REFERENCES "Amministratore"("idAdmin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanzione" ADD CONSTRAINT "sanzione_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suona" ADD CONSTRAINT "Suona_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suona" ADD CONSTRAINT "Suona_idStrumento_fkey" FOREIGN KEY ("idStrumento") REFERENCES "Strumento"("idStrumento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferisce" ADD CONSTRAINT "Preferisce_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferisce" ADD CONSTRAINT "Preferisce_idGenere_fkey" FOREIGN KEY ("idGenere") REFERENCES "Genere"("idGenere") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crea" ADD CONSTRAINT "Crea_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crea" ADD CONSTRAINT "Crea_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "evento"("idEvento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partecipa" ADD CONSTRAINT "partecipa_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partecipa" ADD CONSTRAINT "partecipa_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "evento"("idEvento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifica" ADD CONSTRAINT "Notifica_idUtente_fkey" FOREIGN KEY ("idUtente") REFERENCES "Utente"("idUtente") ON DELETE RESTRICT ON UPDATE CASCADE;

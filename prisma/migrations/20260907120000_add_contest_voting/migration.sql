-- CreateTable
CREATE TABLE "Contestant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "song" TEXT NOT NULL,
    "originalArtist" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestVote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contestantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contestant_id_idx" ON "Contestant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestVote_userId_key" ON "ContestVote"("userId");

-- CreateIndex
CREATE INDEX "ContestVote_contestantId_idx" ON "ContestVote"("contestantId");

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestVote" ADD CONSTRAINT "ContestVote_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

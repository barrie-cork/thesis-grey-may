/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Task";

-- CreateTable
CREATE TABLE "SearchSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SearchSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchExecution" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "resultCount" INTEGER,
    "error" TEXT,
    "queryId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "SearchExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawSearchResult" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "searchExecutionId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "snippet" TEXT,
    "rank" INTEGER NOT NULL,
    "searchEngine" TEXT NOT NULL,
    "rawResponse" JSONB NOT NULL,

    CONSTRAINT "RawSearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedResult" (
    "id" TEXT NOT NULL,
    "rawResultId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "snippet" TEXT,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "ProcessedResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateRelationship" (
    "id" TEXT NOT NULL,
    "primaryResultId" TEXT NOT NULL,
    "duplicateResultId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "duplicateType" TEXT NOT NULL,

    CONSTRAINT "DuplicateRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "ReviewTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewTagAssignment" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReviewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resultId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedResult_rawResultId_key" ON "ProcessedResult"("rawResultId");

-- CreateIndex
CREATE INDEX "ProcessedResult_sessionId_idx" ON "ProcessedResult"("sessionId");

-- CreateIndex
CREATE INDEX "DuplicateRelationship_primaryResultId_idx" ON "DuplicateRelationship"("primaryResultId");

-- CreateIndex
CREATE INDEX "DuplicateRelationship_duplicateResultId_idx" ON "DuplicateRelationship"("duplicateResultId");

-- CreateIndex
CREATE UNIQUE INDEX "DuplicateRelationship_primaryResultId_duplicateResultId_key" ON "DuplicateRelationship"("primaryResultId", "duplicateResultId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTag_sessionId_name_key" ON "ReviewTag"("sessionId", "name");

-- CreateIndex
CREATE INDEX "ReviewTagAssignment_tagId_idx" ON "ReviewTagAssignment"("tagId");

-- CreateIndex
CREATE INDEX "ReviewTagAssignment_resultId_idx" ON "ReviewTagAssignment"("resultId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTagAssignment_tagId_resultId_key" ON "ReviewTagAssignment"("tagId", "resultId");

-- CreateIndex
CREATE INDEX "Note_resultId_idx" ON "Note"("resultId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SearchSession" ADD CONSTRAINT "SearchSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SearchSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchExecution" ADD CONSTRAINT "SearchExecution_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "SearchQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchExecution" ADD CONSTRAINT "SearchExecution_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SearchSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawSearchResult" ADD CONSTRAINT "RawSearchResult_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "SearchQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedResult" ADD CONSTRAINT "ProcessedResult_rawResultId_fkey" FOREIGN KEY ("rawResultId") REFERENCES "RawSearchResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedResult" ADD CONSTRAINT "ProcessedResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SearchSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateRelationship" ADD CONSTRAINT "DuplicateRelationship_primaryResultId_fkey" FOREIGN KEY ("primaryResultId") REFERENCES "ProcessedResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateRelationship" ADD CONSTRAINT "DuplicateRelationship_duplicateResultId_fkey" FOREIGN KEY ("duplicateResultId") REFERENCES "ProcessedResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTag" ADD CONSTRAINT "ReviewTag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SearchSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTagAssignment" ADD CONSTRAINT "ReviewTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ReviewTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTagAssignment" ADD CONSTRAINT "ReviewTagAssignment_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "ProcessedResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "ProcessedResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

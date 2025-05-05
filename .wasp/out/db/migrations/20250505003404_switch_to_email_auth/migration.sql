/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- First, update email with username for all records where email is NULL
UPDATE "User" SET "email" = "username" || '@example.com' WHERE "email" IS NULL;

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ALTER COLUMN "email" SET NOT NULL;

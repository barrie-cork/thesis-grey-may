/*
  Warnings:

  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable - Make email optional
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable - Add username column temporarily without NOT NULL
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Populate username from email (before the @ symbol, ensuring uniqueness)
UPDATE "User" 
SET "username" = COALESCE(substring("email" from '(.*)@'), 'user_' || id)
WHERE "username" IS NULL;

-- Ensure usernames are unique if collision occured (append random chars if needed)
-- This part might need adjustment based on potential conflicts
WITH duplicates AS (
  SELECT username, COUNT(*) as count
  FROM "User"
  GROUP BY username
  HAVING COUNT(*) > 1
)
UPDATE "User" u
SET username = u.username || '_' || substring(md5(random()::text) from 1 for 4)
FROM duplicates d
WHERE u.username = d.username;

-- AlterTable - Now make username NOT NULL
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex - Add unique constraint
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

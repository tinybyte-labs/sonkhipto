/*
  Warnings:

  - You are about to drop the column `reaction` on the `PostReaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "reaction";

-- DropEnum
DROP TYPE "PostReactionType";

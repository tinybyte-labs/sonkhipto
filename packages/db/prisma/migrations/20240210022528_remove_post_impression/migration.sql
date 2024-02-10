/*
  Warnings:

  - You are about to drop the `PostImpression` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostImpression" DROP CONSTRAINT "PostImpression_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostImpression" DROP CONSTRAINT "PostImpression_userId_fkey";

-- DropTable
DROP TABLE "PostImpression";

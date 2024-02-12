/*
  Warnings:

  - You are about to drop the `PostReaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostReaction" DROP CONSTRAINT "PostReaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostReaction" DROP CONSTRAINT "PostReaction_userId_fkey";

-- DropTable
DROP TABLE "PostReaction";

-- CreateTable
CREATE TABLE "FavoritePost" (
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePost_userId_postId_key" ON "FavoritePost"("userId", "postId");

-- AddForeignKey
ALTER TABLE "FavoritePost" ADD CONSTRAINT "FavoritePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePost" ADD CONSTRAINT "FavoritePost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

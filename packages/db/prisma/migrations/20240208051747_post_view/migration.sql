-- CreateTable
CREATE TABLE "PostView" (
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PostView_userId_postId_key" ON "PostView"("userId", "postId");

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

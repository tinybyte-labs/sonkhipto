-- CreateTable
CREATE TABLE "PostImpression" (
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PostImpression_userId_postId_key" ON "PostImpression"("userId", "postId");

-- AddForeignKey
ALTER TABLE "PostImpression" ADD CONSTRAINT "PostImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImpression" ADD CONSTRAINT "PostImpression_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

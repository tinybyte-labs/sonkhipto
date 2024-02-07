-- CreateTable
CREATE TABLE "CategoryFollow" (
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryFollow_userId_categoryId_key" ON "CategoryFollow"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "CategoryFollow" ADD CONSTRAINT "CategoryFollow_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryFollow" ADD CONSTRAINT "CategoryFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'WRITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('NEWS');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "type" "PostType" NOT NULL DEFAULT 'NEWS';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateEnum
CREATE TYPE "public"."FeedbackRating" AS ENUM ('UP', 'DOWN', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "public"."FeedbackStatus" AS ENUM ('NEW', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "rating" "public"."FeedbackRating" NOT NULL,
    "text" TEXT,
    "status" "public"."FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "tags" TEXT[],
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_userId_quoteId_key" ON "public"."Feedback"("userId", "quoteId");

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

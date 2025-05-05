-- CreateTable
CREATE TABLE "SessionMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionMembership_userId_idx" ON "SessionMembership"("userId");

-- CreateIndex
CREATE INDEX "SessionMembership_sessionId_idx" ON "SessionMembership"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionMembership_userId_sessionId_key" ON "SessionMembership"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "SessionMembership" ADD CONSTRAINT "SessionMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMembership" ADD CONSTRAINT "SessionMembership_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SearchSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

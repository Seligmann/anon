-- CreateTable
CREATE TABLE "command" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "command_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "command_name_key" ON "command"("name");


-- CreateTable
CREATE TABLE "WikiCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WikiTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WikiTerm_category_fkey" FOREIGN KEY ("category") REFERENCES "WikiCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Short" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL DEFAULT '',
    "feature" TEXT NOT NULL DEFAULT '',
    "experience" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "video" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "presentationVideo" TEXT NOT NULL DEFAULT '',
    "performanceVideos" TEXT NOT NULL DEFAULT '[]',
    "techniques" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "WikiTerm_category_idx" ON "WikiTerm"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Short_url_key" ON "Short"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_slug_key" ON "Instructor"("slug");

-- CreateIndex
CREATE INDEX "Instructor_slug_idx" ON "Instructor"("slug");

-- CreateIndex
CREATE INDEX "Instructor_sortOrder_idx" ON "Instructor"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_verificationToken_idx" ON "User"("verificationToken");

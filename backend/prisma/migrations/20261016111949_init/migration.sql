-- CreateTable
CREATE TABLE "Professional" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "professionalId" INTEGER NOT NULL,
    CONSTRAINT "Project_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "professionalId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enquiry_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

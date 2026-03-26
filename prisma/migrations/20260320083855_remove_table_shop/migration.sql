/*
  Warnings:

  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Popup` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Shop_shop_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Shop";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Popup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "btnText" TEXT NOT NULL DEFAULT '',
    "btnLink" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "btnColor" TEXT NOT NULL DEFAULT '#000000',
    "image" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Popup" ("bgColor", "btnColor", "btnLink", "btnText", "description", "id", "image", "shop", "textColor", "title") SELECT "bgColor", "btnColor", "btnLink", "btnText", "description", "id", "image", "shop", "textColor", "title" FROM "Popup";
DROP TABLE "Popup";
ALTER TABLE "new_Popup" RENAME TO "Popup";
CREATE UNIQUE INDEX "Popup_shop_key" ON "Popup"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Popup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Popup',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "delay" INTEGER NOT NULL DEFAULT 3,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "btnText" TEXT NOT NULL DEFAULT '',
    "btnLink" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "btnColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "btnTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "image" TEXT,
    "position" TEXT NOT NULL DEFAULT 'center',
    "animation" TEXT NOT NULL DEFAULT 'fade',
    "showClose" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Popup" ("animation", "bgColor", "btnColor", "btnLink", "btnText", "createdAt", "delay", "description", "id", "image", "isActive", "isPublished", "name", "position", "shop", "showClose", "textColor", "title", "updatedAt") SELECT "animation", "bgColor", "btnColor", "btnLink", "btnText", "createdAt", "delay", "description", "id", "image", "isActive", "isPublished", "name", "position", "shop", "showClose", "textColor", "title", "updatedAt" FROM "Popup";
DROP TABLE "Popup";
ALTER TABLE "new_Popup" RENAME TO "Popup";
CREATE UNIQUE INDEX "Popup_shop_key" ON "Popup"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

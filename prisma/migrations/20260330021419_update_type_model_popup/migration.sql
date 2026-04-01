-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Popup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Popup',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "position" TEXT NOT NULL DEFAULT 'center',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "btnText" TEXT NOT NULL DEFAULT '',
    "btnLink" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "btnColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "image" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'on_load',
    "triggerValue" INTEGER,
    "repeatType" TEXT NOT NULL DEFAULT 'daily',
    "displayScope" TEXT NOT NULL DEFAULT 'all_pages',
    "matchType" TEXT NOT NULL DEFAULT 'all',
    "conditions" JSONB,
    "showClose" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Popup" ("bgColor", "btnColor", "btnLink", "btnText", "conditions", "createdAt", "description", "displayScope", "id", "image", "isActive", "isPublished", "matchType", "name", "position", "repeatType", "shop", "showClose", "textColor", "title", "triggerType", "triggerValue", "updatedAt") SELECT "bgColor", "btnColor", "btnLink", "btnText", "conditions", "createdAt", "description", "displayScope", "id", "image", "isActive", "isPublished", "matchType", "name", "position", "repeatType", "shop", "showClose", "textColor", "title", "triggerType", "triggerValue", "updatedAt" FROM "Popup";
DROP TABLE "Popup";
ALTER TABLE "new_Popup" RENAME TO "Popup";
CREATE UNIQUE INDEX "Popup_shop_key" ON "Popup"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

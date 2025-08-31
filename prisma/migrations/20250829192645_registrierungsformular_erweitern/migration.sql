-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- Migrate existing data: split name into firstName and lastName
UPDATE "public"."User" 
SET 
  "firstName" = CASE 
    WHEN "name" IS NOT NULL AND "name" != '' THEN 
      CASE 
        WHEN POSITION(' ' IN "name") > 0 THEN LEFT("name", POSITION(' ' IN "name") - 1)
        ELSE "name"
      END
    ELSE 'Unbekannt'
  END,
  "lastName" = CASE 
    WHEN "name" IS NOT NULL AND "name" != '' THEN 
      CASE 
        WHEN POSITION(' ' IN "name") > 0 THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
        ELSE ''
      END
    ELSE ''
  END
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Make firstName and lastName required
ALTER TABLE "public"."User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "public"."User" ALTER COLUMN "lastName" SET NOT NULL;

-- Remove the old name column
ALTER TABLE "public"."User" DROP COLUMN "name";

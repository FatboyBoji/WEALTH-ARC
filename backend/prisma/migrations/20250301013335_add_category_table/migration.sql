/*
  Warnings:

  - You are about to drop the column `category` on the `budget_items_wa` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `budget_items_wa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."budget_items_wa" DROP COLUMN "category",
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD COLUMN     "repeat" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."budget_categories_wa" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_wa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."budget_categories_wa" ADD CONSTRAINT "budget_categories_wa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_items_wa" ADD CONSTRAINT "budget_items_wa_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

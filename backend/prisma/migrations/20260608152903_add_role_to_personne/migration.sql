-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('candidat', 'co_candidat', 'garant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Personne" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'candidat';

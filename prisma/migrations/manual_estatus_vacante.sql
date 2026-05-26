-- Migración manual: activa -> estatus (ejecutar antes de db push si la columna activa aún existe)

DO $$ BEGIN
  CREATE TYPE "EstatusVacante" AS ENUM ('ABIERTA', 'PAUSADA', 'VENCIDA', 'CERRADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Vacante" ADD COLUMN IF NOT EXISTS "estatus" "EstatusVacante";
ALTER TABLE "Vacante" ADD COLUMN IF NOT EXISTS "cerrada_en" TIMESTAMP(3);

-- Solo migrar si existe la columna legacy activa
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Vacante' AND column_name = 'activa'
  ) THEN
    UPDATE "Vacante" SET "estatus" = 'VENCIDA'
    WHERE "activa" = true
      AND "fecha_limite" IS NOT NULL
      AND "fecha_limite" < date_trunc('day', NOW());

    UPDATE "Vacante" SET "estatus" = 'ABIERTA'
    WHERE "activa" = true
      AND ("fecha_limite" IS NULL OR "fecha_limite" >= date_trunc('day', NOW()));

    UPDATE "Vacante" SET "estatus" = 'VENCIDA'
    WHERE "activa" = false
      AND "fecha_limite" IS NOT NULL
      AND "fecha_limite" < date_trunc('day', NOW());

    UPDATE "Vacante" SET "estatus" = 'PAUSADA'
    WHERE "activa" = false
      AND ("estatus" IS NULL OR "estatus" = 'ABIERTA');

    UPDATE "Vacante" SET "estatus" = 'ABIERTA' WHERE "estatus" IS NULL;

    ALTER TABLE "Vacante" DROP COLUMN "activa";
  END IF;
END $$;

ALTER TABLE "Vacante" ALTER COLUMN "estatus" SET DEFAULT 'ABIERTA';
ALTER TABLE "Vacante" ALTER COLUMN "estatus" SET NOT NULL;

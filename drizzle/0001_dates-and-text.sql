ALTER TABLE "fuentes" ALTER COLUMN "snapshot_date" SET DATA TYPE date USING "snapshot_date"::date;--> statement-breakpoint
ALTER TABLE "mandatos" ALTER COLUMN "inicio" SET DATA TYPE date USING "inicio"::date;--> statement-breakpoint
ALTER TABLE "mandatos" ALTER COLUMN "fin" SET DATA TYPE date USING "fin"::date;--> statement-breakpoint
ALTER TABLE "personas" ALTER COLUMN "fecha_nacimiento" SET DATA TYPE date USING "fecha_nacimiento"::date;

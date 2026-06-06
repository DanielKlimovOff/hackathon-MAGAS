CREATE TABLE IF NOT EXISTS "uks" (
	"id" UUID NOT NULL,
	"email" TEXT NOT NULL UNIQUE,
	"password_hash" TEXT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "screens" (
	"id" UUID NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"uk_id" UUID NOT NULL,
	"building_id" INTEGER NOT NULL,
	"status" TEXT NOT NULL,
	"template_id" UUID,
	"alert" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "groups" (
	"id" UUID NOT NULL,
	"name" TEXT NOT NULL,
	"uk_id" UUID NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "screens_groups" (
	"id" UUID NOT NULL,
	"group_id" UUID NOT NULL,
	"screen_id" UUID NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "templates" (
	"id" UUID NOT NULL,
	"uk_id" UUID NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "vigets" (
	"id" UUID NOT NULL,
	"name" TEXT NOT NULL,
	"url" TEXT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "templates_vigets" (
	"id" UUID NOT NULL,
	"template_id" UUID NOT NULL,
	"viget_id" UUID NOT NULL,
	PRIMARY KEY("id")
);



ALTER TABLE "groups"
ADD FOREIGN KEY("uk_id") REFERENCES "uks"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "screens_groups"
ADD FOREIGN KEY("group_id") REFERENCES "groups"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "screens_groups"
ADD FOREIGN KEY("screen_id") REFERENCES "screens"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "templates"
ADD FOREIGN KEY("uk_id") REFERENCES "uks"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "screens"
ADD FOREIGN KEY("template_id") REFERENCES "templates"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "templates_vigets"
ADD FOREIGN KEY("template_id") REFERENCES "templates"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "templates_vigets"
ADD FOREIGN KEY("viget_id") REFERENCES "vigets"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
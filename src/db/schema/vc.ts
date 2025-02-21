import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const vcTable = sqliteTable("vc", {
    id: int().primaryKey({autoIncrement: true}),
    channelId: text().notNull(),
    ownerId: text().notNull(),
});

export const vcGeneratorTable = sqliteTable("vc_generators", {
    id: int().primaryKey({autoIncrement: true}),
    channelId: text().notNull(),
    parentId: text().notNull(),
});
import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const costsTable = sqliteTable("costs", {
    id: int().primaryKey({autoIncrement: true}),
    title: text().notNull(),
    amount: int().notNull(),
});

export const costOverviewTable = sqliteTable("cost_overviews", {
    id: int().primaryKey({autoIncrement: true}),
    guildId: text().notNull(),
    channelId: text().notNull(),
    messageId: text().notNull(),
});
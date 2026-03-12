import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const todoLists = pgTable("todo_lists", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	created_at: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const todos = pgTable("todos", {
	id: uuid("id").primaryKey().defaultRandom(),
	list_id: uuid("list_id")
		.notNull()
		.references(() => todoLists.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	completed: boolean("completed").notNull().default(false),
	created_at: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

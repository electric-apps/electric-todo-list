import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { z } from "zod/v4"
import { todoLists, todos } from "./schema"

// Override for timestamp columns — union ensures TInput is a superset of TOutput
// so that collection.update() draft proxy works correctly
const timestampOverride = z
	.union([z.string(), z.date()])
	.transform((val) => (typeof val === "string" ? new Date(val) : val))

export const todoListSelectSchema = createSelectSchema(todoLists, {
	created_at: timestampOverride,
	updated_at: timestampOverride,
})

export const todoListInsertSchema = createInsertSchema(todoLists, {
	created_at: timestampOverride,
	updated_at: timestampOverride,
})

export const todoSelectSchema = createSelectSchema(todos, {
	created_at: timestampOverride,
	updated_at: timestampOverride,
})

export const todoInsertSchema = createInsertSchema(todos, {
	created_at: timestampOverride,
	updated_at: timestampOverride,
})

export type TodoList = z.infer<typeof todoListSelectSchema>
export type NewTodoList = z.infer<typeof todoListInsertSchema>
export type Todo = z.infer<typeof todoSelectSchema>
export type NewTodo = z.infer<typeof todoInsertSchema>

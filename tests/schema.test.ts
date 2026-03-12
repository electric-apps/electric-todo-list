import { describe, it, expect } from "vitest"
import {
	todoListSelectSchema,
	todoListInsertSchema,
	todoSelectSchema,
	todoInsertSchema,
} from "@/db/zod-schemas"
import { todoLists, todos } from "@/db/schema"
import {
	generateValidRow,
	generateRowWithout,
} from "./helpers/schema-test-utils"

describe("todoListSelectSchema", () => {
	it("validates a valid todo list row", () => {
		const row = generateValidRow(todoListSelectSchema)
		const result = todoListSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing name", () => {
		const row = generateRowWithout(todoListSelectSchema, "name")
		const result = todoListSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing id", () => {
		const row = generateRowWithout(todoListSelectSchema, "id")
		const result = todoListSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})

describe("todoListInsertSchema", () => {
	it("validates a valid todo list insert row", () => {
		const row = generateValidRow(todoListInsertSchema)
		const result = todoListInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing name", () => {
		const row = generateRowWithout(todoListInsertSchema, "name")
		const result = todoListInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})

describe("todoSelectSchema", () => {
	it("validates a valid todo row", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing title", () => {
		const row = generateRowWithout(todoSelectSchema, "title")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing list_id", () => {
		const row = generateRowWithout(todoSelectSchema, "list_id")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing completed", () => {
		const row = generateRowWithout(todoSelectSchema, "completed")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("coerces ISO date strings for created_at", () => {
		const row = generateValidRow(todoSelectSchema)
		const rowWithString = { ...row, created_at: new Date().toISOString() }
		const result = todoSelectSchema.safeParse(rowWithString)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
		}
	})
})

describe("todoInsertSchema", () => {
	it("validates a valid todo insert row", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing title", () => {
		const row = generateRowWithout(todoInsertSchema, "title")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing list_id", () => {
		const row = generateRowWithout(todoInsertSchema, "list_id")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})

describe("JSON round-trip for dates", () => {
	it("parseDates converts ISO strings back to Date objects", async () => {
		const { parseDates } = await import("./helpers/schema-test-utils")
		const row = generateValidRow(todoSelectSchema)
		const roundTripped = parseDates(JSON.parse(JSON.stringify(row)))
		const result = todoSelectSchema.safeParse(roundTripped)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
		}
	})
})

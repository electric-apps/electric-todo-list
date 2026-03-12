import { describe, it, expect } from "vitest";
import {
	todoListInsertSchema,
	todoSelectSchema,
	todoInsertSchema,
} from "@/db/zod-schemas";
import { generateValidRow, parseDates } from "./helpers/schema-test-utils";

describe("todoListInsertSchema — collection insert validation", () => {
	it("validates a complete insert row", () => {
		const row = generateValidRow(todoListInsertSchema);
		const result = todoListInsertSchema.safeParse(row);
		expect(result.success).toBe(true);
	});

	it("validates after JSON round-trip", () => {
		const row = generateValidRow(todoListInsertSchema);
		const roundTripped = parseDates(JSON.parse(JSON.stringify(row)));
		const result = todoListInsertSchema.safeParse(roundTripped);
		expect(result.success).toBe(true);
	});
});

describe("todoInsertSchema — collection insert validation", () => {
	it("validates a complete insert row", () => {
		const row = generateValidRow(todoInsertSchema);
		const result = todoInsertSchema.safeParse(row);
		expect(result.success).toBe(true);
	});

	it("validates after JSON round-trip", () => {
		const row = generateValidRow(todoInsertSchema);
		const roundTripped = parseDates(JSON.parse(JSON.stringify(row)));
		const result = todoInsertSchema.safeParse(roundTripped);
		expect(result.success).toBe(true);
	});

	it("rejects a row with missing list_id after round-trip", () => {
		const row = generateValidRow(todoInsertSchema);
		// biome-ignore lint/performance/noDelete: intentionally testing missing field
		delete (row as Record<string, unknown>).list_id;
		const result = todoInsertSchema.safeParse(row);
		expect(result.success).toBe(false);
	});
});

describe("todoSelectSchema — update draft validation", () => {
	it("accepts Date objects in timestamp fields", () => {
		const row = generateValidRow(todoSelectSchema);
		const result = todoSelectSchema.safeParse(row);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date);
		}
	});

	it("accepts ISO string timestamps (from sync path)", () => {
		const row = generateValidRow(todoSelectSchema);
		const withStrings = {
			...row,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		const result = todoSelectSchema.safeParse(withStrings);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date);
		}
	});
});

import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { todoListSelectSchema } from "@/db/zod-schemas";

const shapeUrl =
	typeof window !== "undefined"
		? new URL("/api/todo-lists", window.location.origin).toString()
		: "http://localhost:5173/api/todo-lists";

export const todoListsCollection = createCollection(
	electricCollectionOptions({
		id: "todo-lists",
		schema: todoListSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: shapeUrl,
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todo-lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "insert", data: modified }),
			});
			if (!res.ok) throw new Error("Failed to insert todo list");
			const result = await res.json();
			return { txid: result.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todo-lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "update", data: modified }),
			});
			if (!res.ok) throw new Error("Failed to update todo list");
			const result = await res.json();
			return { txid: result.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todo-lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "delete", id: original.id }),
			});
			if (!res.ok) throw new Error("Failed to delete todo list");
			const result = await res.json();
			return { txid: result.txid };
		},
	}),
);

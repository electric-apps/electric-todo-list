import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { todoSelectSchema } from "@/db/zod-schemas";

const shapeUrl =
	typeof window !== "undefined"
		? new URL("/api/todos", window.location.origin).toString()
		: "http://localhost:5173/api/todos";

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: shapeUrl,
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "insert", data: modified }),
			});
			if (!res.ok) throw new Error("Failed to insert todo");
			const result = await res.json();
			return { txid: result.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "update", data: modified }),
			});
			if (!res.ok) throw new Error("Failed to update todo");
			const result = await res.json();
			return { txid: result.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "delete", id: original.id }),
			});
			if (!res.ok) throw new Error("Failed to delete todo");
			const result = await res.json();
			return { txid: result.txid };
		},
	}),
);

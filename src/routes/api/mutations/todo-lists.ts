import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todoLists } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";

export const Route = createFileRoute("/api/mutations/todo-lists")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = parseDates(await request.json());
				const { action, data, id } = body as {
					action: string;
					data?: Record<string, unknown>;
					id?: string;
				};

				let txid: number;

				if (action === "insert" && data) {
					await db.transaction(async (tx) => {
						await tx.insert(todoLists).values({
							id: data.id as string,
							name: data.name as string,
							created_at: data.created_at as Date,
							updated_at: data.updated_at as Date,
						});
						txid = await generateTxId(tx);
					});
				} else if (action === "update" && data) {
					await db.transaction(async (tx) => {
						await tx
							.update(todoLists)
							.set({
								name: data.name as string,
								updated_at: new Date(),
							})
							.where(eq(todoLists.id, data.id as string));
						txid = await generateTxId(tx);
					});
				} else if (action === "delete" && id) {
					await db.transaction(async (tx) => {
						await tx.delete(todoLists).where(eq(todoLists.id, id));
						txid = await generateTxId(tx);
					});
				} else {
					return new Response(JSON.stringify({ error: "Invalid action" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
				}

				return new Response(JSON.stringify({ txid: txid! }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

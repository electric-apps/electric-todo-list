import {
	AlertDialog,
	Badge,
	Button,
	Card,
	Checkbox,
	Container,
	Dialog,
	Flex,
	Heading,
	IconButton,
	Spinner,
	Text,
	TextField,
} from "@radix-ui/themes";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox, ListTodo, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todoListsCollection } from "@/db/collections/todo-lists";
import { todosCollection } from "@/db/collections/todos";

export const Route = createFileRoute("/")({
	ssr: false,
	loader: async () => {
		await Promise.all([
			todoListsCollection.preload(),
			todosCollection.preload(),
		]);
		return null;
	},
	component: TodoApp,
});

function TodoApp() {
	const [selectedListId, setSelectedListId] = useState<string | null>(null);
	const [newListName, setNewListName] = useState("");
	const [newTodoTitle, setNewTodoTitle] = useState("");
	const [createListOpen, setCreateListOpen] = useState(false);
	const [deleteListTarget, setDeleteListTarget] = useState<string | null>(null);
	const [deleteTodoTarget, setDeleteTodoTarget] = useState<string | null>(null);

	const { data: lists, isLoading: listsLoading } = useLiveQuery(
		(q) =>
			q
				.from({ list: todoListsCollection })
				.orderBy(({ list }) => list.created_at, "asc"),
		[],
	);

	const { data: todos, isLoading: todosLoading } = useLiveQuery(
		(q) => {
			if (!selectedListId) return undefined;
			return q
				.from({ todo: todosCollection })
				.where(({ todo }) => eq(todo.list_id, selectedListId))
				.orderBy(({ todo }) => todo.created_at, "asc");
		},
		[selectedListId],
	);

	const selectedList = lists.find((l) => l.id === selectedListId);

	const handleCreateList = () => {
		if (!newListName.trim()) return;
		const now = new Date();
		todoListsCollection.insert({
			id: crypto.randomUUID(),
			name: newListName.trim(),
			created_at: now,
			updated_at: now,
		});
		setNewListName("");
		setCreateListOpen(false);
	};

	const handleDeleteList = (id: string) => {
		todoListsCollection.delete(id);
		if (selectedListId === id) setSelectedListId(null);
		setDeleteListTarget(null);
	};

	const handleAddTodo = () => {
		if (!newTodoTitle.trim() || !selectedListId) return;
		const now = new Date();
		todosCollection.insert({
			id: crypto.randomUUID(),
			list_id: selectedListId,
			title: newTodoTitle.trim(),
			completed: false,
			created_at: now,
			updated_at: now,
		});
		setNewTodoTitle("");
	};

	const handleToggleTodo = (id: string, completed: boolean) => {
		todosCollection.update(id, (draft) => {
			draft.completed = !completed;
			draft.updated_at = new Date();
		});
	};

	const handleDeleteTodo = (id: string) => {
		todosCollection.delete(id);
		setDeleteTodoTarget(null);
	};

	const completedCount = todos?.filter((t) => t.completed).length ?? 0;
	const totalCount = todos?.length ?? 0;

	return (
		<Container size="4" py="6">
			<Flex gap="6" style={{ minHeight: "calc(100vh - 120px)" }}>
				{/* Sidebar — Lists */}
				<Flex direction="column" gap="3" style={{ width: 260, flexShrink: 0 }}>
					<Flex justify="between" align="center">
						<Heading size="5">Lists</Heading>
						<Dialog.Root open={createListOpen} onOpenChange={setCreateListOpen}>
							<Dialog.Trigger>
								<IconButton size="2" variant="soft">
									<Plus size={16} />
								</IconButton>
							</Dialog.Trigger>
							<Dialog.Content maxWidth="400px">
								<Dialog.Title>New List</Dialog.Title>
								<Flex direction="column" gap="4" mt="4">
									<Flex direction="column" gap="1">
										<Text size="2" weight="medium">
											List name
										</Text>
										<TextField.Root
											placeholder="e.g. Work, Shopping..."
											value={newListName}
											onChange={(e) => setNewListName(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
											autoFocus
										/>
									</Flex>
									<Flex gap="3" justify="end" mt="2">
										<Dialog.Close>
											<Button variant="soft" color="gray">
												Cancel
											</Button>
										</Dialog.Close>
										<Button
											onClick={handleCreateList}
											disabled={!newListName.trim()}
										>
											Create
										</Button>
									</Flex>
								</Flex>
							</Dialog.Content>
						</Dialog.Root>
					</Flex>

					{listsLoading ? (
						<Flex justify="center" py="6">
							<Spinner size="2" />
						</Flex>
					) : lists.length === 0 ? (
						<Flex direction="column" align="center" gap="2" py="6">
							<ListTodo size={32} strokeWidth={1} color="var(--gray-8)" />
							<Text size="2" color="gray">
								No lists yet
							</Text>
						</Flex>
					) : (
						<Flex direction="column" gap="1">
							{lists.map((list) => (
								<Card
									key={list.id}
									variant={selectedListId === list.id ? "classic" : "surface"}
									style={{ cursor: "pointer" }}
									onClick={() => setSelectedListId(list.id)}
								>
									<Flex justify="between" align="center">
										<Text
											size="2"
											weight={selectedListId === list.id ? "medium" : "regular"}
										>
											{list.name}
										</Text>
										<IconButton
											size="1"
											variant="ghost"
											color="red"
											onClick={(e) => {
												e.stopPropagation();
												setDeleteListTarget(list.id);
											}}
										>
											<Trash2 size={12} />
										</IconButton>
									</Flex>
								</Card>
							))}
						</Flex>
					)}
				</Flex>

				{/* Main content — Todos */}
				<Flex direction="column" gap="4" style={{ flex: 1 }}>
					{!selectedListId ? (
						<Flex
							direction="column"
							align="center"
							justify="center"
							gap="3"
							style={{ flex: 1 }}
						>
							<Inbox size={48} strokeWidth={1} color="var(--gray-8)" />
							<Text size="4" color="gray">
								Select a list to see your todos
							</Text>
							<Button variant="soft" onClick={() => setCreateListOpen(true)}>
								<Plus size={16} /> Create your first list
							</Button>
						</Flex>
					) : (
						<>
							<Flex justify="between" align="center">
								<Flex direction="column" gap="1">
									<Heading size="6">{selectedList?.name}</Heading>
									{totalCount > 0 && (
										<Text size="2" color="gray">
											{completedCount} of {totalCount} completed
										</Text>
									)}
								</Flex>
								{completedCount > 0 && (
									<Badge variant="soft" color="green">
										{completedCount} done
									</Badge>
								)}
							</Flex>

							{/* Add todo input */}
							<Flex gap="2">
								<TextField.Root
									placeholder="Add a new todo..."
									value={newTodoTitle}
									onChange={(e) => setNewTodoTitle(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
									style={{ flex: 1 }}
								/>
								<Button onClick={handleAddTodo} disabled={!newTodoTitle.trim()}>
									<Plus size={16} />
									Add
								</Button>
							</Flex>

							{/* Todo list */}
							{todosLoading ? (
								<Flex justify="center" py="6">
									<Spinner size="3" />
								</Flex>
							) : todos && todos.length === 0 ? (
								<Flex direction="column" align="center" gap="3" py="9">
									<Inbox size={48} strokeWidth={1} color="var(--gray-8)" />
									<Text size="4" color="gray">
										No todos yet
									</Text>
									<Text size="2" color="gray">
										Add your first todo above
									</Text>
								</Flex>
							) : (
								<Flex direction="column" gap="2">
									{todos?.map((todo) => (
										<Card key={todo.id} variant="surface">
											<Flex align="center" gap="3">
												<Checkbox
													checked={todo.completed}
													onCheckedChange={() =>
														handleToggleTodo(todo.id, todo.completed)
													}
												/>
												<Text
													size="2"
													style={{
														flex: 1,
														textDecoration: todo.completed
															? "line-through"
															: "none",
														color: todo.completed ? "var(--gray-9)" : undefined,
													}}
												>
													{todo.title}
												</Text>
												<IconButton
													size="1"
													variant="ghost"
													color="red"
													onClick={() => setDeleteTodoTarget(todo.id)}
												>
													<Trash2 size={12} />
												</IconButton>
											</Flex>
										</Card>
									))}
								</Flex>
							)}
						</>
					)}
				</Flex>
			</Flex>

			{/* Delete list confirmation */}
			<AlertDialog.Root
				open={!!deleteListTarget}
				onOpenChange={(open) => !open && setDeleteListTarget(null)}
			>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Delete List</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This will permanently delete this list and all its todos. This
						action cannot be undone.
					</AlertDialog.Description>
					<Flex gap="3" justify="end" mt="4">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button
								color="red"
								onClick={() =>
									deleteListTarget && handleDeleteList(deleteListTarget)
								}
							>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>

			{/* Delete todo confirmation */}
			<AlertDialog.Root
				open={!!deleteTodoTarget}
				onOpenChange={(open) => !open && setDeleteTodoTarget(null)}
			>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Delete Todo</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This action cannot be undone.
					</AlertDialog.Description>
					<Flex gap="3" justify="end" mt="4">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button
								color="red"
								onClick={() =>
									deleteTodoTarget && handleDeleteTodo(deleteTodoTarget)
								}
							>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Container>
	);
}

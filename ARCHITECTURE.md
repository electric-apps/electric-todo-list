# Todo App — Architecture

## Entities

### todo_lists
- id (UUID, PK)
- name (text)
- created_at, updated_at (timestamptz)

### todos
- id (UUID, PK)
- list_id (UUID, FK → todo_lists, cascade)
- title (text)
- completed (boolean)
- created_at, updated_at (timestamptz)

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Main todo app page (ssr: false) |
| `/api/todo-lists` | Electric shape proxy for todo_lists |
| `/api/todos` | Electric shape proxy for todos |
| `/api/mutations/todo-lists` | CRUD mutations for todo lists |
| `/api/mutations/todos` | CRUD mutations for todos |

## Collections

- `src/db/collections/todo-lists.ts` — todoListsCollection (Electric sync)
- `src/db/collections/todos.ts` — todosCollection (Electric sync)

## Key Components

- `src/routes/index.tsx` — full todo app UI with list sidebar + todo panel
  - useLiveQuery for reactive data
  - Optimistic insert/update/delete
  - Create list dialog, add todo input, checkbox toggle, delete confirmations

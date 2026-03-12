# Todo App — Implementation Plan

## App Description
A local-first, real-time todo application built with Electric SQL + TanStack DB. Users can create, complete, and delete todos, organized into lists, with changes syncing instantly across clients via Postgres and Electric.

## Data Model

### todo_lists
- id: UUID, primary key, defaultRandom()
- name: text, notNull
- created_at: timestamptz, notNull, defaultNow()
- updated_at: timestamptz, notNull, defaultNow()

### todos
- id: UUID, primary key, defaultRandom()
- list_id: UUID, notNull, FK → todo_lists.id, onDelete: cascade
- title: text, notNull
- completed: boolean, notNull, default false
- created_at: timestamptz, notNull, defaultNow()
- updated_at: timestamptz, notNull, defaultNow()

## Implementation Tasks
- [ ] Phase 2: Discover playbook skills and read relevant ones
- [ ] Phase 3: Data model — schema, zod-schemas, migrations, tests
- [ ] Phase 4: Collections & API routes
- [ ] Phase 5: UI components
- [ ] Phase 6: Build, lint & test
- [ ] Phase 7: Deploy & preview

## Design Conventions
- UUID primary keys with defaultRandom()
- timestamp({ withTimezone: true }) for all dates
- snake_case for SQL table/column names
- Foreign keys with onDelete: "cascade" where appropriate

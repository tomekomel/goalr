# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Type-check (vue-tsc) + production build
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

Goalr is a goal management app built with Vue 3 + TypeScript + Vite, using Supabase for backend/auth.

### Data Model

Goals have:
- `period`: 'weekly' | 'monthly' | 'yearly'
- `status`: 'planned' | 'to-do' | 'in-progress' | 'done' | 'archived'
- `progress`: 0-100 (for in-progress goals)
- `targetDate`: YYYY-MM-DD (determines which month/year the goal belongs to)
- `weekNumber`: 1-4 (for weekly goals only)

### Views

1. **Dashboard** (`App.vue` with `currentView === 'dashboard'`)
   - Monthly Focus section (highlighted goals)
   - 4 Weekly sections (weeks 1-4)
   - Yearly Goals sidebar
   - Month/year navigation

2. **Backlog** (`currentView === 'backlog'`)
   - Flat grid of all 'planned' goals
   - "Start" action moves goal from planned → to-do

### Key Components

- `App.vue` - Main app, routing between views, Supabase session/data management
- `GoalCard.vue` - Display-only goal card
- `GoalColumn.vue` - Container with vuedraggable for drag-and-drop between columns
- `GoalModal.vue` - Create/edit goal form
- `AuthScreen.vue` - OAuth login (Google, Facebook, Twitter via Supabase)

### Patterns

- Vue 3 Composition API with `<script setup>` syntax
- Drag-and-drop uses local copy (`localGoals` ref) that syncs to parent via `update:goals` emit
- Optimistic UI updates with rollback on Supabase errors
- Toast notifications for errors (5s auto-dismiss)

## Database

Supabase PostgreSQL with Row Level Security (RLS). Users can only access their own goals.

Required environment variables (see `.env.example`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Styling

Tailwind CSS v4 with emerald/green primary color scheme. Custom fonts: "Plus Jakarta Sans" (headings), "Inter" (body).

# Lumora — Agent Guide

## Project Structure

```
recallai/
├── apps/
│   ├── web/          Next.js 14 App Router + Design System + Desktop features
│   ├── api/          NestJS backend (Prisma + PostgreSQL)
│   ├── desktop/      Tauri v2 shell (Rust + web frontend)
│   └── shared/       Shared types and utilities
├── packages/
│   └── tsconfig/     Shared TypeScript configs
```

## Architecture

### Navigation (Milestone 4.2)
- **ActivityBar**: ~48px left strip with workspace icons. Always visible.
- **SidebarPanel**: Slides open when an activity icon is clicked (VS Code-style).
- **CommandPalette**: Ctrl+K, cmdk-based, Raycast-inspired universal search.
- **ContextPanel**: Right-side panel for properties, AI assistant, metadata.
- **WorkspaceShell**: Combines all navigation components in `(app)/layout.tsx`.
- **Workspaces**: home, collections, knowledge, review, insights, settings.
- **Shortcuts**: Cmd+1–6 for workspace switching, Cmd+K for palette, Cmd+Shift+I for context panel.
- **Store**: `ui-store.ts` (zustand) — sidebar state, context panel, command palette.

### Design System (Milestone 4.1)
Location: `apps/web/src/design-system/`

Tokens: colors, typography (13 variants), motion, elevation (5 levels), spacing, breakpoints.
Primitives: Button, Input, Textarea, Search, Select, Checkbox, Switch, Tabs, Accordion, Card, Badge, Dialog, Tooltip, Toast, Progress, Skeleton, Divider, ScrollArea, DropdownMenu, Breadcrumbs, Avatar (22 total).
Composables: EmptyState, PageHeader, Toolbar.
Motion: FadeIn, SlideIn, ScaleIn, PageTransition (Framer Motion).
Theme: `ThemeProvider` + `useTheme`, dark/light with localStorage persistence.
Styling: CVA for variants, `cn()` (clsx + tailwind-merge) for class merging, OKLCH color tokens.

### Desktop (Milestone 4.0)
- Tauri v2 with custom title bar (`decorations: false`).
- `useDesktop()` hook detects Tauri runtime; all features gracefully fall back in browser.
- Desktop API bridge at `features/desktop/services/desktop-api.ts`.
- 10 Rust IPC commands: file dialog, filesystem, clipboard, notifications, opener.

### Knowledge Workspace (Milestone 4.3)
Location: `apps/web/src/features/knowledge-workspace/`

- **Knowledge Objects**: Unified type system (`KnowledgeObject`) — documents, notes, conversations, transcripts, bookmarks, tasks, flashcards, summaries, collections.
- **Workspace Layout**: Full-height workspace with header, document tabs, reader, and collapsible right panel (AI / Notes / Related).
- **DocumentTabs**: Tabbed document navigation — open multiple documents, close with X button, colored type indicators.
- **DocumentReader**: Premium reading experience with zoom controls (50–200%), table of contents sidebar, annotate/compare actions, responsive width.
- **AIPanel**: Embedded AI assistant with quick actions (Summarize, Explain, Generate Questions, Create Flashcards, Compare, Translate) and chat input.
- **NotesSection**: Contextual notes attached to knowledge objects. Inline add, pin support, timestamp display.
- **RelatedKnowledge**: Connection discovery panel showing related documents, notes, conversations, and flashcards with relevance scores.
- **Store**: `knowledge-workspace-store.ts` (zustand) — tabs, right panel state, zoom, TOC, collection filter, search query.
- **Routes**: `/knowledge` (workspace home), `/knowledge/[id]` (specific document with auto-tab).
- **Integration**: Document detail pages can link into the knowledge workspace; existing document management routes (`/documents`, `/documents/[id]`) remain intact.

## Conventions

- **Imports**: `@/` maps to `apps/web/src/`. Always use `@/` for local imports.
- **Client components**: Add `'use client'` when using hooks, state, or browser APIs.
- **Styling**: Never hardcode colors. Use Tailwind semantic classes (`bg-background`, `text-foreground`, `border-border`).
- **Components**: Use CVA for variant props. Use `cn()` for class merging. Every component gets `className` prop.
- **Stores**: Zustand only. One store per domain (`ui-store.ts`, `auth-store.ts`).
- **Icons**: lucide-react for all icons. Import the component, not a string name.
- **Radix**: Use for Dialog, DropdownMenu, Tooltip, Switch, Progress. Import from `@radix-ui/*`.
- **Routing**: Workspace pages under `app/(app)/`. Auth pages under `app/(auth)/`. Each workspace maps to a route segment.

## Verification

```bash
pnpm --filter web typecheck   # TypeScript check
pnpm --filter web build        # Production build
pnpm --filter api typecheck    # Backend check
pnpm --filter api build        # Backend build
```

## Remaining Work

1. Install Visual Studio Build Tools (Desktop development with C++) and launch `cargo tauri dev`.
2. Start Docker Compose + `pnpm db:migrate` for full backend.
3. Test Knowledge Workspace rendering in dark/light mode across desktop and browser.
4. Milestone 4.4 — feature work using the Knowledge Workspace infrastructure.

# NoteDraftForge

**An offline-first, spec-driven editor for poems and songs — built with Hexagonal Architecture and DDD, where every line of code is preceded by a written specification.**

NoteDraftForge is a private-first structured editor for writing and *interpreting* creative text: poems, song lyrics, spoken-word pieces. Unlike a plain text editor, it separates the content itself from its interpretation layers — structured annotations (`breath`, `intention`, `comment`) attached to precise locations in the text — so a writer can mark how a piece should be performed without polluting what it says.

## Project Status

🚧 **In active development — MVP in progress (specification-first phase).**

The full MVP is specified in `openspec/` (domain model, feature specs, Gherkin flows, decision log), and the React project foundation is bootstrapped and building. The domain, application, and persistence layers are the next implementation milestones — see [Current State & Roadmap](#current-state--roadmap) for an honest breakdown.

**Language / stack:** TypeScript · React · Tiptap · Vite (full list [below](#tech-stack)).

## Motivation

Songwriters and stage poets work with two intertwined artifacts: the text, and how it is meant to be delivered — where to breathe, what a verse intends, what to remember on stage. Existing tools force a choice: plain text loses the interpretation, and annotating inline corrupts the text. NoteDraftForge keeps both, cleanly separated, in a tool that works offline and keeps all data local to the writer's device.

Technically, the project is deliberately built as a showcase of disciplined engineering on a small codebase: a rigorously specified domain, an architecture where the core is framework-free, and a development process where AI agents implement against human-authored specs under explicit guardrails. It exists as much to solve a real creative-writing problem as to demonstrate a way of working.

## Architecture & Design Decisions

### Hexagonal Architecture (Ports & Adapters)

The codebase is organized so that the domain core is completely isolated from frameworks and I/O:

```
UI (React) ──▶ Application (use cases) ──▶ Domain (entities, invariants)
                        │
                     Ports (interfaces: PieceRepository, AnnotationRepository, SnapshotRepository)
                        ▲
              Infrastructure adapters (IndexedDB/Dexie, Tiptap mapping, Zod validation)
```

`src/core/domain/` has a **zero-dependency rule**: no React, no Tiptap, no Dexie, no Zod, no IndexedDB — pure TypeScript, unit-testable in isolation. Use cases in `src/core/application/` depend only on domain types and port interfaces; concrete adapters (persistence, editor integration, schema validation) live in `src/core/infrastructure/` and are swappable. This boundary will be enforced mechanically with ESLint import rules, not just by convention.

Why: in an editor, the riskiest dependencies are the editor framework and the storage engine. Ports and adapters make Tiptap and IndexedDB implementation details that can evolve — or be replaced — without touching the rules of the domain.

### Domain-Driven Design

The domain is defined before the code, in `openspec/domain-model.md`, with canonical terminology (`openspec/terminology.md`) used consistently across specs, code, and UI:

- **Piece** — the atomic creative unit (poem, song, text). Surfaced in the UI as a "Work".
- **Annotation** — typed content (`breath`, `intention`, `comment`) attached to a structured `AnnotationTarget`, never to raw character offsets in Markdown.
- **Layer** — a visual channel that groups annotations; visualization uses pre-rendered snapshots with CSS-toggled layers for performance.

Entities carry explicit invariants (revision increments, kind-to-layer assignment rules, tag/type constraints) that are specified in the domain model and will be enforced — and unit-tested — inside the domain layer. Markdown is treated strictly as an import/export format, never as the internal source of truth.

### Spec-Driven Development (SDD)

**No code without a spec.** The `openspec/` directory is the source of truth for the entire project:

- Feature specs (`openspec/specs/<feature>/spec.md`) with requirement IDs, plus MVP behavior expressed as **Gherkin/BDD scenarios** (`openspec/flows/*.feature`).
- Every implementation task starts as a GitHub issue with goal, scope, constraints, **acceptance criteria**, and non-goals, referencing its spec (`openspec/workflow/workflow-rules.md`, `openspec/templates/`).
- Cross-cutting decisions are recorded in a decision log (`openspec/decisions/decisions.md`), and implementation order lives in an epic/issue backlog (`openspec/backlog.md`).

### AI-Assisted Workflow with a Generator–Validator Pattern

The project is designed to be implemented largely by AI coding agents — under explicit, versioned constraints:

- `AGENTS.md` is the generic agent contract; `CLAUDE.md` adds Claude Code–specific behavior on top. `docs/ai/` defines a mandatory phase sequence: `PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO`.
- The agent acts as **generator**; independent guardrails act as **validators**: shell gates in `scripts/ai/` block edits in the wrong phase, run lint and tests, and gate task closure, while human review validates the result against the spec's acceptance criteria.
- Each task leaves a versioned execution record under `openspec/changes/<change>/`, so agent work is auditable after the fact.

The premise: AI agents are highly productive when the spec, the terminology, and the boundaries are precise — so the human effort goes into specifications and validation rather than line-by-line implementation.

### Offline-First as a Design Decision

There is deliberately **no backend, no sync, and no account system** in the MVP. All data lives in the browser's IndexedDB, and the app ships as a static site on GitHub Pages. Creative drafts are private by default; the writer owns the data (JSON backup export/restore is a specified MVP feature). This constraint also keeps the architecture honest: persistence is just another port, so a future sync backend is an additive adapter, not a rewrite.

## Tech Stack

- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS, shadcn/ui, React Router
- **Editor:** Tiptap (ProseMirror-based)
- **Persistence (planned for MVP):** Dexie over IndexedDB, with Zod for schema validation at the boundaries
- **Tooling:** Vite, ESLint, Prettier
- **Deployment target:** GitHub Pages (static, no server)

## Project Structure

```
├── openspec/              # Source of truth: specs, domain model, decisions
│   ├── domain-model.md    #   Canonical entities and invariants
│   ├── architecture.md    #   DDD + hexagonal rules and folder layout
│   ├── specs/<feature>/   #   One spec per MVP feature (6 features)
│   ├── flows/             #   Gherkin/BDD scenarios for MVP behavior
│   ├── decisions/         #   Decision log (D-xx)
│   └── backlog.md         #   Epics and issue breakdown (E-01…E-06)
├── src/
│   ├── core/
│   │   ├── domain/        #   Pure domain — zero framework dependencies
│   │   ├── application/   #   Use cases
│   │   ├── ports/         #   Repository interfaces
│   │   └── infrastructure/#   Adapters: persistence, editor, validation
│   └── ui/                #   React app: routes, features, shadcn/ui components
├── docs/ai/               # Agent workflow: phases, rules, templates
├── scripts/ai/            # Guardrail scripts (validator side of the workflow)
├── wireframes/            # React/Tiptap UX prototype (not production code)
├── AGENTS.md              # Generic AI-agent contract
└── CLAUDE.md              # Claude Code–specific adapter
```

Key entry points for readers: `openspec/project.md` (orientation and specs index), `openspec/architecture.md` (architecture rules), `openspec/backlog.md` (implementation plan), `docs/ai/workflow.md` (agent phases).

## Current State & Roadmap

**Done:**

- ✅ Complete MVP specification: domain model, six feature specs, Gherkin flow scenarios, terminology, non-functional requirements, decision log, and epic/issue backlog.
- ✅ AI-agent workflow: contracts, phase rules, and executable guardrail scripts.
- ✅ UX wireframe (React/Tiptap prototype) validating the editor concept.
- ✅ Project foundation (E-01, in progress): Vite + React + TypeScript scaffold with routing, Tailwind CSS + shadcn/ui, and the hexagonal folder structure in place. Builds and runs.

**Not done yet (specified, not implemented):** the domain layer, use cases, IndexedDB persistence, the Tiptap editor integration, annotations, and layer rendering. The running app currently shows placeholder screens only.

**MVP roadmap:** E-02 Domain model → E-03 Piece management + work list → E-04 Editor modes → E-05 Annotation system → E-06 Snapshots & layer state.

**Post-MVP vision (explicitly out of scope for now):** an AI-assisted phase built on the structured metadata the MVP produces — help polishing texts, grouping works into coherent collections for competitions, finding competitions that match a body of work, and preparing submission materials. Also under consideration: workspaces, versioning, and backend sync.

## Getting Started

The app builds and runs, but it is a foundation scaffold — expect placeholder screens, not a working editor yet.

```bash
npm install
npm run dev      # start dev server (Vite)
npm run build    # type-check + production build
npm run lint     # ESLint
```

## Author

**Carlos López García** — [carloslg-dev.github.io/site](https://carloslg-dev.github.io/site)

This is a personal project, and a deliberate reflection of how I like to work: specification before code, explicit architecture boundaries, and AI agents used with discipline rather than improvisation.

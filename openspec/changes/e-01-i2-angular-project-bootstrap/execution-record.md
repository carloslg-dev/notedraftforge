# Execution Record — e-01-i2-angular-project-bootstrap

---

## Task reference

#2

## Change reference

e-01-i2-angular-project-bootstrap

## Execution authorization

Status: approved
Source: human
Approved by: carlos
Reason: PLAN and CONTEXT approved; decisions confirmed in conversation before IMPLEMENT

---

## Context used

| Source | Why needed | Confidence |
|---|---|---|
| `openspec/project.md` | Project orientation — MVP scope, stack, no backend | High |
| `docs/ai/workflow.md` | Mandatory phase rules and constraints | High |
| `openspec/architecture.md` | Direct spec — canonical folder structure, import rules, routing requirements | High |
| `openspec/terminology.md` | Naming rules — WorkListComponent, WorkViewComponent, WorkEditorComponent | High |
| `docs/ai/agent-rules.md` | Behavior and safety constraints | High |
| `docs/ai/context-strategy.md` | Context selection strategy | High |

---

## Files changed

### Commit 1 — fix(ai-pipeline): allow current task updates outside implement phase (4bf617d)
- `.claude/hooks/pre-edit-hook.sh` — reads `tool_input.file_path` from Claude Code hook stdin JSON; exempts `.ai/current-task.md` from phase/authorization checks

### Commit 2 — feat(e-01): bootstrap Angular project (b04cb43)
- `package.json`, `package-lock.json` — Angular 21.2.0 project dependencies
- `angular.json` — Angular workspace configuration (app builder, test runner: Vitest)
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` — TypeScript configuration
- `.editorconfig`, `.prettierrc` — code style configuration
- `eslint.config.js` — ESLint with angular-eslint v21.3.1
- `.gitignore` — added `/.angular/` (build cache)
- `src/main.ts` — bootstrapApplication entry point
- `src/index.html` — app shell HTML
- `src/styles.scss` — global styles
- `public/favicon.ico` — favicon
- `src/app/app.ts` — root `App` component with `<router-outlet />`
- `src/app/app.config.ts` — `provideRouter(routes, withHashLocation())`
- `src/app/app.routes.ts` — `/works`, `/works/:id`, `/` redirect
- `src/app/app.spec.ts` — minimal structural test (brittle title test removed)
- `src/app/features/work-list/work-list.component.ts` — `WorkListComponent` placeholder
- `src/app/features/work-view/work-view.component.ts` — `WorkViewComponent` placeholder
- `src/app/features/work-editor/work-editor.component.ts` — `WorkEditorComponent` placeholder
- `src/app/core/` — 10 subdirectories with `.gitkeep` (domain, application, ports, infrastructure)
- `src/app/shared/` — `.gitkeep`
- `scripts/ai/validate.sh` — removed `--browsers=ChromeHeadless` (Karma flag, incompatible with Angular 21 Vitest runner)

---

## Validation result

PASS

- `npm run build` — zero errors
- `./scripts/ai/validate.sh` — lint clean (angular-eslint), 1/1 test passed (Vitest)
- `ng serve` — server starts, Angular app served
- Browser route verification (`/#/works`, `/#/works/123`) — pending manual human verification

---

## Decisions made

- **Standalone components**: Angular 21 default; no `standalone: true` flag needed. `bootstrapApplication()` + `provideRouter()` pattern.
- **Hash routing**: `withHashLocation()` in `app.config.ts`. Required for GitHub Pages (no server-side redirect support).
- **Component naming — `--type=component`**: Angular 21 CLI drops the `Component` suffix by default (`WorkList` instead of `WorkListComponent`). Used `--type=component` flag to preserve `WorkListComponent` naming as specified in the issue and architecture spec.
- **Root component named `App`**: Angular 21's new CLI convention for the root component. The spec does not name the root class; no spec violation.
- **`angular-eslint` added**: Required by DoD "lint OK". Version 21.3.1 automatically detected as compatible by `ng add`.
- **Brittle title test removed from `app.spec.ts`**: Per `architecture.md` "What not to test in MVP: Angular components (brittle, low ROI)". A minimal structural `should create the app` test is retained.
- **`validate.sh` updated — `--browsers=ChromeHeadless` removed**: That flag is Karma-specific. Angular 21 uses Vitest, which does not accept it. No browser driver is needed for the current test suite (JSDOM environment).
- **Hook stdin format discovery**: Claude Code passes tool call data as `{"tool_input": {"file_path": "..."}, ...}` not `{"file_path": "..."}`. Hook fix required a debug-and-inspect cycle before the exemption worked.

---

## Retrospective summary

- **What context was missing at start?** Angular 21's breaking changes from earlier versions: file naming (`app.ts` not `app.component.ts`), class name convention (no `Component` suffix by default), test runner switch from Karma to Vitest, new `provideBrowserGlobalErrorListeners()` API. Context7 (unavailable) would have surfaced this; instead it was discovered at IMPLEMENT time through inspection of generated files.
- **Most useful document**: `openspec/architecture.md` — it was the direct spec for this task and completely authoritative for folder structure, import rules, and routing requirements.
- **Rule that was ambiguous**: "Use latest stable Angular CLI at implementation time" combined with spec naming (`WorkListComponent`). Angular 21 changed CLI defaults to drop the `Component` suffix, creating a conflict. Resolved by agent judgment (`--type=component`) and confirmed acceptable during implementation.
- **What should be automated?**: (1) Claude Code hook stdin format should be documented in `docs/ai/` — the `tool_input.file_path` nesting is non-obvious and required a debug cycle. (2) `validate.sh` Angular CLI flag compatibility should be checked when the Angular version changes.
- **What should be moved to `docs/ai/`?**: A note on Angular version-specific conventions (naming, test runner, standalone defaults) would prevent IMPLEMENT-time surprises on future issues targeting Angular 21+.

---

## Date completed

2026-04-24

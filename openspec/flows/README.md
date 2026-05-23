# Functional Flow Specifications

This folder contains the executable-style functional flow specifications for NoteDraftForge.

The current scenarios describe the MVP1 baseline. Future releases should extend this same folder by adding scenarios to existing features or by adding new feature files when a new functional area appears.

The scenarios are written to support basic QA automation first. Some scenarios can later map to Playwright E2E tests; others are intentionally tagged for domain, application, adapter, or accessibility-level tests.

## Tags

| Tag | Meaning |
|---|---|
| `@mvp1` | Covered by the MVP1 functional baseline |
| `@e2e` | Candidate for browser-level automation, likely Playwright |
| `@application` | Best verified through use-case/application tests with mocked ports |
| `@domain` | Best verified through pure domain tests |
| `@adapter` | Best verified through adapter/mapper tests |
| `@a11y` | Accessibility baseline |
| `@guardrail` | Prevents out-of-scope behavior from entering a release |

## MVP1 Scope Guardrails

- Song remains in the domain/data model only. MVP1 has no song creation, editing, viewing, or navigation flow.
- Markdown import/export UX is outside MVP1. MVP1 export/restore is JSON backup/restore of local durable data.
- `needsReview` resolution is outside MVP1. MVP1 marks and displays affected annotations; it does not provide confirm/retarget/delete resolution.
- Strikethrough formatting is outside MVP1.
- Metadata validation is basic: required/non-null values and valid controlled-list values. No advanced regex validation.

## Source Specs

- `openspec/domain-model.md`
- `openspec/specs/piece-management/spec.md`
- `openspec/specs/work-list/spec.md`
- `openspec/specs/editor-modes/spec.md`
- `openspec/specs/annotation-system/spec.md`
- `openspec/specs/snapshot-and-layer-state/spec.md`
- `openspec/specs/layer-visibility/spec.md`
- `docs/product/mvp-ux-scope.md`
- `docs/product/ux-flow.md`

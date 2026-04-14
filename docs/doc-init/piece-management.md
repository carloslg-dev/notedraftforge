# Piece Management — Doc Init

(See OpenSpec spec for authoritative rules. This doc mirrors and expands for human reading.)

- Piece fields: id, title, type(text|poem|song), content(MD), language, tags?, createdAt?, updatedAt?
- One language per piece
- Content is Markdown source of truth
- CRUD rules as defined in OpenSpec
- Delete cascade: deleting piece deletes annotations

## Import/Export (MVP)
- Import .md → one file = one new piece
- Filename → title fallback
- No dedup
- Export returns raw Markdown only

## Non-goals
- versioning, workspace links, sync

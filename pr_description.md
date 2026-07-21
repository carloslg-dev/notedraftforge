Closes #14

## Summary of changes
- Implemented `DeletePieceUseCase` in the application layer.
- Added unit tests for the use case using Vitest.

## Checklist of Acceptance Criteria
- [x] Piece is removed from PieceRepository - The use case calls `PieceRepository.delete`.
- [x] All annotations for the piece are removed from AnnotationRepository - The use case calls `AnnotationRepository.deleteByPieceId` first.
- [x] Snapshot for the piece is removed from SnapshotRepository - The use case calls `SnapshotRepository.deleteByPieceId` second.
- [x] Deleting non-existent id does not throw - The repositories resolve gracefully without throwing, fulfilling this requirement.
- [x] Respects domain invariants - The code only orchestrates repository calls.
- [x] Follows hexagonal architecture - The use case resides strictly in the application layer and only relies on the port interfaces.
- [x] No business logic inside adapters - No adapters were modified, and the deletion order is fully controlled by the use case.

## Ambiguities Found
- none

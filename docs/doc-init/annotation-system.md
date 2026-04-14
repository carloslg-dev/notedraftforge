# Annotation System — Doc Init

- Annotations separate from Markdown
- Fields: id, pieceId, range(start,end), kind(intent|breath|meter|musical_note), content, layerId, status(valid|needsReview)
- Layers fixed: interpretation, metrics, notes
- Default layer: interpretation
- Range: character offsets on Markdown (UTF-16)

## Range updates (MVP)
- insert before → shift
- insert inside → expand end
- delete before → shift back
- delete inside → shrink end
- otherwise → status=needsReview

## Musical notes
- content ∈ {C,D,E,F,G,A,B}

## Deletion
- delete piece → delete annotations (cascade)

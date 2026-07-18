# Plan de Implementación: Issue #2 (Shared types and constants)

**Epic:** E-01 Foundation
**Issue:** Shared types and constants

## 1. Tipos de Dominio a Crear

**Fichero:** `src/core/domain/types.ts`

Definiremos los union types estrictos extraídos directamente de `openspec/terminology.md` y `openspec/domain-model.md`.

*   `PieceType`: `'text' | 'poem' | 'song'`
*   `LayerKind`: `'chord' | 'meter' | 'breath' | 'intention' | 'comments'`
*   `AnnotationKind`: `'breath' | 'intent' | 'comment'`
*   `SongCellPropertyKind`: `'chord' | 'meter'`
*   `AnnotationStatus`: `'valid' | 'needsReview'`

*(Nota: En MVP solo expondremos text/poem y las annotation-driven layers en la UI, pero el dominio y estos tipos base deben incluir song, chord y meter para estar preparados para MVP2, cumpliendo la regla de no sobreingeniería limitándonos estrictamente a los literales documentados).*

## 2. Constantes CSS a Crear

**Fichero:** `src/core/domain/constants.ts`

Centralizaremos las clases CSS requeridas por el "CSS visibility mechanism" (`openspec/domain-model.md`) para garantizar que la lógica de renderizado y las vistas HTML compartan el mismo contrato sin que el dominio dependa de React o Tailwind.

*   `NDF_CLASSES` (objeto inmutable `as const`):
    *   `piece`: `'ndf-piece'`
    *   `annotation`: `'ndf-annotation'`
    *   `needsReview`: `'ndf-needs-review'`
    *   `layerPrefix`: `'ndf-layer-'` (para construir clases como `ndf-layer-breath`)
    *   `songCellPrefix`: `'ndf-song-cell-'` (para construir clases como `ndf-song-cell-chord`)
    *   `hidePrefix`: `'ndf-hide-'` (para que el contenedor oculte capas, ej. `ndf-hide-breath`)

## 3. Cobertura de Acceptance Criteria

*   **Layer definitions (compile-time):** Satisfecho mediante el type `LayerKind`. Es un union type en tiempo de compilación; no creamos clases abstractas ni generalizaciones complejas, respetando la regla de simplicidad.
*   **PieceType enum:** Satisfecho mediante el type `PieceType`. Usamos literales de string (union type) en TypeScript en lugar de un `enum` clásico para mantenerlo ligero y alineado con los tipos y convenciones modernas en Clean Code.
*   **CSS class constants:** Satisfecho mediante `NDF_CLASSES` en `constants.ts`. Evita 'magic strings' en los adaptadores de UI y renderer.
*   **Respects domain invariants & boundaries:** Estos ficheros (`types.ts` y `constants.ts`) vivirán aislados en `src/core/domain/`, garantizando que no importen React, UI, Tiptap ni IndexedDB.
*   **No sobreingeniería:** Solo se definen los tipos literales documentados en `terminology.md`. No se definen interfaces de entidades completas (que corresponden a la issue E-02 de `Piece` y `Annotation`), resolviendo exactamente lo que pide esta issue E-01 (Shared types and constants) y nada más.
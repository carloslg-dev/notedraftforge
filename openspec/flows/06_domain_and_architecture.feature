@mvp1 @domain
Feature: Domain model and architecture invariants
  The core behavior should preserve the structured domain model and hexagonal
  boundaries required by MVP1.

  @domain
  Scenario Outline: Create empty structured content by piece type
    When a piece is created with type "<type>"
    Then Piece.type is "<type>"
    And Piece.content.kind is "<type>"
    And Piece.revision is 0
    And Piece.tags contains exactly one type tag with value "<type>"

    Examples:
      | type |
      | text |
      | poem |
      | song |

  @domain
  Scenario: Reject a piece with mismatched type and content kind
    Given a piece has type "poem"
    And the piece content kind is "text"
    When domain invariants are validated
    Then the piece is invalid

  @domain
  Scenario: Reject a piece without exactly one matching type tag
    Given a piece has type "text"
    And the piece has no type tag
    When domain invariants are validated
    Then the piece is invalid

  @domain
  Scenario: Text range offsets use concatenated plain text
    Given a text block contains multiple text runs
    And the runs include inline marks
    When a TextRangeTarget is validated
    Then startOffset and endOffset are measured against concatenated plain text
    And inline marks do not affect offset calculation

  @domain
  Scenario: Reject invalid text range bounds
    Given a text block has plain-text length 15
    When a TextRangeTarget has startOffset 10 and endOffset 10
    Then the target is invalid

  @domain
  Scenario: Annotation kind must match compatible layer source
    Given an annotation has kind "intent"
    When the annotation layer is "comments"
    Then the annotation is invalid

  @domain
  Scenario Outline: Valid annotation content by kind
    Given an annotation has kind "<kind>"
    When its content is "<content>"
    Then the annotation content is valid

    Examples:
      | kind    | content                         |
      | breath  | mark S                          |
      | breath  | mark L                          |
      | intent  | non-empty shortNote             |
      | comment | non-empty shortNote             |

  @domain
  Scenario: Reject empty shortNote for note annotations
    Given an annotation has kind "comment"
    And shortNote is empty
    When annotation content is validated
    Then the annotation content is invalid

  @domain
  Scenario: Reject empty extendedNote when present
    Given an annotation has kind "intent"
    And extendedNote is present but empty
    When annotation content is validated
    Then the annotation content is invalid

  @domain
  Scenario: Chord display is derived from root and ordered modifiers
    Given a chord has root "C"
    And modifiers are sharp, minor, and seventh
    When chord content is created
    Then the display value is "C#m7"

  @guardrail @architecture
  Scenario: Domain does not import framework or adapter dependencies
    When import boundaries are checked
    Then core domain imports no React dependency
    And core domain imports no Tiptap dependency
    And core domain imports no Dexie or IndexedDB dependency
    And core domain imports no Zod dependency

  @guardrail @architecture
  Scenario: Application use cases depend on ports rather than adapters
    When application imports are checked
    Then application code may depend on domain types
    And application code may depend on port interfaces
    But application code does not depend on React, Dexie, Tiptap, or Zod

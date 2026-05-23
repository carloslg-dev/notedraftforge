@mvp1 @editor-modes
Feature: Editor modes and structured content editing
  Work view should default to visualization mode, allow switching to editing mode,
  persist structured content, and keep mode-specific controls separate.

  Background:
    Given a text or poem work exists

  @e2e
  Scenario: Opening a work enters visualization mode by default
    Given the work is visible in the Work List
    When I open the work
    Then the Work View is in visualization mode
    And the content is read-only

  @e2e
  Scenario: Switch from visualization to editing mode
    Given I opened a work in visualization mode
    When I choose Edit
    Then the Work View switches to editing mode
    And I can edit the authored content
    And I can edit title, content language, and user tags

  @e2e
  Scenario: Editing mode toolbar exposes MVP1 formatting actions
    Given I am editing a work
    When I select text in the editor
    Then the selection toolbar shows Bold
    And the selection toolbar shows Italic
    And the selection toolbar shows Underline
    And the selection toolbar shows Refine
    But the selection toolbar does not show Strikethrough
    And the selection toolbar does not show Intent
    And the selection toolbar does not show Comment
    And the selection toolbar does not show Breath

  @application
  Scenario: Tiptap content is mapped to structured PieceContent before persistence
    Given the editor has an external editor-native document
    When content autosave runs
    Then the editor adapter maps the document to structured PieceContent
    And the repository persists structured PieceContent
    But the repository does not persist Tiptap or ProseMirror JSON as domain state

  @application
  Scenario: Content changes increment revision and updatedAt
    Given a persisted work has revision 7
    When the authored content changes
    Then the updated structured content is persisted
    And updatedAt changes
    And revision becomes 8
    And the snapshot is marked stale

  @application
  Scenario: Autosave persists content after the editing debounce
    Given I am editing a work
    When I change the authored content
    And no further edits happen during the autosave debounce
    Then the latest structured content is persisted
    And typing is not blocked by persistence

  @e2e
  Scenario: Leaving editing mode preserves pending changes
    Given I am editing a work with pending content changes
    When I return to visualization mode
    Then pending changes are persisted before navigation completes
    And the work is not silently reverted

  @e2e
  Scenario: Selection refinement adjusts an editing selection without persisting an annotation
    Given I am editing a work
    And I selected text in the editor
    When I open Refine
    And I nudge the selection boundary
    And I confirm the refined selection
    Then the adjusted selection returns to editing mode
    And no annotation is persisted

  @e2e
  Scenario: Return from editing mode to visualization mode
    Given I am editing a work with pending content changes
    When I choose to return to visualization mode
    Then pending changes are persisted before the mode switches
    And the Work View is in visualization mode
    And the editing toolbar is no longer visible
    And layer controls are visible

  @e2e
  Scenario: App UI language selection does not change content language
    Given a work has content language "es"
    When I switch the app UI language from "ES" to "EN"
    Then the work content language remains "es"

  @e2e
  Scenario: Basic metadata validation rejects missing required values
    Given I am editing work metadata
    When I clear the title
    Then I cannot save the metadata
    And I see validation feedback for the title

  @e2e
  Scenario: Basic metadata validation rejects values outside controlled lists
    Given I am editing work metadata
    When I choose a content language that is not in the supported language list
    Then I cannot save the metadata
    And I see validation feedback for the content language

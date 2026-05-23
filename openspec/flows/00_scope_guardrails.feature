@mvp1 @scope
Feature: Functional scope guardrails
  Each release should expose only the functional paths that are ready for users.
  The MVP1 baseline covers text and poem authoring, interpretation annotations,
  visualization, editing, and JSON backup/restore.

  @guardrail @e2e
  Scenario: Song creation is not available in MVP1
    When I open the new work flow
    Then I can choose "text" as the work type
    And I can choose "poem" as the work type
    But I cannot choose "song" as the work type

  @guardrail @e2e
  Scenario: Song records have no MVP1 functional flow
    Given local storage contains a piece of type "song"
    When I open the Work List
    Then the song record is not shown as a selectable work
    And no song creation flow is available
    And no song editing flow is available
    And no song viewing flow is available

  @guardrail @e2e
  Scenario: Markdown import and export are not exposed in MVP1 UX
    When I open the app navigation
    Then I can open JSON backup and restore
    But I cannot open a Markdown import flow
    And I cannot open a Markdown export flow

  @guardrail @e2e
  Scenario: Editing mode does not expose annotation or layer controls
    Given I am editing a text or poem work
    When I select text in the editor
    Then I can use text formatting actions
    But I cannot create an annotation
    And I cannot update an annotation
    And I cannot delete an annotation
    And I cannot toggle layers

  @guardrail @e2e
  Scenario: Visualization mode does not allow direct content editing
    Given I opened a work in visualization mode
    When I interact with the reading surface
    Then the content is read-only
    And I must switch to editing mode before changing the authored content

  @guardrail @e2e
  Scenario: needsReview resolve flow is not available in MVP1
    Given a visible annotation has status "needsReview"
    When I select the annotation
    Then the annotation remains visible with warning styling
    But there is no resolve action available for the annotation

  @guardrail @e2e
  Scenario: Strikethrough formatting is not available in MVP1
    Given I am editing a work
    When I select text
    Then I can choose Bold
    And I can choose Italic
    And I can choose Underline
    But I cannot choose Strikethrough

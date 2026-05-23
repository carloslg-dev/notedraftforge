@mvp1 @annotations
Feature: Annotation creation, lifecycle, and rendering
  Users should be able to create interpretation annotations in visualization mode
  from current snapshot selections. Application behavior also supports updating,
  deleting, and marking annotations as needing review.

  Background:
    Given a text or poem work exists
    And the work has a current snapshot

  @e2e
  Scenario: Visualization selection shows annotation actions
    Given I opened the work in visualization mode
    When I select text in the reading surface
    Then the selection toolbar shows Intent
    And the selection toolbar shows Comment
    And the selection toolbar shows Breath
    And the selection toolbar shows Refine

  @e2e
  Scenario: Create an intent annotation with short and extended notes
    Given I selected text in the reading surface
    When I choose Intent
    And I enter short note "mas lento"
    And I enter extended note "Reducir el tempo hasta casi detenerse"
    And I confirm the annotation
    Then an intent annotation is persisted with status "valid"
    And the annotation layer is "intention"
    And the work revision increments
    And the snapshot is marked stale and queued for regeneration

  @e2e
  Scenario: Confirmed annotation is shown immediately in the reading surface
    Given I selected text in the reading surface
    When I choose Comment
    And I enter short note "subrayar silencio"
    And I confirm the annotation
    Then the annotation is visible in the reading surface without waiting for snapshot regeneration
    And the snapshot regeneration continues in the background

  @e2e
  Scenario: Create a comment annotation with a required short note
    Given I selected text in the reading surface
    When I choose Comment
    And I enter short note "subrayar silencio"
    And I confirm the annotation
    Then a comment annotation is persisted with status "valid"
    And the annotation layer is "comments"
    And the work revision increments

  @e2e
  Scenario: Create a breath annotation with a selected mark
    Given I selected text in the reading surface
    When I choose Breath
    And I choose breath mark "S"
    And I confirm the annotation
    Then a breath annotation is persisted with mark "S"
    And the annotation layer is "breath"
    And the work revision increments

  @e2e
  Scenario: Intent and comment annotations require shortNote
    Given the annotation modal is open for kind "intent"
    When the short note is empty
    And I confirm the annotation
    Then I see inline validation feedback for the short note
    And no annotation is persisted

  @application
  Scenario: Breath annotation requires an S or L mark
    Given an annotation create request has kind "breath"
    When the breath mark is absent
    And the create request is validated
    Then the operation is rejected with validation feedback
    And no annotation is persisted

  @application
  Scenario: Reject an annotation target outside the same work
    Given an annotation create request references a target from another work
    When the create request is validated
    Then the operation is rejected
    And no annotation is persisted
    And the work revision does not change

  @application
  Scenario: Reject an out-of-bounds text range target
    Given a text block has plain-text length 20
    When an annotation request uses range start 5 and end 30
    Then the operation is rejected with validation feedback
    And no annotation is persisted

  @application
  Scenario: Update annotation content and target
    Given a valid breath annotation exists
    When an annotation update request changes its target to another valid text range
    And the content remains valid for kind "breath"
    Then the annotation is persisted with the new target
    And the work updatedAt changes
    And the work revision increments
    And the snapshot is invalidated

  @application
  Scenario: Annotation kind is immutable after creation
    Given a comment annotation exists
    When an annotation update request tries to change its kind to "intent"
    Then the operation is rejected
    And the annotation kind remains "comment"

  @application
  Scenario: Delete an annotation
    Given a valid annotation exists
    When the annotation is deleted
    Then the annotation is removed
    And the work updatedAt changes
    And the work revision increments
    And the snapshot is invalidated

  @application
  Scenario: Mark an annotation as needsReview when its target becomes unresolved
    Given an annotation targets block "line-1"
    When content changes remove block "line-1"
    And the target integrity pass runs
    Then the annotation status becomes "needsReview"
    And the annotation remains persisted

  @e2e
  Scenario: needsReview annotation remains visible with warning styling
    Given an annotation has status "needsReview"
    When I open visualization mode
    Then the annotation is visible with warning styling
    And there is no resolve action available in MVP1

  @e2e
  Scenario: Selection refinement adjusts a visualization selection before annotation
    Given I selected text in the reading surface
    When I open Refine
    And I nudge the selection boundary
    And I confirm the refined selection
    Then the adjusted selection is used for the next annotation target
    And no annotation is persisted by the refinement step itself

  @e2e
  Scenario: shortNote is visible in the reading surface
    Given an intent annotation has short note "mas lento"
    And the intention layer is visible
    When the work renders in visualization mode
    Then "mas lento" is shown above the annotated text

  @e2e
  Scenario: extendedNote is visible when selecting an annotation
    Given an intent annotation has extended note "Reducir el tempo hasta casi detenerse"
    When I select the annotation in visualization mode
    Then the annotation detail surface shows "Reducir el tempo hasta casi detenerse"

  @domain @guardrail
  Scenario: Chord and meter are SongCell properties, not annotation kinds
    Given a SongCell has chord data and meter data
    When domain invariants are validated
    Then chord is a property of SongCell, not an Annotation record
    And meter is a property of SongCell, not an Annotation record
    And no Annotation entity exists for chord or meter

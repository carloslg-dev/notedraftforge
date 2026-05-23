@mvp1 @snapshot @layers
Feature: Snapshot rendering and layer visibility
  Visualization mode should load pre-rendered snapshots quickly, regenerate stale
  snapshots in the background, and control layer visibility through CSS state.

  Background:
    Given a text or poem work exists

  @application
  Scenario: Generate a snapshot from structured content and annotations
    Given the work has structured content
    And the work has annotations
    When snapshot generation runs
    Then the renderer consumes PieceContent and all annotations
    And it stores PieceSnapshot.html
    And PieceSnapshot.sourceRevision equals the current work revision
    And the generated HTML contains metadata for mapping DOM selections to AnnotationTarget values

  @application
  Scenario: Content changes make an existing snapshot stale
    Given the work has a current snapshot
    When the authored content changes
    Then the work revision increments
    And the snapshot is stale because sourceRevision is lower than work revision
    And background snapshot regeneration is triggered

  @application
  Scenario: Annotation changes make an existing snapshot stale
    Given the work has a current snapshot
    When an annotation is created, updated, or deleted
    Then the work revision increments
    And the snapshot is stale because sourceRevision is lower than work revision
    And background snapshot regeneration is triggered

  @e2e
  Scenario: Open visualization with a current snapshot
    Given the work has a current snapshot
    When I open the work from the Work List
    Then visualization mode displays the snapshot HTML
    And annotation actions are enabled
    And layer toggles are enabled

  @e2e
  Scenario: No-snapshot fallback disables annotation and layer actions
    Given the work has no snapshot
    When I open the work from the Work List
    Then I see read-only base structured content
    And annotation actions are disabled
    And layer toggles are disabled
    And first snapshot generation starts in the background
    When the first current snapshot is stored
    Then the view switches to snapshot rendering
    And annotation actions become available
    And layer toggles become available

  @e2e
  Scenario: Stale snapshot loads fast but blocks annotation actions
    Given the work has a stale snapshot
    When I open the work from the Work List
    Then the stale snapshot is shown immediately
    And annotation actions are disabled
    And fresh snapshot generation starts in the background
    When the fresh snapshot is stored
    Then the view uses the fresh snapshot
    And annotation actions become available

  @e2e
  Scenario: Toggle an annotation layer without regenerating HTML
    Given the work has a current snapshot
    And the breath layer is visible
    When I toggle the breath layer off
    Then layerVisibility.breath is persisted as false
    And the visualization container has class "ndf-hide-breath"
    And the snapshot HTML is not regenerated

  @e2e
  Scenario: Layer toggles are independent
    Given layerVisibility.breath is true
    And layerVisibility.comments is false
    When I toggle the comments layer on
    Then layerVisibility.comments is true
    And layerVisibility.breath remains true

  @e2e
  Scenario: needsReview annotations remain visible when their layer is hidden
    Given a comment annotation has status "needsReview"
    And the comments layer is visible
    When I toggle the comments layer off
    Then the needsReview annotation remains visible
    And it keeps warning styling

  @application
  Scenario: New snapshot initializes default layer visibility
    Given a snapshot is generated for a work without existing layer state
    Then layerVisibility.chord is true
    And layerVisibility.meter is false
    And layerVisibility.breath is false
    And layerVisibility.intention is false
    And layerVisibility.comments is false

  @application
  Scenario: Layer visibility changes do not mutate domain content
    Given a work has structured content and annotations
    When layerVisibility is updated
    Then Piece.content is unchanged
    And annotations are unchanged
    And work revision is unchanged
    And snapshot HTML is not regenerated

  @a11y @e2e
  Scenario: Layer toggles have accessible labels and mobile-safe tap targets
    Given I open the layer controls in visualization mode
    Then each visible layer toggle has a readable accessible label
    And each visible layer toggle has a tap target at least 44 by 44 pixels

@mvp1 @work-list
Feature: Work List and work creation
  The user should be able to browse existing works, filter them, create new text
  or poem works, and enter editing mode immediately after creation.

  Background:
    Given the app can read and write local IndexedDB data

  @e2e
  Scenario: Open the app into the Work List
    Given local storage contains multiple works
    When I open the app
    Then I see the Work List
    And the works are ordered by "updatedAt" descending
    And each visible work shows title, type badge, user tags, and recency information

  @e2e
  Scenario: Empty Work List offers create and restore actions
    Given local storage contains no works
    When I open the Work List
    Then I see the no-pieces empty state
    And I can start creating a work
    And I can open JSON restore

  @e2e
  Scenario: Filter works by type and user tag
    Given these works exist:
      | title        | type | tags          |
      | Stage draft  | poem | stage,draft   |
      | Essay note   | text | draft         |
      | Quiet poem   | poem | quiet         |
    When I filter by type "poem"
    And I filter by user tag "draft"
    Then only "Stage draft" remains visible

  @e2e
  Scenario: User tag filtering is case-insensitive
    Given a work exists with user tag "Stage"
    When I filter by user tag "stage"
    Then the work remains visible

  @e2e
  Scenario: Clearing all filters restores the full Work List
    Given active filters hide at least one work
    When I clear all filters
    Then all MVP1-visible works are visible again

  @e2e
  Scenario: No results after filtering keeps filters active
    Given local storage contains works
    When I apply filters that match no work
    Then I see the no-results empty state
    And the active filters remain selected

  @e2e
  Scenario: Search overflow tags before selecting a hidden tag filter
    Given the number of user tags exceeds the visible filter limit
    When I open the overflow tag search
    Then I see a search input
    And I do not see an unfiltered flat list of all tags
    When I type "stage"
    Then only matching tags are shown
    When I select the "stage" tag
    Then the overflow chip indicates "stage" is active
    And the Work List is filtered by "stage"

  @e2e
  Scenario: Create a new poem work and open it in editing mode
    Given I am on the Work List
    When I start creating a new work
    And I enter title "El descanso del dia"
    And I choose type "poem"
    And I choose content language "es"
    And I confirm creation
    Then a new work is persisted with type "poem"
    And the system-managed type tag is "poem"
    And the work content is empty poem content
    And the work opens in editing mode

  @e2e
  Scenario: Create a new text work and open it in editing mode
    Given I am on the Work List
    When I start creating a new work
    And I enter title "Notes on silence"
    And I choose type "text"
    And I choose content language "en"
    And I confirm creation
    Then a new work is persisted with type "text"
    And the system-managed type tag is "text"
    And the work content is empty text content
    And the work opens in editing mode

  @e2e
  Scenario: Title is required to create a work
    Given I am creating a new work
    When the title is empty
    Then the create action is disabled
    And no work is persisted

  @application
  Scenario: Content language must be a valid ISO 639-1 code
    Given I am creating a new work
    When the content language value is not a valid ISO 639-1 two-letter code
    Then the create request is rejected
    And no work is persisted
    And I see validation feedback for the content language

  @application
  Scenario: Metadata updates do not increment revision
    Given a persisted work has revision 4
    When I update title, content language, or user tags
    Then the metadata changes are persisted
    And the work updatedAt changes
    But the work revision remains 4

  @application
  Scenario: Piece type cannot be changed as a metadata update
    Given a persisted work has type "poem"
    When a metadata update requests type "text"
    Then the update is rejected
    And the work type remains "poem"

@mvp1 @backup-restore
Feature: JSON backup and restore
  The user should be able to protect local work with a complete JSON backup and
  restore from that backup after explicit confirmation and schema validation.

  Background:
    Given the app stores data locally in IndexedDB

  @e2e
  Scenario: Export a complete JSON backup
    Given local storage contains works, annotations, and layer visibility state
    When I open Backup
    And I choose to download a JSON backup
    Then the app creates a JSON file with version "1"
    And the JSON contains exportedAt
    And the JSON contains all works
    And each work entry contains its annotations
    And each work entry contains layerVisibility
    And the file name matches "notedraftforge-backup-<YYYY-MM-DD>.json"
    And stored app data is not mutated

  @application
  Scenario: Snapshot HTML is not required in a backup
    Given local storage contains a work with a snapshot
    When a JSON backup is exported
    Then the backup may omit snapshot HTML
    And restored data can regenerate snapshots from works and annotations

  @e2e
  Scenario: Restore valid backup after explicit replace-all confirmation
    Given local storage contains existing works
    And I have valid backup JSON ready to restore
    And I have started the restore flow
    And I can see the warning that restore replaces all current local data and cannot be undone
    When I explicitly confirm restore
    Then the backup schema is validated
    And all existing local works are replaced
    And backup works are persisted
    And backup annotations are persisted
    And backup layer visibility state is persisted

  @e2e
  Scenario: Restore from an uploaded JSON file
    Given local storage contains existing works
    And I have a valid backup JSON file
    When I upload the file in the restore tab
    And I can see the warning that restore replaces all current local data and cannot be undone
    And I explicitly confirm restore
    Then the backup is applied in the same way as a pasted JSON restore
    And all existing local works are replaced

  @e2e
  Scenario: Cancel restore before confirmation
    Given local storage contains existing works
    And I provide valid backup JSON
    When I start restore
    And I cancel at the replace-all warning
    Then existing local data remains unchanged

  @e2e
  Scenario: Reject malformed backup JSON
    Given local storage contains existing works
    When I provide malformed backup JSON
    And I attempt restore
    Then I see validation feedback
    And existing local data remains unchanged

  @application
  Scenario: Reject unsupported backup version
    Given a backup JSON has version "999"
    When restore validation runs
    Then the backup is rejected
    And existing local data remains unchanged

  @application
  Scenario: Reject backup with inconsistent piece type metadata
    Given a backup contains a work with Piece.type "poem"
    And the work content kind is "text"
    When restore validation runs
    Then the backup is rejected
    And existing local data remains unchanged

  @application
  Scenario: Failed restore leaves existing data intact
    Given local storage contains existing works
    And a backup contains multiple works
    When restore fails mid-way while applying the backup
    Then no current data is replaced
    And the app data remains unchanged

  @e2e
  Scenario: Backup and restore are available from an empty Work List
    Given local storage contains no works
    When I open the Work List
    Then I can open JSON restore
    And I can restore from a valid backup

# Requirements Document

## Introduction

This feature adds a per-program configurable master multiplier to the Vocal School platform. Currently, the master-level price multiplier is hardcoded globally as 1.3. This change allows each program to define its own master multiplier, editable via both the program creation and edit forms. The expert level remains fixed at 1.0.

## Glossary

- **Program**: A subscription-based vocal training offering with packages, pricing, and metadata.
- **Package**: A price/lesson-count pair within a Program (e.g., 4 lessons for 8000₽).
- **Master Multiplier**: A floating-point coefficient applied to package prices when the master mentor level is selected.
- **Mentor Level**: The tier of instructor assigned to lessons — either "expert" (base price) or "master" (multiplied price).
- **Program Edit Form**: The client-side form used by authorized users to update an existing program.
- **Program Creation Form**: The form used to create a new program via the admin interface.
- **Pricing Calculator**: The utility functions (`getAdjustedPrice`, `pricePerLesson`) that compute displayed prices based on package data and mentor level.

## Requirements

### Requirement 1: Per-Program Master Multiplier Storage

**User Story:** As an admin, I want each program to store its own master multiplier, so that pricing can vary between programs without changing global constants.

#### Acceptance Criteria

1. THE Program model SHALL include a `masterMultiplier` field of type Float with a default value of 1.3.
2. WHEN a new Program is created without specifying a master multiplier, THE System SHALL assign the default value of 1.3 to the `masterMultiplier` field.
3. THE Program type definition SHALL expose `masterMultiplier` as a numeric property available to all consuming components and utilities.

### Requirement 2: Master Multiplier in Program Creation Form

**User Story:** As an admin, I want to set the master multiplier when creating a new program, so that I can configure pricing from the start.

#### Acceptance Criteria

1. THE Program Creation Form SHALL display a master multiplier input field with a minimum value of 1.0, a maximum value of 2.0, and a step of 0.01.
2. WHEN the admin submits the creation form with a valid master multiplier value, THE System SHALL persist the provided value to the Program record.
3. WHEN the admin submits the creation form without modifying the master multiplier field, THE System SHALL use the default value of 1.3.
4. IF the admin enters a master multiplier value outside the range 1.0–2.0, THEN THE Program Creation Form SHALL display a validation error and prevent submission.

### Requirement 3: Master Multiplier in Program Edit Form

**User Story:** As an admin, I want to edit the master multiplier of an existing program, so that I can adjust master-level pricing after creation.

#### Acceptance Criteria

1. THE Program Edit Form SHALL display the current master multiplier value in an editable input field with a minimum of 1.0, a maximum of 2.0, and a step of 0.01.
2. WHEN the admin updates the master multiplier and submits the form, THE System SHALL persist the new value to the Program record.
3. IF the admin enters a master multiplier value outside the range 1.0–2.0, THEN THE Program Edit Form SHALL display a validation error and prevent submission.

### Requirement 4: Pricing Calculation with Per-Program Multiplier

**User Story:** As a visitor viewing a program page, I want to see accurate pricing based on the program's own master multiplier, so that prices reflect the actual cost for that specific program.

#### Acceptance Criteria

1. WHEN the master mentor level is selected, THE Pricing Calculator SHALL multiply the package base price by the program's `masterMultiplier` value to compute the adjusted total price.
2. WHEN the master mentor level is selected, THE Pricing Calculator SHALL divide the adjusted total price by the number of lessons to compute the per-lesson price.
3. WHEN the expert mentor level is selected, THE Pricing Calculator SHALL use a multiplier of 1.0 regardless of the program's `masterMultiplier` value.
4. WHILE a program's `masterMultiplier` is not explicitly provided to the Pricing Calculator, THE Pricing Calculator SHALL fall back to the global constant value of 1.3.

### Requirement 5: Validation Schema Update

**User Story:** As a developer, I want the program validation schema to enforce multiplier constraints, so that invalid values are rejected before reaching the database.

#### Acceptance Criteria

1. THE ProgramSchema SHALL include a `master_multiplier` field validated as a number with a minimum of 1.0 and a maximum of 2.0.
2. THE ProgramSchema SHALL assign a default value of 1.3 to the `master_multiplier` field when not provided.
3. WHEN validation fails for the `master_multiplier` field, THE ProgramSchema SHALL produce an error message indicating the allowed range.

### Requirement 6: Server Action Data Flow

**User Story:** As a developer, I want the program create and update server actions to handle the master multiplier field, so that form submissions correctly persist the value.

#### Acceptance Criteria

1. WHEN the create program action receives form data with a `master_multiplier` value, THE System SHALL include the value when creating the Program record in the database.
2. WHEN the update program action receives form data with a `master_multiplier` value, THE System SHALL update the Program record's `masterMultiplier` field with the new value.
3. THE ProgramFormData interface SHALL include an optional `master_multiplier` field of type number.

### Requirement 7: Backward Compatibility

**User Story:** As a developer, I want existing programs without a master multiplier to continue working correctly, so that the migration does not break current functionality.

#### Acceptance Criteria

1. WHEN the database migration adds the `masterMultiplier` column, THE System SHALL set existing Program records to the default value of 1.3.
2. WHILE the global `LevelMultipliers` constant exists, THE System SHALL retain the constant as a fallback for code paths that do not receive a per-program multiplier.
3. THE System SHALL not introduce new external packages or dependencies to implement this feature.

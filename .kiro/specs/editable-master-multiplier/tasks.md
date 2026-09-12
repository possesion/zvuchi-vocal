# Implementation Plan: Editable Master Multiplier

## Overview

Add a per-program configurable `masterMultiplier` field (Float, default 1.3, range 1.0–2.0) that flows from the database through forms, server actions, and into pricing utilities. No new dependencies; existing constants remain as fallback.

## Tasks

- [x] 1. Database schema and type definitions
  - [x] 1.1 Add `masterMultiplier` column to Prisma schema and create migration
    - Add `masterMultiplier Float @default(1.3)` to the `Program` model in `prisma/schema.prisma`
    - Run `npx prisma migrate dev --name add-master-multiplier` to generate the migration
    - The migration sets default 1.3 on existing rows automatically
    - _Requirements: 1.1, 1.2, 7.1_

  - [x] 1.2 Update `Program` interface in `src/lib/types.ts`
    - Add `masterMultiplier: number` field to the `Program` interface
    - _Requirements: 1.3_

  - [x] 1.3 Update `ProgramSchema` and `ProgramForm` type in `src/lib/definitions.ts`
    - Add `master_multiplier` field to `ProgramSchema` with `.min(1.0)`, `.max(2.0)`, `.default(1.3)`
    - Add error messages: `'Множитель должен быть от 1.0 до 2.0'`
    - Add `master_multiplier: number` to `ProgramForm` type
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Database layer and server actions
  - [x] 2.1 Update db-prisma.ts program functions to include `masterMultiplier`
    - Update `getAllPrograms` to return `masterMultiplier` from parsed rows
    - Update `getProgramBySlug` to return `masterMultiplier`
    - Update `getProgramById` to return `masterMultiplier`
    - Update `createProgram` to persist `masterMultiplier` in the Prisma `create` call
    - Update `updateProgram` to persist `masterMultiplier` in the Prisma `update` call
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 2.2 Update server actions in `src/app/actions/programs.ts`
    - Add `master_multiplier?: number` to `ProgramFormData` interface
    - In `createProgramAction`: pass `masterMultiplier: data.master_multiplier ?? 1.3` to `createProgram`
    - In `updateProgramAction`: pass `masterMultiplier: data.master_multiplier ?? existingProgram.masterMultiplier` to `updateProgram`
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Checkpoint — Ensure schema, types, and data layer compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Form updates
  - [x] 4.1 Update `src/app/programs/[slug]/program-edit-form.tsx`
    - Add `master_multiplier: program.masterMultiplier` to `defaultValues`
    - Add a numeric input field (type="number", step="0.01", min="1.0", max="2.0") with label "Множитель мастера"
    - Display validation error from `errors.master_multiplier`
    - Place after the "Порядок сортировки" input
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.2 Update `src/app/programs/program-add-form.tsx`
    - Add `master_multiplier: 1.3` to `defaultValues`
    - Add the same numeric input field as in the edit form
    - Display validation error from `errors.master_multiplier`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Pricing flow updates
  - [x] 5.1 Update pricing utility functions in `src/app/programs/utils.ts`
    - Add optional `masterMultiplier?: number` parameter to `getAdjustedPrice`
    - Add optional `masterMultiplier?: number` parameter to `pricePerLesson`
    - When `selectedLevel === 'master'`, use `masterMultiplier ?? LevelMultipliers.master`
    - When `selectedLevel === 'expert'`, always use `LevelMultipliers.expert` (1.0)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Update `src/app/programs/[slug]/program-pricing-client.tsx`
    - Add `masterMultiplier: number` to `ProgramPricingClientProps` interface
    - Accept `masterMultiplier` prop and pass it to `ProgramPricingTabs`
    - _Requirements: 4.1_

  - [x] 5.3 Update `src/app/programs/[slug]/program-pricing-tabs.tsx`
    - Add `masterMultiplier: number` to `ProgramPricingTabsWithLevelProps` interface
    - Pass `masterMultiplier` as third argument to `getAdjustedPrice` and `pricePerLesson` calls
    - _Requirements: 4.1, 4.2_

  - [x] 5.4 Update `src/app/programs/[slug]/page.tsx`
    - Pass `masterMultiplier={program.masterMultiplier}` prop to `ProgramPricingClient`
    - _Requirements: 4.1_

- [-] 6. Checkpoint — Ensure full build succeeds and pricing renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Property-based tests for pricing utilities
  - [ ] 7.1 Write property test: adjusted price calculation with per-program multiplier
    - **Property 3: Adjusted price calculation with per-program multiplier**
    - For any package with price > 0 and multiplier in [1.0, 2.0], `getAdjustedPrice(pkg, 'master', m)` equals `Math.round(p * m / 100) * 100`
    - **Validates: Requirements 4.1**

  - [ ] 7.2 Write property test: per-lesson price calculation
    - **Property 4: Per-lesson price calculation**
    - For any package with price > 0, lessons > 0, and multiplier in [1.0, 2.0], `pricePerLesson(pkg, 'master', m)` equals `Math.round(Math.round(p * m) / n)`
    - **Validates: Requirements 4.2**

  - [ ] 7.3 Write property test: expert level ignores master multiplier
    - **Property 5: Expert level ignores master multiplier**
    - For any package and any multiplier m, `getAdjustedPrice(pkg, 'expert', m)` equals `getAdjustedPrice(pkg, 'expert', 1.0)`
    - **Validates: Requirements 4.3**

  - [ ] 7.4 Write property test: fallback to global constant when multiplier omitted
    - **Property 6: Fallback to global constant when multiplier omitted**
    - For any package, `getAdjustedPrice(pkg, 'master')` equals `getAdjustedPrice(pkg, 'master', 1.3)`
    - **Validates: Requirements 4.4, 7.2**

  - [ ] 7.5 Write property test: invalid multiplier rejection by schema
    - **Property 2: Invalid multiplier rejection**
    - For any numeric value m < 1.0 or m > 2.0, ProgramSchema validation rejects the `master_multiplier` field
    - **Validates: Requirements 2.4, 3.3, 5.1**

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- No new packages introduced — uses existing Vitest and yup
- `LevelMultipliers` constants preserved as fallback for backward compatibility (Requirement 7.2)
- Expert level always uses multiplier 1.0 regardless of `masterMultiplier` value (Requirement 4.3)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5"] }
  ]
}
```

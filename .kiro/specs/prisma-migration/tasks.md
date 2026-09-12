# Implementation Plan: Prisma Migration

## Overview

Migrate the vocal-school application from raw SQL with `better-sqlite3` to Prisma ORM. This plan breaks down the migration into discrete, manageable steps that build incrementally, ensuring all existing functionality is preserved while improving type safety and maintainability.

## Tasks

- [ ] 1. Install and Configure Prisma
  - [ ] 1.1 Install Prisma packages
    - Run `npm install @prisma/client prisma` to add both packages
    - Verify both packages appear in `package.json`
    - _Requirements: 1.1, 1.2_
  
  - [ ] 1.2 Initialize Prisma and configure environment
    - Run `npx prisma init` to create `prisma/schema.prisma` and `.env`
    - Verify `prisma/schema.prisma` exists
    - Update `.env` with `DATABASE_URL="file:./data/wiki.db"`
    - Update `.env.local` with `DATABASE_URL="file:./data/wiki.db"`
    - _Requirements: 1.3, 1.6, 1.7_
  
  - [ ] 1.3 Verify Prisma installation
    - Run `npx prisma --version` to verify CLI is available
    - Run `npx prisma generate` to verify Prisma Client generates successfully
    - _Requirements: 1.5_

- [ ] 2. Define Complete Prisma Schema
  - [ ] 2.1 Create Prisma schema with all models
    - Configure SQLite datasource with `DATABASE_URL` environment variable
    - Define all 6 models: `WikiCategory`, `WikiTerm`, `News`, `Short`, `Instructor`, `User`
    - Map all columns from existing tables to Prisma fields with correct types
    - Define primary keys for all models
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 2.2 Add constraints and relationships
    - Define unique constraints: `Short.url`, `Instructor.slug`, `User.email`
    - Establish foreign key relationships: `WikiTerm` → `WikiCategory`
    - Create indexes for frequently queried fields: `category`, `slug`, `verificationToken`, `sortOrder`
    - Ensure default values match existing database defaults
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 2.3 Verify schema validity
    - Run `npx prisma generate` to verify schema compiles without errors
    - Verify all 6 models are defined correctly
    - _Requirements: 2.8_

- [ ] 3. Create Prisma-Based Database Layer
  - [ ] 3.1 Set up database layer foundation
    - Create new file `src/lib/db-prisma.ts`
    - Import Prisma Client and define types
    - Initialize Prisma Client as singleton pattern
    - Export singleton getter function
    - _Requirements: 3.1, 3.3, 3.8_
  
  - [ ] 3.2 Implement wiki database functions
    - Implement `getCategories()` using Prisma
    - Implement `getCategoryLabel(id)` using Prisma
    - Implement `getAllTerms()` using Prisma
    - Implement `getTermById(id)` using Prisma
    - Implement `upsertTerm(term)` using Prisma
    - Implement `deleteTermById(id)` using Prisma
    - Maintain identical return types and signatures
    - _Requirements: 3.2, 3.4_
  
  - [ ] 3.3 Implement news database functions
    - Implement `getLatestNews(limit)` using Prisma
    - Implement `getNewsById(id)` using Prisma
    - Implement `createNews(news)` using Prisma
    - Implement `updateNews(news)` using Prisma
    - Implement `deleteNews(id)` using Prisma
    - Implement `incrementNewsViews(id)` using Prisma
    - Maintain identical return types and signatures
    - _Requirements: 3.2, 3.4_
  
  - [ ] 3.4 Implement instructor database functions
    - Implement `getAllInstructors()` using Prisma
    - Implement `getInstructorById(id)` using Prisma
    - Implement `getInstructorBySlug(slug)` using Prisma
    - Implement `createInstructor(data)` with JSON field handling
    - Implement `updateInstructor(data)` with JSON field handling
    - Implement `deleteInstructor(id)` using Prisma
    - Handle JSON parsing for `performanceVideos` and `techniques` fields
    - _Requirements: 3.2, 3.4, 3.6_
  
  - [ ] 3.5 Implement user database functions
    - Implement `getUserByEmail(email)` using Prisma
    - Implement `getUserById(id)` using Prisma
    - Implement `createUser(data)` using Prisma
    - Implement `updateUser(id, data)` using Prisma
    - Implement `deleteUser(id)` using Prisma
    - Implement `getAllUsers()` using Prisma
    - Implement `getUserByVerificationToken(token)` using Prisma
    - Maintain password hash and verification token logic
    - _Requirements: 3.2, 3.4_
  
  - [ ] 3.6 Implement shorts database functions
    - Implement `getShortsFromDb()` using Prisma
    - Implement `addShortToDb(url)` with URL uniqueness enforcement
    - Implement `deleteShortFromDb(url)` using Prisma
    - Maintain identical return types and signatures
    - _Requirements: 3.2, 3.4_
  
  - [ ] 3.7 Add error handling and logging
    - Wrap all database operations in try-catch blocks
    - Implement meaningful error messages for debugging
    - Add logging for database operations
    - Handle constraint violations gracefully
    - _Requirements: 3.7_
  
  - [ ]* 3.8 Write property tests for database layer
    - **Property 1: Schema Field Type Correctness** - Verify Prisma correctly maps columns with correct types
    - **Property 2: Unique Constraint Enforcement** - Verify duplicate values in unique fields are rejected
    - **Property 3: Foreign Key Relationship Integrity** - Verify relationships are established and queried correctly
    - **Property 4: Default Value Application** - Verify default values are applied correctly
    - **Property 5: Function Return Type Correctness** - Verify return types match expected signatures
    - **Property 6: Transaction Atomicity** - Verify multi-operation transactions execute atomically
    - **Property 7: JSON Field Round-Trip** - Verify JSON fields preserve structure and content
    - **Property 8: Database Operation Error Handling** - Verify errors are handled gracefully
    - **Property 9: Prisma Client Singleton Pattern** - Verify singleton instance is reused
    - **Property 10: Functional Equivalence** - Verify Prisma implementation matches legacy implementation
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [ ] 4. Create Database Seeding
  - [ ] 4.1 Create seed file with wiki data
    - Create `prisma/seed.ts` file
    - Implement seeding for wiki categories
    - Implement seeding for all 13 default wiki terms
    - Make seeding idempotent (safe to run multiple times)
    - _Requirements: 5.1, 5.3, 5.4, 5.6_
  
  - [ ] 4.2 Implement admin user seeding
    - Implement admin user seeding from environment variables
    - Make admin user seeding idempotent
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ] 4.3 Configure and test seeding
    - Update `package.json` with seed script in prisma section
    - Test seeding with `npx prisma db seed`
    - Verify seeding is idempotent by running multiple times
    - _Requirements: 5.5, 5.6_

- [ ] 5. Migrate All Database Usage
  - [ ] 5.1 Update API routes to use Prisma
    - Find all files in `src/app/api/` importing from `src/lib/db.ts`
    - Update all imports to `src/lib/db-prisma.ts`
    - Verify all API routes work correctly
    - Test each endpoint with sample requests
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 5.2 Update server components to use Prisma
    - Find all server components importing from `src/lib/db.ts`
    - Update all imports to `src/lib/db-prisma.ts`
    - Verify all components render correctly
    - Test components in browser
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ] 5.3 Verify no raw SQL remains
    - Search codebase for any remaining raw SQL queries
    - Ensure all database calls use Prisma functions
    - Verify type safety throughout application
    - _Requirements: 4.5, 4.6_

- [ ] 6. Checkpoint - Verify Core Functionality
  - Ensure all CRUD operations work correctly, all relationships are maintained, and no TypeScript errors exist. Ask the user if questions arise.

- [ ] 7. Verify Data Integrity and Functionality
  - [ ] 7.1 Test data preservation and accessibility
    - Verify existing `data/wiki.db` file is preserved
    - Verify all existing data remains accessible through Prisma queries
    - Verify no data transformation or loss occurred
    - Verify database schema matches existing structure exactly
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 7.2 Test relationships and constraints
    - Test all relationships between tables work correctly
    - Verify all constraints are maintained
    - Test creating and querying related records
    - _Requirements: 7.5, 9.2_
  
  - [ ] 7.3 Test CRUD operations and transactions
    - Test all CRUD operations for each table
    - Test multi-operation transactions execute atomically
    - Test error handling for edge cases
    - _Requirements: 9.1, 9.3, 9.5_
  
  - [ ]* 7.4 Write integration tests
    - Test end-to-end flows through API routes
    - Test data consistency across operations
    - Test error conditions and recovery
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 8. Remove Legacy Code
  - [ ] 8.1 Remove legacy database layer
    - Verify all functionality works with Prisma
    - Delete `src/lib/db.ts` file
    - Remove `better-sqlite3` from `package.json`
    - Run `npm install` to update dependencies
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 8.2 Verify legacy code removal
    - Verify application builds without errors
    - Search for any remaining references to `better-sqlite3`
    - Verify no legacy database code remains
    - _Requirements: 8.4, 8.5_

- [ ] 9. Final Testing and Documentation
  - [ ] 9.1 Run comprehensive tests
    - Run full application test suite
    - Test all features end-to-end
    - Verify no console errors or warnings
    - _Requirements: 9.6, 9.7_
  
  - [ ] 9.2 Add code documentation
    - Add clear comments to `src/lib/db-prisma.ts` explaining key functions
    - Add comments to `prisma/schema.prisma` explaining each model and field
    - Document error handling patterns
    - _Requirements: 10.1, 10.2_
  
  - [ ] 9.3 Update project documentation
    - Update README with Prisma setup instructions
    - Document environment variable requirements
    - Create migration guide for future reference
    - _Requirements: 10.3, 10.4, 10.5_

- [ ] 10. Final Checkpoint - Ensure All Tests Pass
  - Ensure all tests pass, all features work end-to-end, and documentation is complete. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and edge cases
- All database operations must maintain identical behavior to the legacy implementation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7"] },
    { "id": 3, "tasks": ["3.8", "4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 6, "tasks": ["8.1", "8.2"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```

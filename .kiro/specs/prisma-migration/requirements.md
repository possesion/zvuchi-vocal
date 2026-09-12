# Requirements Document

## Introduction

Prisma Migration - Migrate the vocal-school application from raw SQL queries with `better-sqlite3` to Prisma ORM.

This document outlines the requirements for migrating the vocal-school application from raw SQL queries with `better-sqlite3` to Prisma ORM. The migration maintains all existing functionality while improving code maintainability, type safety, and developer experience. The system must preserve all data, maintain identical behavior, and provide a modern database abstraction layer.

## Glossary

- **Prisma**: Modern ORM for Node.js and TypeScript with type-safe database access
- **ORM**: Object-Relational Mapping - abstraction layer between application and database
- **Schema**: Database structure definition in `prisma/schema.prisma`
- **Migration**: Prisma's version control system for database schema changes
- **Seeding**: Populating database with initial data
- **Prisma_Client**: Auto-generated database access layer from Prisma schema
- **Database_Layer**: Application code responsible for all database operations
- **Legacy_Database_Layer**: Existing `src/lib/db.ts` implementation using `better-sqlite3`
- **Transaction**: Atomic database operation ensuring all-or-nothing execution
- **Type_Safety**: Compile-time verification of database types and operations
- **Drop-in_Replacement**: New implementation with identical function signatures and behavior

## Requirements

### Requirement 1: Install and Configure Prisma

**User Story:** As a developer, I want Prisma to be properly installed and configured, so that I can use it for database operations.

#### Acceptance Criteria

1. WHEN the project is set up, THE System SHALL add `@prisma/client` package to `package.json`
2. WHEN the project is set up, THE System SHALL add `prisma` package as a dev dependency to `package.json`
3. WHEN Prisma is installed, THE System SHALL create `prisma/schema.prisma` file with SQLite datasource configuration
4. WHEN the schema is created, THE System SHALL configure `DATABASE_URL` environment variable to point to `file:./data/wiki.db`
5. WHEN the schema is configured, THE Prisma_Client SHALL generate successfully without errors
6. WHEN the project is initialized, THE System SHALL ensure `.env` file contains correct `DATABASE_URL` configuration
7. WHEN the project is initialized, THE System SHALL ensure `.env.local` file contains correct `DATABASE_URL` configuration

### Requirement 2: Define Complete Prisma Schema

**User Story:** As a developer, I want a complete Prisma schema that matches the current database structure, so that I can generate type-safe database access.

#### Acceptance Criteria

1. WHEN the schema is defined, THE System SHALL define all 6 tables as Prisma models: `WikiCategory`, `WikiTerm`, `News`, `Short`, `Instructor`, `User`
2. WHEN each model is defined, THE System SHALL map all columns from existing tables to Prisma fields with correct types
3. WHEN the schema is defined, THE System SHALL properly define primary keys for all models
4. WHEN the schema is defined, THE System SHALL properly define unique constraints (e.g., `Short.url`, `Instructor.slug`, `User.email`)
5. WHEN the schema is defined, THE System SHALL establish foreign key relationships (e.g., `WikiTerm` → `WikiCategory`)
6. WHEN the schema is defined, THE System SHALL create indexes for frequently queried fields: `category`, `slug`, `verificationToken`, `sortOrder`
7. WHEN the schema is defined, THE System SHALL ensure default values match existing database defaults
8. WHEN the schema is complete, THE Prisma_Client SHALL compile without errors

### Requirement 3: Create Prisma-Based Database Layer

**User Story:** As a developer, I want a new database layer using Prisma, so that I can replace the existing `better-sqlite3` implementation.

#### Acceptance Criteria

1. WHEN the migration begins, THE System SHALL create new file `src/lib/db-prisma.ts` with all database functions
2. WHEN the database layer is created, THE System SHALL implement all 30+ functions from `src/lib/db.ts` using Prisma_Client
3. WHEN functions are implemented, THE Database_Layer SHALL maintain identical function signatures for drop-in replacement
4. WHEN functions are implemented, THE Database_Layer SHALL return types matching existing implementation (e.g., `WikiTermRow[]`, `UserRow`)
5. WHEN multi-operation queries are needed, THE Database_Layer SHALL properly handle transactions using Prisma's `$transaction()`
6. WHEN JSON fields are accessed, THE Database_Layer SHALL correctly parse and stringify JSON fields (`performanceVideos`, `techniques`)
7. WHEN database operations fail, THE Database_Layer SHALL implement error handling for all database operations
8. WHEN the application starts, THE Prisma_Client SHALL be properly initialized and reused using singleton pattern, allowing singleton creation before full application initialization

### Requirement 4: Migrate All Database Usage

**User Story:** As a developer, I want all database calls to use Prisma, so that the application uses the new ORM consistently.

#### Acceptance Criteria

1. WHEN the application is updated, THE System SHALL update all imports of `src/lib/db.ts` to `src/lib/db-prisma.ts`
2. WHEN API routes are updated, THE System SHALL ensure all API routes in `src/app/api/` use Prisma-based functions
3. WHEN server components are updated, THE System SHALL ensure all server components using database functions are updated
4. WHEN the migration is complete, THE System SHALL maintain identical functionality to before migration
5. WHEN the application runs, THE System SHALL contain no raw SQL queries in application code (except Prisma schema)
6. WHEN the application runs, THE System SHALL maintain type safety throughout the application

### Requirement 5: Implement Database Seeding

**User Story:** As a developer, I want database seeding to work with Prisma, so that initial data is properly populated.

#### Acceptance Criteria

1. WHEN the project is set up, THE System SHALL create `prisma/seed.ts` file with seeding logic
2. WHEN seeding runs and admin user table is empty, THE System SHALL seed admin user from environment variables
3. WHEN seeding runs, THE System SHALL seed wiki categories with correct data
4. WHEN seeding runs, THE System SHALL seed wiki terms with all 13 default terms, allowing terms to be seeded independently of the main seeding process
5. WHEN seeding is executed, THE System SHALL allow running via `npx prisma db seed`
6. WHEN seeding is run multiple times, THE System SHALL be idempotent (safe to run multiple times without duplication)

### Requirement 6: Update Environment Configuration

**User Story:** As a developer, I want environment variables properly configured, so that Prisma can connect to the database.

#### Acceptance Criteria

1. WHEN the project is initialized, THE System SHALL configure `.env` file with `DATABASE_URL="file:./data/wiki.db"`
2. WHEN the project is initialized, THE System SHALL configure `.env.local` file with `DATABASE_URL="file:./data/wiki.db"`
3. WHEN the database path is configured, THE System SHALL use relative path to project root and maintain this configuration consistently
4. WHEN the application runs, THE System SHALL work in both development and production environments
5. WHEN the application runs, THE System SHALL contain no hardcoded database paths in code

### Requirement 7: Maintain Data Integrity

**User Story:** As a developer, I want to ensure no data is lost during migration, so that the application continues to work correctly.

#### Acceptance Criteria

1. WHEN the migration begins, THE System SHALL preserve existing `data/wiki.db` file and use it with Prisma
2. WHEN the migration is complete, THE System SHALL ensure all existing data remains accessible
3. WHEN the migration is complete, THE System SHALL perform no data transformation or loss, and SHALL strictly prohibit any schema changes - migration SHALL fail if exact match with existing structure is impossible
4. WHEN the migration is complete, THE System SHALL ensure database schema matches existing structure exactly
5. WHEN the migration is complete, THE System SHALL maintain all relationships and constraints

### Requirement 8: Remove Legacy Dependencies

**User Story:** As a developer, I want to clean up the codebase, so that only necessary dependencies are present.

#### Acceptance Criteria

1. WHEN the migration is verified, THE System SHALL remove `better-sqlite3` dependency from `package.json`
2. WHEN the migration is verified, THE System SHALL delete `src/lib/db.ts` file after verification
3. WHEN the migration is verified, THE System SHALL remove all references to `better-sqlite3` from codebase
4. WHEN the migration is verified, THE System SHALL ensure no legacy database code remains
5. WHEN the migration is complete, THE System SHALL build and run without errors

### Requirement 9: Verify Functionality

**User Story:** As a developer, I want to verify that all functionality works correctly, so that the migration is successful.

#### Acceptance Criteria

1. WHEN the application runs, THE System SHALL support all CRUD operations for each table
2. WHEN the application runs, THE System SHALL correctly handle relationships between tables
3. WHEN multi-operation queries execute, THE System SHALL execute transactions atomically
4. WHEN queries execute, THE System SHALL benefit from indexes improving query performance where applicable, allowing queries to execute even when indexes provide no measurable benefit on small datasets or with suboptimal index designs
5. WHEN errors occur, THE System SHALL properly handle edge cases
6. WHEN tests run, THE System SHALL pass all existing tests
7. WHEN the application runs, THE System SHALL produce no console errors or warnings related to database

### Requirement 10: Documentation and Cleanup

**User Story:** As a developer, I want clear documentation, so that future developers understand the database layer.

#### Acceptance Criteria

1. WHEN the migration is complete, THE System SHALL include clear comments in `src/lib/db-prisma.ts` explaining key functions
2. WHEN the migration is complete, THE System SHALL include comments in Prisma schema explaining each model and field
3. WHEN the migration is complete, THE System SHALL update README or documentation with Prisma setup instructions
4. WHEN the migration is complete, THE System SHALL document migration steps for future reference
5. WHEN the migration is complete, THE System SHALL clearly document environment variable requirements

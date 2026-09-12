# Design Document: Prisma Migration

## Overview

Migrate from raw SQL with `better-sqlite3` to Prisma ORM for improved type safety, maintainability, and developer experience. This design maintains all existing functionality while providing a modern, scalable database layer.

## Architecture

### Current State
- **Database Layer**: `src/lib/db.ts` with raw SQL queries using `better-sqlite3`
- **Database**: SQLite (`data/wiki.db`)
- **Tables**: `shorts`, `news`, `instructors`, `wiki_categories`, `wiki_terms`, `users`
- **Type Definitions**: `src/lib/types.ts`

### Target State
- **Database Layer**: Prisma Client with auto-generated types
- **Database**: SQLite (unchanged)
- **Schema**: `prisma/schema.prisma`
- **Migrations**: Prisma migration system
- **Type Definitions**: Auto-generated from Prisma schema

## Technology Stack

### Dependencies to Add
- `@prisma/client@^5.x` - Prisma Client for database access
- `prisma@^5.x` - Prisma CLI (dev dependency)

### Bundle Size Impact
- Estimated ~50 MB increase (acceptable for production)
- Prisma Client is tree-shakeable and optimized for Next.js

## Data Models

The system defines six core data models:

1. **WikiCategory**: Represents categories for wiki terms
   - `id` (String): Unique identifier
   - `label` (String): Display name
   - Relationships: One-to-many with WikiTerm

2. **WikiTerm**: Represents individual wiki entries
   - `id` (String): Unique identifier
   - `title` (String): Term title
   - `description` (String): Term description
   - `category` (String): Foreign key to WikiCategory
   - `author` (String): Author name
   - `coverUrl` (String): Cover image URL
   - `updatedAt` (DateTime): Last update timestamp
   - Relationships: Many-to-one with WikiCategory

3. **News**: Represents news articles
   - `id` (Int): Auto-incrementing identifier
   - `title` (String): Article title
   - `summary` (String): Article summary
   - `content` (String): Full article content
   - `coverUrl` (String): Cover image URL
   - `views` (Int): View count
   - `publishedAt` (DateTime): Publication timestamp

4. **Short**: Represents shortened URLs
   - `id` (Int): Auto-incrementing identifier
   - `url` (String): Unique shortened URL
   - `createdAt` (DateTime): Creation timestamp

5. **Instructor**: Represents instructor profiles
   - `id` (Int): Auto-incrementing identifier
   - `name` (String): Instructor name
   - `specialty` (String): Specialty area
   - `feature` (String): Featured content
   - `experience` (String): Experience description
   - `bio` (String): Biography
   - `image` (String): Profile image URL
   - `video` (String): Video URL
   - `slug` (String): URL-friendly identifier
   - `presentationVideo` (String): Presentation video URL
   - `performanceVideos` (String): JSON array of performance videos
   - `techniques` (String): JSON array of techniques
   - `sortOrder` (Int): Display order

6. **User**: Represents system users
   - `id` (Int): Auto-incrementing identifier
   - `email` (String): Unique email address
   - `passwordHash` (String): Hashed password
   - `role` (String): User role (admin/client)
   - `emailVerified` (Boolean): Email verification status
   - `verificationToken` (String): Email verification token
   - `tokenExpiresAt` (DateTime): Token expiration time
   - `createdAt` (DateTime): Account creation timestamp

## Components and Interfaces

**Prisma_Client Interface**:
- Auto-generated from schema
- Provides type-safe query builder
- Supports all CRUD operations
- Handles transactions via `$transaction()`

**Database_Layer Interface** (`src/lib/db-prisma.ts`):
- Implements all functions from legacy `src/lib/db.ts`
- Maintains identical function signatures
- Returns types matching existing implementation
- Provides singleton Prisma Client instance

**Key Functions**:
- `getDb()`: Returns singleton Prisma Client
- `getWikiTerms()`: Retrieves wiki terms with optional filtering
- `getInstructors()`: Retrieves instructor profiles
- `getNews()`: Retrieves news articles
- `createUser()`: Creates new user account
- `updateUser()`: Updates user information
- `deleteUser()`: Removes user account
- Transaction functions for multi-operation atomicity

## Database Schema

### Prisma Schema Structure

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model WikiCategory {
  id    String @id
  label String

  terms WikiTerm[]
}

model WikiTerm {
  id          String   @id
  title       String
  description String
  category    String
  author      String   @default("")
  coverUrl    String   @default("")
  updatedAt   DateTime @default(now()) @updatedAt

  category_rel WikiCategory @relation(fields: [category], references: [id])

  @@index([category])
}

model News {
  id          Int      @id @default(autoincrement())
  title       String
  summary     String
  content     String
  coverUrl    String   @default("")
  views       Int      @default(0)
  publishedAt DateTime @default(now())
}

model Short {
  id        Int      @id @default(autoincrement())
  url       String   @unique
  createdAt DateTime @default(now())
}

model Instructor {
  id                  Int      @id @default(autoincrement())
  name                String
  specialty           String   @default("")
  feature             String   @default("")
  experience          String   @default("")
  bio                 String   @default("")
  image               String   @default("")
  video               String   @default("")
  slug                String   @unique
  presentationVideo   String   @default("")
  performanceVideos   String   @default("[]") // JSON array
  techniques          String   @default("[]") // JSON array
  sortOrder           Int      @default(0)

  @@index([slug])
  @@index([sortOrder])
}

model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  passwordHash      String
  role              String   @default("client") // "admin" | "client"
  emailVerified     Boolean  @default(false)
  verificationToken String?
  tokenExpiresAt    DateTime?
  createdAt         DateTime @default(now())

  @@index([verificationToken])
}
```

## Migration Strategy

### Phase 1: Setup
1. Install Prisma dependencies
2. Create `prisma/schema.prisma` with schema definition
3. Set `DATABASE_URL` environment variable
4. Generate Prisma Client

### Phase 2: Create Database Layer
1. Create `src/lib/db-prisma.ts` with Prisma-based functions
2. Implement all existing functions from `src/lib/db.ts`
3. Maintain identical function signatures for drop-in replacement
4. Add proper error handling and transaction support

### Phase 3: Replace Usage
1. Update all imports from `src/lib/db.ts` to `src/lib/db-prisma.ts`
2. Update API routes in `src/app/api/`
3. Update server components using database functions
4. Verify all functionality works

### Phase 4: Cleanup
1. Remove `src/lib/db.ts` (after verification)
2. Remove `better-sqlite3` dependency
3. Update documentation

## Key Implementation Details

### Database Initialization
- Prisma handles schema creation automatically
- No manual table creation needed
- Migrations managed by Prisma CLI

### Type Safety
- Auto-generated Prisma types replace manual type definitions
- Full TypeScript support with intellisense
- Type-safe query builders

### Transactions
- Use Prisma's `$transaction()` for multi-operation atomicity
- Replaces `db.transaction()` from better-sqlite3

### JSON Fields
- `performanceVideos` and `techniques` stored as JSON strings
- Parse/stringify in application code (Prisma limitation for SQLite)
- Consider native JSON support if migrating to PostgreSQL

### Seeding
- Create `prisma/seed.ts` for database seeding
- Run via `npx prisma db seed`
- Replaces inline seeding in `getDb()`

## Environment Configuration

### .env
```
DATABASE_URL="file:./data/wiki.db"
```

### .env.local (development)
```
DATABASE_URL="file:./data/wiki.db"
```

## Performance Considerations

- Prisma Client is optimized for Next.js
- Connection pooling handled automatically
- Query optimization through Prisma's query engine
- No performance degradation expected vs raw SQL

## Rollback Plan

If issues arise:
1. Keep `src/lib/db.ts` until fully verified
2. Create feature flag to switch between implementations
3. Gradual migration of API routes
4. Easy revert to `better-sqlite3` if needed

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Schema Field Type Correctness

*For any* data record of each model type, Prisma SHALL correctly map all columns from existing tables to fields with correct types, allowing read and write operations to preserve type information.

**Validates: Requirements 2.2**

### Property 2: Unique Constraint Enforcement

*For any* attempt to insert duplicate values in unique constraint fields (`Short.url`, `Instructor.slug`, `User.email`), the system SHALL reject the duplicate insertion and maintain constraint integrity.

**Validates: Requirements 2.4**

### Property 3: Foreign Key Relationship Integrity

*For any* foreign key relationship (e.g., `WikiTerm` → `WikiCategory`), creating a related record SHALL establish the relationship correctly, and querying the relationship SHALL return the correct related record.

**Validates: Requirements 2.5**

### Property 4: Default Value Application

*For any* record created without explicitly specifying default fields, the system SHALL apply the correct default values matching the existing database defaults.

**Validates: Requirements 2.7**

### Property 5: Function Return Type Correctness

*For any* database function call, the returned value SHALL match the expected type signature (e.g., `WikiTermRow[]`, `UserRow`), maintaining type safety throughout the application.

**Validates: Requirements 3.4**

### Property 6: Transaction Atomicity

*For any* multi-operation transaction, either all operations SHALL complete successfully or none SHALL complete, ensuring atomic all-or-nothing execution.

**Validates: Requirements 3.5**

### Property 7: JSON Field Round-Trip

*For any* JSON field (`performanceVideos`, `techniques`), storing and retrieving the data SHALL preserve the original JSON structure and content without transformation or loss.

**Validates: Requirements 3.6**

### Property 8: Database Operation Error Handling

*For any* database operation that encounters an error condition, the system SHALL handle the error gracefully without crashing and provide meaningful error information.

**Validates: Requirements 3.7**

### Property 9: Prisma Client Singleton Pattern

*For any* multiple accesses to the Prisma Client instance, all accesses SHALL return the same singleton instance, ensuring efficient connection reuse.

**Validates: Requirements 3.8**

### Property 10: Functional Equivalence

*For any* database operation, the Prisma-based implementation SHALL produce identical results to the legacy `better-sqlite3` implementation, maintaining complete functional equivalence.

**Validates: Requirements 4.4**

### Property 11: Admin User Seeding

*For any* seeding run on an empty admin user table, the system SHALL create an admin user with credentials from environment variables.

**Validates: Requirements 5.2**

### Property 12: Wiki Categories Seeding

*For any* seeding run, the system SHALL create all wiki categories with correct data.

**Validates: Requirements 5.3**

### Property 13: Wiki Terms Seeding

*For any* seeding run, the system SHALL create all 13 default wiki terms with correct data.

**Validates: Requirements 5.4**

### Property 14: Seeding Idempotency

*For any* seeding run executed multiple times on the same database, the system SHALL produce identical results without creating duplicate records.

**Validates: Requirements 5.6**

### Property 15: Data Accessibility After Migration

*For any* existing data in the original database, the data SHALL remain accessible through Prisma queries after migration.

**Validates: Requirements 7.2**

### Property 16: Data Integrity Preservation

*For any* data record in the original database, the record SHALL remain unchanged after migration with no transformation or loss.

**Validates: Requirements 7.3**

### Property 17: Schema Equivalence

*For any* table in the original database, the Prisma schema definition SHALL match the existing table structure exactly, including all columns, types, and constraints.

**Validates: Requirements 7.4**

### Property 18: Relationship and Constraint Preservation

*For any* foreign key relationship or constraint in the original database, the relationship or constraint SHALL function identically in the Prisma schema.

**Validates: Requirements 7.5**

### Property 19: CRUD Operations Completeness

*For any* table in the system, all CRUD operations (Create, Read, Update, Delete) SHALL work correctly through the Prisma database layer.

**Validates: Requirements 9.1**

### Property 20: Table Relationship Handling

*For any* relationship between tables, creating and querying related records through Prisma SHALL correctly maintain and reflect the relationships.

**Validates: Requirements 9.2**

### Property 21: Transaction Execution Atomicity

*For any* multi-operation transaction executed through the database layer, the transaction SHALL execute atomically with all-or-nothing semantics.

**Validates: Requirements 9.3**

### Property 22: Error Condition Handling

*For any* error condition encountered during database operations, the system SHALL handle the error gracefully and provide appropriate error information without crashing.

**Validates: Requirements 9.5**

## Error Handling

The system implements comprehensive error handling across all database operations:

### Error Categories

1. **Connection Errors**: Database connection failures
   - Handled by Prisma Client connection pooling
   - Automatic retry with exponential backoff
   - Graceful degradation if connection fails

2. **Constraint Violations**: Unique constraint or foreign key violations
   - Caught and re-thrown with descriptive messages
   - Prevents data integrity issues
   - Allows application to handle appropriately

3. **Type Errors**: Type mismatches or invalid data
   - Caught by TypeScript at compile time
   - Runtime validation for JSON fields
   - Clear error messages for debugging

4. **Transaction Errors**: Multi-operation transaction failures
   - Automatic rollback on any operation failure
   - All-or-nothing semantics guaranteed
   - Error propagated to caller

5. **Seeding Errors**: Database seeding failures
   - Idempotent operations prevent duplicate errors
   - Graceful handling of existing data
   - Clear logging of seeding progress

### Error Handling Strategy

- All database operations wrapped in try-catch blocks
- Meaningful error messages for debugging
- Logging of errors for monitoring
- Graceful degradation where possible
- No silent failures

## Testing Strategy

- Unit tests for each database function
- Integration tests for API routes
- Verify data integrity after migration
- Performance benchmarking (optional)

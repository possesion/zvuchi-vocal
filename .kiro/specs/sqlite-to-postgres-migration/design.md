# Design: SQLite to PostgreSQL Data Migration

## Technical Architecture

### System Overview

The migration system is a **Node.js/TypeScript-based** command-line utility that executes a single, atomic transaction to transfer data from SQLite (`data/wiki.db`) to PostgreSQL (`zvuchi_vocal` database). The system prioritizes data integrity through transaction wrapping, comprehensive validation, and detailed logging.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│              Migration CLI Entry Point                  │
│                 (migration.ts)                          │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────────┐ ┌───▼────────┐ ┌───▼──────────────┐
│   Validation   │ │ Conversion │ │  Transaction     │
│    Engine      │ │   Engine   │ │  Manager         │
└────────────────┘ └────────────┘ └──────────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐ ┌──────▼──────┐ ┌─────▼──────────┐
│   SQLite    │ │ PostgreSQL  │ │   Logging      │
│   Adapter   │ │   Adapter   │ │   Manager      │
└─────────────┘ └─────────────┘ └────────────────┘
```

### Core Components

#### 1. Migration Manager (`migration-manager.ts`)
- Orchestrates the entire migration workflow
- Manages transaction lifecycle (BEGIN → validation → data migration → verification → COMMIT/ROLLBACK)
- Coordinates between SQLite and PostgreSQL adapters
- Handles error state and rollback logic

#### 2. SQLite Adapter (`sqlite-adapter.ts`)
- Manages SQLite source database connection to `data/wiki.db`
- Exports data from each table in chunks (configurable batch size)
- Validates source schema before migration
- Returns structured data objects with metadata

#### 3. PostgreSQL Adapter (`postgres-adapter.ts`)
- Manages PostgreSQL target database connection
- Executes transaction commands (BEGIN, COMMIT, ROLLBACK)
- Executes INSERT statements with parameterized queries
- Handles constraint violations gracefully
- Manages sequence resets and foreign key constraints

#### 4. Conversion Engine (`conversion-engine.ts`)
- Implements type mapping from SQLite to PostgreSQL
- Handles NULL-to-default conversions
- Validates and transforms complex data (JSON, DATETIME, BOOLEAN, enums)
- Returns validation errors with suggested fixes

#### 5. Validation Engine (`validation-engine.ts`)
- Pre-migration schema validation
- Post-migration data integrity checks
- Foreign key relationship validation
- Constraint violation detection

#### 6. Logging Manager (`logging-manager.ts`)
- Creates log file in `migration_logs/{timestamp}.log`
- Formats log entries with timestamp, level, step, and details
- Tracks migration statistics (migrated, skipped, failed)
- Generates final migration report

---

## Data Type Conversion Matrix

### SQLite → PostgreSQL Type Mapping

| SQLite Type | PostgreSQL Type | Conversion Logic | Example |
|-------------|-----------------|------------------|---------|
| **TEXT** | TEXT | Direct copy | `"hello"` → `"hello"` |
| **TEXT** (JSON array) | TEXT | Validate JSON format, default to `'[]'` | `"[]"` → `"[]"` |
| **INTEGER** | INTEGER | Direct copy | `42` → `42` |
| **BOOLEAN** (0 or 1) | BOOLEAN | 0 → false, 1 → true | `1` → `true` |
| **DATETIME** | TIMESTAMP WITH TIME ZONE | Parse ISO format, add UTC timezone | `2024-01-15 14:30:00` → `2024-01-15 14:30:00+00:00` |
| **NULL (text field)** | TEXT | Convert to empty string `''` | `NULL` → `''` |
| **NULL (numeric)** | INTEGER | Convert to `0` | `NULL` → `0` |
| **NULL (BOOLEAN)** | BOOLEAN | Convert to `false` | `NULL` → `false` |
| **NULL (DATETIME)** | TIMESTAMP | Keep as `NULL` | `NULL` → `NULL` |

### Specific Field Conversions

#### WikiCategory
- `id` (TEXT PRIMARY KEY) → `id` (TEXT @id)
- `label` (TEXT) → `label` (TEXT), NULL → `''`

#### WikiTerm
- `id` (TEXT) → `id` (TEXT @id)
- `updatedAt` (DATETIME) → `updatedAt` (DateTime), parse from SQLite format
- `category` (TEXT FK) → validate references WikiCategory.id
- Text fields with NULL → empty string

#### News
- `id` (INTEGER) → `id` (INT @id @default(autoincrement()))
- `views` (INTEGER) → `views` (INT), NULL → `0`
- `publishedAt` (DATETIME) → `publishedAt` (DateTime), parse from SQLite format

#### Short
- `url` (TEXT UNIQUE) → `url` (TEXT @unique), validate format (http://, https://)
- `createdAt` (DATETIME) → `createdAt` (DateTime), parse from SQLite format

#### Instructor
- `performanceVideos` (TEXT JSON) → `performanceVideos` (TEXT), validate JSON array, default to `'[]'`
- `techniques` (TEXT JSON) → `techniques` (TEXT), validate JSON array, default to `'[]'`
- `level` (TEXT) → `level` (MentorLevel enum), validate is `'expert'` or `'master'`, default to `'expert'`
- `slug` (TEXT UNIQUE) → `slug` (TEXT @unique), validate non-empty, check for duplicates
- `sortOrder` (INTEGER) → `sortOrder` (INT), NULL → `0`

#### User
- `phoneVerified` (BOOLEAN 0/1) → `phoneVerified` (BOOLEAN), convert 0/1 to false/true
- `emailVerified` (BOOLEAN 0/1) → `emailVerified` (BOOLEAN), convert 0/1 to false/true
- `email` (TEXT UNIQUE) → `email` (TEXT @unique), validate format (contains @), check for duplicates
- `role` (TEXT) → `role` (String), validate is `'admin'` or `'client'`, default to `'client'`
- `createdAt` (DATETIME) → `createdAt` (DateTime WITH TIMEZONE)
- `phoneCodeExpires` (DATETIME) → `phoneCodeExpires` (DateTime WITH TIMEZONE)
- `tokenExpiresAt` (DATETIME) → `tokenExpiresAt` (DateTime WITH TIMEZONE)
- `resetTokenExpires` (DATETIME) → `resetTokenExpires` (DateTime WITH TIMEZONE)

#### Program
- `packages` (TEXT JSON) → `packages` (TEXT), validate JSON array, default to `'[]'`
- `features` (TEXT JSON) → `features` (TEXT), validate JSON array, default to `'[]'`
- `isPopular` (BOOLEAN 0/1) → `isPopular` (BOOLEAN), convert 0/1 to false/true
- `slug` (TEXT UNIQUE) → `slug` (TEXT @unique), validate non-empty, check for duplicates
- `createdAt` (DATETIME) → `createdAt` (DateTime WITH TIMEZONE)
- `updatedAt` (DATETIME) → `updatedAt` (DateTime WITH TIMEZONE)

---

## Error Handling Strategy

### Error Classification

#### Validation Errors
**Trigger**: Detected during pre-migration validation or data validation steps

**Examples**:
- SQLite table missing
- PostgreSQL connection failed
- Schema mismatch

**Response**: Log error with context, halt migration, rollback if transaction already started

**Log Format**:
```
[ERROR] Validation failed: WikiCategory table missing in SQLite
  Context: Pre-migration schema validation step 1
  Action: Migration halted - no changes to PostgreSQL
  Suggestion: Verify SQLite source database at data/wiki.db is valid and accessible
```

#### Type Conversion Errors
**Trigger**: Data format doesn't match expected type

**Examples**:
- Invalid JSON in `performanceVideos` field
- Invalid email format (no @ symbol)
- Invalid enum value for `level` or `role`

**Response**: 
- If recoverable (default value available): use default and log warning
- If unrecoverable: skip row and log error

**Log Format**:
```
[WARNING] Instructor ID=5: performanceVideos contains invalid JSON: "[unparseable]"
  Action: Defaulting to empty array '[]'
  Value: "[unparseable]"
```

#### Constraint Violation Errors
**Trigger**: Unique constraint violation or foreign key violation

**Examples**:
- Duplicate email in User table
- Duplicate slug in Program table
- WikiTerm.category references non-existent WikiCategory

**Response**: Skip row and log warning with row ID and constraint details

**Log Format**:
```
[WARNING] User ID=10: email 'john@example.com' is duplicate
  Action: Row skipped
  Existing: User ID=8 has same email
```

#### Integrity Errors
**Trigger**: Foreign key or data relationship validation fails

**Examples**:
- WikiTerm references invalid category ID
- Row count mismatch after migration

**Response**: Log error, skip row if pre-migration, mark as PARTIAL_SUCCESS if post-migration

**Log Format**:
```
[ERROR] WikiTerm ID=term_001: category 'invalid_cat' not found in WikiCategory
  Action: Row skipped
  Suggestion: Verify source data or fix category reference
```

### Error Recovery Strategy

```
Try to migrate row
    │
    ├─ Type conversion error (recoverable)?
    │   ├─ Yes → Apply default, log warning, continue
    │   └─ No → Skip row, log error, continue
    │
    ├─ Constraint violation?
    │   ├─ Unique constraint → Skip row, log warning, continue
    │   └─ Foreign key → Skip row, log error, continue
    │
    └─ Critical error?
        ├─ Yes → Rollback entire transaction, halt
        └─ No → Continue to next row
```

### Rollback Triggers

The transaction is rolled back if ANY of these conditions occur:

1. **Pre-migration validation fails**
   - SQLite database not accessible
   - Required table missing
   - PostgreSQL connection fails

2. **Critical type conversion fails**
   - Email validation fails for all User rows
   - JSON parsing fails for core fields without defaults

3. **Transaction execution fails**
   - Database constraint violation that prevents row insertion
   - SQL syntax error
   - Authentication/permission error

4. **Post-migration verification fails**
   - Row count discrepancy exceeds 5% of total
   - Foreign key orphans found after migration
   - Data integrity check failure

---

## SQL Script Design

### Pre-Migration Validation Queries

```sql
-- Check SQLite table exists and has rows
SELECT COUNT(*) FROM sqlite_master 
WHERE type='table' AND name='WikiCategory';

-- Get SQLite row counts for all tables
SELECT 'WikiCategory' as table_name, COUNT(*) as row_count FROM WikiCategory
UNION ALL
SELECT 'WikiTerm', COUNT(*) FROM WikiTerm
UNION ALL
SELECT 'News', COUNT(*) FROM News
UNION ALL
SELECT 'Short', COUNT(*) FROM Short
UNION ALL
SELECT 'Instructor', COUNT(*) FROM Instructor
UNION ALL
SELECT 'User', COUNT(*) FROM User
UNION ALL
SELECT 'Program', COUNT(*) FROM Program;
```

### PostgreSQL Target Preparation

```sql
-- Begin transaction
BEGIN TRANSACTION;

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate all tables in dependency order
TRUNCATE TABLE "WikiTerm";
TRUNCATE TABLE "WikiCategory";
TRUNCATE TABLE "News";
TRUNCATE TABLE "Short";
TRUNCATE TABLE "Instructor";
TRUNCATE TABLE "User";
TRUNCATE TABLE "Program";

-- Reset AUTOINCREMENT sequences
ALTER SEQUENCE "WikiCategory_id_seq" RESTART WITH 1;
ALTER SEQUENCE "News_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Short_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Instructor_id_seq" RESTART WITH 1;
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Program_id_seq" RESTART WITH 1;
```

### Data Insertion (Parameterized Queries)

```sql
-- WikiCategory
INSERT INTO "WikiCategory" (id, label) 
VALUES ($1, $2)
ON CONFLICT (id) DO NOTHING;

-- WikiTerm (with foreign key validation)
INSERT INTO "WikiTerm" (id, title, description, category, author, "coverUrl", "updatedAt") 
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (id) DO NOTHING;

-- News
INSERT INTO "News" (id, title, summary, content, "coverUrl", views, "publishedAt") 
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (id) DO NOTHING;

-- Short
INSERT INTO "Short" (id, url, "createdAt") 
VALUES ($1, $2, $3)
ON CONFLICT (url) DO NOTHING;

-- Instructor
INSERT INTO "Instructor" (id, name, specialty, feature, experience, bio, image, video, slug, "presentationVideo", "performanceVideos", techniques, level, "sortOrder") 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
ON CONFLICT (slug) DO NOTHING;

-- User
INSERT INTO "User" (id, email, "passwordHash", name, phone, "phoneVerified", "phoneVerifyCode", "phoneCodeExpires", role, "emailVerified", "verificationToken", "tokenExpiresAt", "resetToken", "resetTokenExpires", "createdAt") 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (email) DO NOTHING;

-- Program
INSERT INTO "Program" (id, slug, title, "shortDescription", "fullDescription", packages, "lessonDuration", "programDuration", features, "isPopular", "sortOrder", "createdAt", "updatedAt") 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
ON CONFLICT (slug) DO NOTHING;
```

### Post-Migration Verification Queries

```sql
-- Check row counts
SELECT 'WikiCategory' as table_name, COUNT(*) as row_count FROM "WikiCategory"
UNION ALL
SELECT 'WikiTerm', COUNT(*) FROM "WikiTerm"
UNION ALL
SELECT 'News', COUNT(*) FROM "News"
UNION ALL
SELECT 'Short', COUNT(*) FROM "Short"
UNION ALL
SELECT 'Instructor', COUNT(*) FROM "Instructor"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Program', COUNT(*) FROM "Program";

-- Check for foreign key orphans
SELECT COUNT(*) as orphan_count, ARRAY_AGG(t.id) as orphan_ids
FROM "WikiTerm" t 
LEFT JOIN "WikiCategory" c ON t.category = c.id 
WHERE c.id IS NULL;

-- Re-enable foreign key constraints
SET session_replication_role = 'default';

-- Commit transaction
COMMIT;
```

---

## Logging Design

### Log File Structure

**Location**: `migration_logs/sqlite_to_postgres_{YYYY-MM-DD_HH:MM:SS}.log`

**Directory Creation**: Automatically created if not exists

### Log Entry Format

```
[TIMESTAMP] [LEVEL] [STEP] [STATUS] Details
```

**Levels**: INFO, WARNING, ERROR, SUCCESS

**Example Entries**:
```
2024-01-15T14:30:00.123Z [INFO] Pre-migration Validation [IN_PROGRESS] Connecting to SQLite source...
2024-01-15T14:30:00.234Z [INFO] Pre-migration Validation [SUCCESS] WikiCategory: 15 rows
2024-01-15T14:30:00.456Z [WARNING] WikiTerm Migration [SKIPPED] ID=term_001: category 'invalid_cat' not found
2024-01-15T14:30:01.789Z [ERROR] Transaction [ROLLBACK] Foreign key orphans detected (3 rows)
2024-01-15T14:30:02.012Z [INFO] Migration Complete [FINAL_REPORT] 45 rows migrated, 3 rows skipped, 0 errors
```

### Summary Report Format

```
╔════════════════════════════════════════════════════════════════╗
║                    MIGRATION SUMMARY REPORT                    ║
╚════════════════════════════════════════════════════════════════╝

Execution Start:        2024-01-15 14:30:00 UTC
Execution Duration:     2.5 seconds
Overall Status:         SUCCESS / PARTIAL_SUCCESS / FAILED

Table Migration Results:
  WikiCategory:         15 rows migrated ✓
  WikiTerm:             42 rows migrated, 1 skipped (invalid FK)
  News:                 28 rows migrated ✓
  Short:                50 rows migrated, 2 skipped (invalid URL)
  Instructor:           12 rows migrated, 1 skipped (invalid JSON)
  User:                 35 rows migrated, 1 skipped (duplicate email)
  Program:              8 rows migrated ✓

Total:
  ✓ Migrated:           190 rows
  ⚠ Skipped:            5 rows
  ✗ Failed:             0 rows
  
Data Integrity:
  Foreign Key Check:    PASS (0 orphans)
  Row Count Variance:   0.0% (within tolerance)
  
Status:                 ✓ ALL DATA SUCCESSFULLY MIGRATED
Logs:                   migration_logs/sqlite_to_postgres_2024-01-15_14-30-00.log
```

---

## Safety Mechanisms

### Transaction Wrapping

All migration operations execute within a single PostgreSQL transaction:

```typescript
BEGIN TRANSACTION
  ├─ Pre-migration validation
  ├─ Target database preparation (truncate, reset sequences)
  ├─ Data migration (WikiCategory → WikiTerm → News → Short → Instructor → User → Program)
  ├─ Post-migration verification
  │
  ├─ ON ERROR: ROLLBACK (undo all changes)
  │
  └─ ON SUCCESS: COMMIT (persist all changes)
```

**Guarantee**: Either ALL data migrates or ZERO data is changed in PostgreSQL.

### Idempotency Verification

Migration script includes checks to ensure idempotent execution:

1. **Pre-migration state check**: Verify PostgreSQL target tables are either empty or contain previous migration data
2. **Duplicate detection**: Before inserting, check for existing data with same ID/slug
3. **Sequence reset**: Sequences always reset to 1 before migration
4. **Result**: Running migration twice produces identical PostgreSQL state (no duplicate data)

### Rollback Procedures

#### Automatic Rollback
- Triggered by any error during transaction execution
- Executes `ROLLBACK` immediately
- Restores PostgreSQL to pre-migration state

#### Manual Interrupt Rollback
- If process is terminated before `COMMIT`, PostgreSQL driver automatically rolls back open transaction
- No partial state remains

#### Post-Migration Rollback
- If post-migration verification fails (row count mismatch, orphans), transaction is marked for rollback
- `ROLLBACK` executes before log finalization

### Data Integrity Checks

#### Pre-Migration Checks
- SQLite source database exists and is accessible
- All 7 required tables exist with correct schema
- Row counts are logged for comparison

#### During Migration
- Each row insertion is validated for type correctness
- Foreign keys are validated before insertion
- Constraint violations are caught and logged

#### Post-Migration Checks
- PostgreSQL row counts match SQLite row counts (accounting for skipped rows)
- Foreign key relationships are valid (no orphaned WikiTerms)
- Sample data verification (spot-check random rows)
- Sequence values match AUTOINCREMENT ranges

---

## File Structure and Modules

```
src/lib/migration/
├── migration-manager.ts          # Orchestrates migration workflow
├── sqlite-adapter.ts             # SQLite source connection and queries
├── postgres-adapter.ts           # PostgreSQL target connection and queries
├── conversion-engine.ts          # Type conversion and validation logic
├── validation-engine.ts          # Schema and data validation
├── logging-manager.ts            # Log file creation and formatting
├── types.ts                      # TypeScript interfaces for migration data
└── constants.ts                  # SQL queries, error messages, defaults

src/app/api/v1/
└── migration/
    └── route.ts                  # API endpoint for triggering migration

src/scripts/
└── run-migration.ts              # CLI entry point for standalone execution
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Source Data Extraction

*For any* SQLite row in a source table, the extracted data shall preserve all column values without modification or loss, and the row shall be identifiable by its primary key.

**Validates: Requirements 1.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1**

### Property 2: Type Conversion Round-Trip

*For any* SQLite value of a supported type (TEXT, INTEGER, BOOLEAN, DATETIME, JSON), the value shall be converted to PostgreSQL type and converted back to original SQLite type without data loss or type mismatch errors.

**Validates: Requirements 3.2, 5.2, 7.2, 8.2, 9.2**

### Property 3: NULL Value Defaults

*For any* nullable column in a row being migrated, if the SQLite value is NULL, the system shall substitute the appropriate default value (empty string for TEXT, 0 for INTEGER, false for BOOLEAN, or NULL for DATETIME) and successfully insert the row.

**Validates: Requirements 3.4, 4.7, 5.5, 7.12, 8.10, 9.12**

### Property 4: Foreign Key Validation

*For any* WikiTerm row with a category field, if the category value references an existing WikiCategory ID, the row shall migrate successfully; if the category ID does not exist in WikiCategory, the row shall be skipped and logged as a warning.

**Validates: Requirements 4.3, 4.4, 10.9, 10.10**

### Property 5: JSON Array Validation and Default

*For any* JSON field (performanceVideos, techniques, packages, features) containing invalid JSON syntax, the system shall substitute the value with `'[]'` (empty JSON array) and log a warning; if the JSON is valid, the value shall be preserved exactly as stored.

**Validates: Requirements 7.3, 7.4, 7.5, 9.5, 9.6, 9.7, 9.8**

### Property 6: Unique Constraint Enforcement

*For any* unique field (email, slug, url), if a row being migrated contains a value that already exists in PostgreSQL or duplicates within the same migration batch, the row shall be skipped, and the duplicate shall be logged with the conflicting value.

**Validates: Requirements 6.3, 6.7, 7.8, 7.9, 8.3, 8.4, 9.3, 9.4**

### Property 7: Enum Validation and Default

*For any* enum field (User.role, Instructor.level), if the SQLite value is a valid enum value ('admin'/'client' for role, 'expert'/'master' for level), it shall migrate successfully; if invalid or NULL, the value shall default to 'client' or 'expert' respectively, and a warning shall be logged.

**Validates: Requirements 7.6, 7.7, 8.5, 8.6**

### Property 8: BOOLEAN Conversion

*For any* BOOLEAN field in SQLite represented as 0 or 1, the value shall be converted to PostgreSQL BOOLEAN: 0 → false, 1 → true, with no intermediate or incorrect values.

**Validates: Requirements 5.3, 8.7, 9.9**

### Property 9: DATETIME Conversion to UTC

*For any* DATETIME value in SQLite format (YYYY-MM-DD HH:MM:SS), the system shall parse the value as UTC timezone and convert to PostgreSQL TIMESTAMP WITH TIME ZONE format (+00:00 timezone indicator), preserving the date and time components.

**Validates: Requirements 4.5, 5.3, 6.5, 8.8, 9.10**

### Property 10: Row Count Invariant

*For any* successfully migrated table, the row count in PostgreSQL shall equal the row count in SQLite minus the number of rows that were skipped due to validation failures, with no rows duplicated.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8**

### Property 11: Transaction Atomicity

*For any* migration execution, either all rows from all 7 tables are successfully committed to PostgreSQL, OR the transaction is rolled back and PostgreSQL remains in its pre-migration state; no partial or intermediate states are committed.

**Validates: Requirements 11.1, 11.2, 11.5**

### Property 12: Error Handling and Rollback

*For any* fatal error (validation failure, connection failure, critical type conversion error) that occurs during the transaction, the system shall execute ROLLBACK, log the error with full context (step name, error message, suggested fix), and leave PostgreSQL database unchanged.

**Validates: Requirements 11.2, 11.3, 11.4**

### Property 13: Logging Completeness

*For any* migration execution, the system shall create a log file with entries for every step (pre-validation, each table migration, post-verification), each entry shall include timestamp, level (INFO/WARNING/ERROR/SUCCESS), step name, status, and relevant details; the log file shall be readable and contain the final summary report.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

### Property 14: Idempotency

*For any* migration scenario, executing the migration twice shall result in identical PostgreSQL database state as executing it once (no duplicate data, same row counts, same values); the second execution shall either succeed with identical results or fail at pre-migration validation if data already exists.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**

### Property 15: Email Validation and Format

*For any* User row, if the email field contains a value with an @ symbol and valid domain suffix (at least one dot after @), the row shall be considered valid; if the email is empty, lacks @, or lacks domain, the row shall be skipped and logged as invalid.

**Validates: Requirements 8.3, 8.4**

### Property 16: URL Validation for Shorts

*For any* Short row, if the url field contains a non-empty string starting with `http://` or `https://`, the row shall be considered valid and migrate; if the url is empty, NULL, or doesn't start with http(s)://, the row shall be skipped and logged as invalid.

**Validates: Requirements 6.3, 6.4**

---

## Migration Workflow State Diagram

```
START
  │
  ├─ Connect to SQLite
  │   │
  │   ├─ SUCCESS → Continue
  │   └─ ERROR → HALT + ROLLBACK
  │
  ├─ Validate SQLite schema (7 tables)
  │   │
  │   ├─ ALL VALID → Continue
  │   └─ MISSING/INVALID → HALT + ROLLBACK
  │
  ├─ Connect to PostgreSQL
  │   │
  │   ├─ SUCCESS → Continue
  │   └─ ERROR → HALT + ROLLBACK
  │
  ├─ BEGIN TRANSACTION
  │   │
  │   ├─ Prepare PostgreSQL (truncate, reset sequences)
  │   │   │
  │   │   ├─ SUCCESS → Continue
  │   │   └─ ERROR → ROLLBACK + END
  │   │
  │   ├─ Migrate WikiCategory
  │   ├─ Migrate WikiTerm (validate foreign keys)
  │   ├─ Migrate News
  │   ├─ Migrate Short (validate URLs)
  │   ├─ Migrate Instructor (validate JSON, enums)
  │   ├─ Migrate User (validate emails, BOOLEAN)
  │   ├─ Migrate Program (validate slugs, JSON)
  │   │
  │   ├─ Post-migration verification
  │   │   ├─ Check row counts
  │   │   ├─ Check foreign key orphans
  │   │   │
  │   │   ├─ ALL PASS → COMMIT
  │   │   └─ ANY FAIL → ROLLBACK
  │   │
  │   └─ Generate log report
  │
  └─ SUCCESS / PARTIAL_SUCCESS / FAILED
```


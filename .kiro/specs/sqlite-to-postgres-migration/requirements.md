# Requirements: SQLite to PostgreSQL Data Migration

## Introduction

This document specifies the requirements for a one-time data migration from SQLite (data/wiki.db) to PostgreSQL (zvuchi_vocal database). The migration must preserve all data integrity, validate type conversions, and provide transaction-based rollback capabilities. The system performs a complete dump of 7 tables (WikiCategory, WikiTerm, News, Short, Instructor, User, Program) with automatic handling of SQLite-to-PostgreSQL type differences, null value conversions, and JSON array serialization.

## Glossary

- **Migration_System**: The automated system that transfers data from SQLite to PostgreSQL using raw SQL scripts
- **SQLite_Database**: Source database located at `data/wiki.db`
- **PostgreSQL_Database**: Target database `zvuchi_vocal` at `postgres://zvuchi:s1003067@localhost:5433/zvuchi_vocal`
- **Transaction_Block**: A database transaction that executes all migration operations with automatic rollback on error
- **Type_Conversion**: Transformation of SQLite data types to PostgreSQL equivalents (e.g., BOOLEAN to BOOLEAN, TEXT to TEXT)
- **JSON_Array**: SQLite text fields containing JSON array strings (e.g., `"[]"`, `"[{...}]"`) migrated as TEXT to PostgreSQL
- **Null_Validation**: Process to ensure NULL values and defaults are correctly migrated between databases
- **Timestamp_Conversion**: Handling of DATETIME fields (SQLite CURRENT_TIMESTAMP format) to PostgreSQL TIMESTAMP WITH TIME ZONE
- **Data_Integrity_Check**: Validation that row counts, data values, and foreign key relationships match between source and target
- **Rollback_Strategy**: Automatic transaction rollback if any migration step fails, leaving PostgreSQL database unchanged

## Requirements

### Requirement 1: Pre-Migration Validation

**User Story:** As a database administrator, I want to verify the SQLite source database is accessible and contains valid data before migration, so that I can detect issues early.

#### Acceptance Criteria

1. WHEN the Migration_System starts, THE Migration_System SHALL connect to SQLite_Database at `data/wiki.db` and verify file exists
2. WHEN the Migration_System connects to SQLite_Database, THE Migration_System SHALL verify all 7 required tables exist (WikiCategory, WikiTerm, News, Short, Instructor, User, Program)
3. WHEN verifying WikiCategory table, THE Migration_System SHALL verify id (TEXT PRIMARY KEY) and label (TEXT) columns exist
4. WHEN verifying WikiTerm table, THE Migration_System SHALL verify id (TEXT PRIMARY KEY), title (TEXT), description (TEXT), category (TEXT FOREIGN KEY), author (TEXT), coverUrl (TEXT), updatedAt (DATETIME) columns exist
5. WHEN verifying News table, THE Migration_System SHALL verify id (INTEGER PRIMARY KEY AUTOINCREMENT), title (TEXT), summary (TEXT), content (TEXT), coverUrl (TEXT), views (INTEGER), publishedAt (DATETIME) columns exist
6. WHEN verifying Short table, THE Migration_System SHALL verify id (INTEGER PRIMARY KEY AUTOINCREMENT), url (TEXT UNIQUE), createdAt (DATETIME) columns exist
7. WHEN verifying Instructor table, THE Migration_System SHALL verify id (INTEGER PRIMARY KEY AUTOINCREMENT), name (TEXT), specialty (TEXT), feature (TEXT), experience (TEXT), bio (TEXT), image (TEXT), video (TEXT), slug (TEXT UNIQUE), presentationVideo (TEXT), performanceVideos (TEXT JSON), techniques (TEXT JSON), level (TEXT), sortOrder (INTEGER) columns exist
8. WHEN verifying User table, THE Migration_System SHALL verify id (INTEGER PRIMARY KEY AUTOINCREMENT), email (TEXT UNIQUE), passwordHash (TEXT), name (TEXT), phone (TEXT), phoneVerified (BOOLEAN), phoneVerifyCode (TEXT), phoneCodeExpires (DATETIME), role (TEXT), emailVerified (BOOLEAN), verificationToken (TEXT UNIQUE), tokenExpiresAt (DATETIME), resetToken (TEXT UNIQUE), resetTokenExpires (DATETIME), createdAt (DATETIME) columns exist
9. WHEN verifying Program table, THE Migration_System SHALL verify id (INTEGER PRIMARY KEY AUTOINCREMENT), slug (TEXT UNIQUE), title (TEXT), shortDescription (TEXT), fullDescription (TEXT), packages (TEXT JSON), lessonDuration (INTEGER), programDuration (INTEGER), features (TEXT JSON), isPopular (BOOLEAN), sortOrder (INTEGER), createdAt (DATETIME), updatedAt (DATETIME) columns exist
10. IF any table is missing or has incorrect schema, THEN THE Migration_System SHALL log error message and halt migration without modifying PostgreSQL_Database
11. WHEN validation completes successfully, THE Migration_System SHALL log record counts for each table with message "Pre-migration validation passed: {table_name}: {row_count} rows"

### Requirement 2: PostgreSQL Target Database Preparation

**User Story:** As a database administrator, I want to ensure the PostgreSQL target database is clean and ready for data migration, so that I can perform a fresh import.

#### Acceptance Criteria

1. WHEN the Migration_System prepares PostgreSQL_Database, THE Migration_System SHALL connect to PostgreSQL_Database at `postgres://zvuchi:s1003067@localhost:5433/zvuchi_vocal`
2. IF the connection to PostgreSQL_Database fails, THEN THE Migration_System SHALL log connection error and halt migration
3. WHEN the Migration_System connects to PostgreSQL_Database, THE Migration_System SHALL verify all 7 target tables exist with correct schema (matching Prisma schema.prisma definitions)
4. WHEN preparing PostgreSQL_Database, THE Migration_System SHALL disable foreign key constraints temporarily using `SET session_replication_role = 'replica'`
5. WHEN preparing PostgreSQL_Database, THE Migration_System SHALL truncate all 7 tables in order: WikiCategory, WikiTerm, News, Short, Instructor, User, Program
6. WHEN truncating tables, THE Migration_System SHALL reset AUTOINCREMENT sequences using `ALTER SEQUENCE "table_name_id_seq" RESTART WITH 1`
7. IF truncation fails, THEN THE Migration_System SHALL re-enable foreign key constraints and halt migration with error message

### Requirement 3: WikiCategory Table Migration

**User Story:** As a database administrator, I want to migrate wiki categories from SQLite to PostgreSQL, so that the wiki categorization system is available in the production database.

#### Acceptance Criteria

1. WHEN migrating WikiCategory table, THE Migration_System SHALL read all rows from SQLite WikiCategory table ordered by id
2. WHEN reading each WikiCategory row, THE Migration_System SHALL extract id (TEXT) and label (TEXT) values exactly as stored in SQLite
3. WHEN inserting WikiCategory rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "WikiCategory" (id, label) VALUES ($1, $2)` for each row
4. WHEN inserting WikiCategory rows, THE Migration_System SHALL handle NULL label values by converting to empty string `''` if NULL encountered
5. IF unique constraint violation occurs (duplicate id), THEN THE Migration_System SHALL log error with row data and continue migration with transaction marked for rollback

### Requirement 4: WikiTerm Table Migration with Data Validation

**User Story:** As a database administrator, I want to migrate wiki terms with validation of category relationships, so that wiki entries are complete and referentially valid.

#### Acceptance Criteria

1. WHEN migrating WikiTerm table, THE Migration_System SHALL read all rows from SQLite WikiTerm table ordered by id
2. WHEN reading each WikiTerm row, THE Migration_System SHALL extract id (TEXT), title (TEXT), description (TEXT), category (TEXT foreign key), author (TEXT), coverUrl (TEXT), updatedAt (DATETIME) values
3. WHEN migrating WikiTerm rows, THE Migration_System SHALL validate that category field references an existing WikiCategory id in the migrated data
4. IF category reference is invalid (category id not found in WikiCategory), THEN THE Migration_System SHALL log warning with row id and category value, then skip the row and continue
5. WHEN migrating WikiTerm rows with valid category, THE Migration_System SHALL convert SQLite DATETIME format to PostgreSQL TIMESTAMP format (SQLite CURRENT_TIMESTAMP is UTC)
6. WHEN inserting WikiTerm rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "WikiTerm" (id, title, description, category, author, "coverUrl", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`
7. WHEN inserting WikiTerm, THE Migration_System SHALL convert NULL author to empty string `''` and NULL coverUrl to empty string `''`
8. WHEN insertion completes, THE Migration_System SHALL log row count: "WikiTerm: {inserted} rows migrated, {skipped} rows skipped (invalid category)"

### Requirement 5: News Table Migration

**User Story:** As a database administrator, I want to migrate news articles with view count preservation, so that analytics data is maintained.

#### Acceptance Criteria

1. WHEN migrating News table, THE Migration_System SHALL read all rows from SQLite News table ordered by id
2. WHEN reading each News row, THE Migration_System SHALL extract id (INTEGER), title (TEXT), summary (TEXT), content (TEXT), coverUrl (TEXT), views (INTEGER), publishedAt (DATETIME) values
3. WHEN migrating News rows, THE Migration_System SHALL convert SQLite DATETIME (format: YYYY-MM-DD HH:MM:SS) to PostgreSQL TIMESTAMP
4. WHEN inserting News rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "News" (id, title, summary, content, "coverUrl", views, "publishedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`
5. WHEN inserting News, THE Migration_System SHALL convert NULL views to 0 and NULL coverUrl to empty string `''`
6. WHEN insertion completes, THE Migration_System SHALL log row count: "News: {count} rows migrated"

### Requirement 6: Short Table Migration

**User Story:** As a database administrator, I want to migrate shortened URL mappings, so that video short links remain functional.

#### Acceptance Criteria

1. WHEN migrating Short table, THE Migration_System SHALL read all rows from SQLite Short table ordered by id
2. WHEN reading each Short row, THE Migration_System SHALL extract id (INTEGER), url (TEXT UNIQUE), createdAt (DATETIME) values
3. WHEN migrating Short rows, THE Migration_System SHALL validate that url field contains a valid URL string (non-empty, starts with http:// or https://)
4. IF url field is empty or invalid, THEN THE Migration_System SHALL log error with row id, skip the row, and continue
5. WHEN migrating Short rows, THE Migration_System SHALL convert SQLite DATETIME to PostgreSQL TIMESTAMP
6. WHEN inserting Short rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "Short" (id, url, "createdAt") VALUES ($1, $2, $3)`
7. IF UNIQUE constraint violation occurs (duplicate url), THEN THE Migration_System SHALL log warning with url value, skip the row, and continue
8. WHEN insertion completes, THE Migration_System SHALL log row count: "Short: {inserted} rows migrated, {skipped} rows skipped (invalid/duplicate)"

### Requirement 7: Instructor Table Migration with JSON Field Handling

**User Story:** As a database administrator, I want to migrate instructor profiles with JSON array preservation, so that instructor data and associated techniques/videos are maintained.

#### Acceptance Criteria

1. WHEN migrating Instructor table, THE Migration_System SHALL read all rows from SQLite Instructor table ordered by id
2. WHEN reading each Instructor row, THE Migration_System SHALL extract all 15 columns: id, name, specialty, feature, experience, bio, image, video, slug, presentationVideo, performanceVideos (JSON), techniques (JSON), level, sortOrder, and implicitly createdAt (derived from row)
3. WHEN migrating Instructor rows, THE Migration_System SHALL validate that performanceVideos field contains valid JSON array format (e.g., `[]` or `[{"url":"..."}]`)
4. WHEN migrating Instructor rows, THE Migration_System SHALL validate that techniques field contains valid JSON array format
5. IF performanceVideos or techniques contain invalid JSON, THEN THE Migration_System SHALL default to `'[]'` (empty JSON array) and log warning with row id
6. WHEN migrating Instructor rows, THE Migration_System SHALL validate that level field contains enum value: `'expert'` or `'master'`
7. IF level field is NULL or invalid, THEN THE Migration_System SHALL default to `'expert'` and log warning with row id
8. WHEN migrating Instructor rows, THE Migration_System SHALL validate that slug field is unique and non-empty
9. IF slug is empty or NULL, THEN THE Migration_System SHALL log error with row id and skip the row
10. IF slug is duplicate, THEN THE Migration_System SHALL log error with row id and skip the row
11. WHEN inserting Instructor rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "Instructor" (id, name, specialty, feature, experience, bio, image, video, slug, "presentationVideo", "performanceVideos", techniques, level, "sortOrder") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
12. WHEN inserting Instructor, THE Migration_System SHALL convert NULL values for text fields to empty string `''` and NULL numeric fields to 0
13. WHEN insertion completes, THE Migration_System SHALL log row count: "Instructor: {inserted} rows migrated, {skipped} rows skipped (invalid JSON/slug)"

### Requirement 8: User Table Migration with Email and Phone Verification

**User Story:** As a database administrator, I want to migrate user accounts with email verification and phone verification data, so that authentication state is preserved.

#### Acceptance Criteria

1. WHEN migrating User table, THE Migration_System SHALL read all rows from SQLite User table ordered by id
2. WHEN reading each User row, THE Migration_System SHALL extract id, email, passwordHash, name, phone, phoneVerified, phoneVerifyCode, phoneCodeExpires, role, emailVerified, verificationToken, tokenExpiresAt, resetToken, resetTokenExpires, createdAt values
3. WHEN migrating User rows, THE Migration_System SHALL validate that email field is unique and contains valid email format (contains @ symbol and domain)
4. IF email is empty, invalid, or duplicate, THEN THE Migration_System SHALL log error with row id and skip the row
5. WHEN migrating User rows, THE Migration_System SHALL validate that role field contains enum value: `'admin'` or `'client'`
6. IF role is NULL or invalid, THEN THE Migration_System SHALL default to `'client'` and log warning with row id
7. WHEN migrating User rows, THE Migration_System SHALL convert SQLite BOOLEAN values (0 or 1) to PostgreSQL BOOLEAN (false or true)
8. WHEN migrating User rows, THE Migration_System SHALL convert SQLite DATETIME to PostgreSQL TIMESTAMP FOR timezone-aware columns (tokenExpiresAt, phoneCodeExpires, resetTokenExpires, createdAt)
9. WHEN inserting User rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "User" (id, email, "passwordHash", name, phone, "phoneVerified", "phoneVerifyCode", "phoneCodeExpires", role, "emailVerified", "verificationToken", "tokenExpiresAt", "resetToken", "resetTokenExpires", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`
10. WHEN inserting User, THE Migration_System SHALL convert NULL values to appropriate defaults: NULL text fields to empty string, NULL DATETIME to NULL, NULL BOOLEAN to false
11. WHEN insertion completes, THE Migration_System SHALL log row count: "User: {inserted} rows migrated, {skipped} rows skipped (invalid email/duplicate)"

### Requirement 9: Program Table Migration with JSON Package Data

**User Story:** As a database administrator, I want to migrate subscription programs with pricing and feature data, so that the catalog system remains intact.

#### Acceptance Criteria

1. WHEN migrating Program table, THE Migration_System SHALL read all rows from SQLite Program table ordered by id
2. WHEN reading each Program row, THE Migration_System SHALL extract id, slug, title, shortDescription, fullDescription, packages (JSON), lessonDuration, programDuration, features (JSON), isPopular, sortOrder, createdAt, updatedAt values
3. WHEN migrating Program rows, THE Migration_System SHALL validate that slug field is unique and non-empty
4. IF slug is empty, NULL, or duplicate, THEN THE Migration_System SHALL log error with row id and skip the row
5. WHEN migrating Program rows, THE Migration_System SHALL validate that packages field contains valid JSON array format (e.g., `[]` or `[{"lessons_count":10,"price":99}]`)
6. IF packages contain invalid JSON, THEN THE Migration_System SHALL default to `'[]'` and log warning with row id
7. WHEN migrating Program rows, THE Migration_System SHALL validate that features field contains valid JSON array format
8. IF features contain invalid JSON, THEN THE Migration_System SHALL default to `'[]'` and log warning with row id
9. WHEN migrating Program rows, THE Migration_System SHALL convert SQLite BOOLEAN isPopular (0 or 1) to PostgreSQL BOOLEAN (false or true)
10. WHEN migrating Program rows, THE Migration_System SHALL convert SQLite DATETIME to PostgreSQL TIMESTAMP for createdAt and updatedAt
11. WHEN inserting Program rows to PostgreSQL, THE Migration_System SHALL execute: `INSERT INTO "Program" (id, slug, title, "shortDescription", "fullDescription", packages, "lessonDuration", "programDuration", features, "isPopular", "sortOrder", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
12. WHEN inserting Program, THE Migration_System SHALL convert NULL values: NULL text fields to empty string, NULL DATETIME to current_timestamp, NULL numeric fields to 0, NULL BOOLEAN to false
13. WHEN insertion completes, THE Migration_System SHALL log row count: "Program: {inserted} rows migrated, {skipped} rows skipped (invalid slug/JSON)"

### Requirement 10: Post-Migration Data Integrity Verification

**User Story:** As a database administrator, I want to verify that all data was migrated correctly with matching row counts and referential integrity, so that I can confirm migration success.

#### Acceptance Criteria

1. AFTER all tables are migrated, THE Migration_System SHALL verify row counts match between SQLite and PostgreSQL for each table
2. WHEN verifying WikiCategory, THE Migration_System SHALL check `SELECT COUNT(*) FROM "WikiCategory"` equals SQLite row count
3. WHEN verifying WikiTerm, THE Migration_System SHALL check `SELECT COUNT(*) FROM "WikiTerm"` equals SQLite row count minus any skipped rows due to invalid foreign keys
4. WHEN verifying News, THE Migration_System SHALL check `SELECT COUNT(*) FROM "News"` equals SQLite row count
5. WHEN verifying Short, THE Migration_System SHALL check `SELECT COUNT(*) FROM "Short"` equals SQLite row count minus any skipped rows due to invalid URLs or duplicate unique constraints
6. WHEN verifying Instructor, THE Migration_System SHALL check `SELECT COUNT(*) FROM "Instructor"` equals SQLite row count minus any skipped rows due to invalid JSON or slug
7. WHEN verifying User, THE Migration_System SHALL check `SELECT COUNT(*) FROM "User"` equals SQLite row count minus any skipped rows due to invalid email or duplicate
8. WHEN verifying Program, THE Migration_System SHALL check `SELECT COUNT(*) FROM "Program"` equals SQLite row count minus any skipped rows due to invalid slug or JSON
9. WHEN verifying foreign key constraints, THE Migration_System SHALL verify all WikiTerm.category values reference valid WikiCategory.id values using: `SELECT COUNT(*) FROM "WikiTerm" t LEFT JOIN "WikiCategory" c ON t.category = c.id WHERE c.id IS NULL`
10. IF any foreign key orphans are found, THEN THE Migration_System SHALL log warning with orphan count and affected WikiTerm ids
11. WHEN verification completes, THE Migration_System SHALL log summary: "Data Integrity: {total_rows} rows migrated, {skipped_rows} rows skipped, {orphan_count} orphan references found"
12. IF row count discrepancies exceed 5% of total migrated rows, THEN THE Migration_System SHALL mark migration as PARTIAL_SUCCESS with warnings

### Requirement 11: Transaction-Based Execution and Rollback

**User Story:** As a database administrator, I want all migration operations to execute within a single transaction with automatic rollback on error, so that the database remains consistent.

#### Acceptance Criteria

1. WHEN the Migration_System begins migration, THE Migration_System SHALL wrap all operations in a single PostgreSQL transaction: `BEGIN TRANSACTION`
2. WHEN any step fails (validation, data conversion, insertion), THE Migration_System SHALL execute `ROLLBACK` to undo all changes and leave PostgreSQL_Database unchanged
3. WHEN any step fails, THE Migration_System SHALL log detailed error message including: step name, error code, affected row (if applicable), attempted operation, and suggested fix
4. WHEN transaction is rolled back, THE Migration_System SHALL re-enable foreign key constraints using `SET session_replication_role = 'default'`
5. WHEN all migration steps complete successfully, THE Migration_System SHALL execute `COMMIT` to persist all changes
6. WHEN transaction commits, THE Migration_System SHALL log confirmation: "Migration committed successfully at {timestamp}"

### Requirement 12: Migration Logging and Reporting

**User Story:** As a database administrator, I want detailed logs of all migration operations, so that I can audit the migration and troubleshoot issues.

#### Acceptance Criteria

1. WHEN the Migration_System executes, THE Migration_System SHALL create log file at: `migration_logs/sqlite_to_postgres_{YYYY-MM-DD_HH:MM:SS}.log`
2. WHEN each migration step executes, THE Migration_System SHALL log: timestamp, step name, status (IN_PROGRESS/SUCCESS/ERROR/SKIPPED), row count, and any relevant details
3. WHEN data validation occurs, THE Migration_System SHALL log: validation rule, rows checked, rows passed, rows failed
4. WHEN errors occur, THE Migration_System SHALL log: error type, error message, row id (if applicable), offending value, and recommended action
5. WHEN migration completes, THE Migration_System SHALL log final report including: total execution time, total rows migrated, total rows skipped, any warnings or errors encountered, and status (SUCCESS/PARTIAL_SUCCESS/FAILED)
6. WHEN generating report, THE Migration_System SHALL produce human-readable summary: "Migration Report: {total_tables} tables, {total_rows_migrated} rows migrated, {total_rows_skipped} rows skipped, {total_errors} errors, Execution time: {duration}s"

### Requirement 13: Migration Idempotency and Safety

**User Story:** As a database administrator, I want to ensure the migration can be safely re-run or stopped without leaving the database in an inconsistent state.

#### Acceptance Criteria

1. THE Migration_System SHALL be idempotent: running the same migration twice shall result in identical PostgreSQL_Database state (no duplicate data)
2. WHEN migration is interrupted, THE Migration_System SHALL automatically rollback uncommitted transaction, leaving PostgreSQL_Database in pre-migration state
3. WHEN migration is interrupted before step 3 (PostgreSQL target preparation), THE Migration_System SHALL not modify PostgreSQL_Database
4. WHEN migration is interrupted during data migration phases (steps 3-9), THE Migration_System SHALL rollback all changes using `ROLLBACK`
5. THE Migration_System SHALL NOT allow partial commits or incremental updates; all-or-nothing execution only
6. WHEN rerunning migration after failure, THE Migration_System SHALL skip pre-migration validation if explicitly overridden by administrator flag `--skip-validation`

## Success Criteria

- [ ] All 7 tables migrate with 100% data accuracy (row counts match after accounting for skipped rows)
- [ ] Foreign key constraints (WikiTerm → WikiCategory) are validated and maintained
- [ ] JSON arrays in performanceVideos, techniques, packages, and features fields are preserved as valid JSON
- [ ] SQLite DATETIME values (CURRENT_TIMESTAMP format) are correctly converted to PostgreSQL TIMESTAMP
- [ ] BOOLEAN values (SQLite 0/1) are correctly converted to PostgreSQL BOOLEAN (false/true)
- [ ] Email uniqueness constraints are validated; duplicate emails cause rows to be skipped
- [ ] All enum fields (User.role, Instructor.level) contain only valid enum values
- [ ] NULL value handling preserves intended defaults (empty strings for text fields, 0 for integers, false for booleans)
- [ ] Transaction executes atomically: either all data migrates successfully or entire operation rolls back
- [ ] Detailed migration log is generated documenting all steps, validation results, and any errors
- [ ] Migration is idempotent: re-running produces identical results with no duplicate data
- [ ] Migration completes with documented status: SUCCESS, PARTIAL_SUCCESS (with detailed warnings), or FAILED (with rollback)

## Rollback Strategy

- **Automatic Rollback**: If any step fails during transaction execution, `ROLLBACK` is executed immediately
- **Manual Rollback**: Administrator can cancel migration before COMMIT, triggering automatic rollback
- **No Partial State**: Migration either completes fully (COMMIT) or reverts fully (ROLLBACK); no intermediate states
- **Verification**: Post-migration data integrity check confirms rollback effectiveness if required

# Implementation Plan: SQLite to PostgreSQL Data Migration

## Overview

This implementation plan breaks down the migration system into discrete, sequenced coding tasks. The system will be built in TypeScript using Node.js and executed as a CLI utility within the Next.js project. All tasks follow the modular architecture defined in the design document.

**Language**: TypeScript (Next.js 14 project)

**Key Implementation Phases**:
1. Core type definitions and constants
2. Adapter implementations (SQLite, PostgreSQL)
3. Engine implementations (validation, conversion, logging)
4. Migration orchestrator
5. CLI and API integrations
6. Documentation

---

## Tasks

- [ ] 1. Set up migration module structure and core types
  - Create `/src/lib/migration/` directory structure
  - Define core TypeScript interfaces: `MigrationRow`, `MigrationContext`, `MigrationError`, `ValidationResult`, `ConversionResult`
  - Define data shape interfaces for each table: `WikiCategoryRow`, `WikiTermRow`, `NewsRow`, `ShortRow`, `InstructorRow`, `UserRow`, `ProgramRow`
  - Define configuration interface: `MigrationConfig` (batch size, timeout, log directory)
  - Export all types from `types.ts`
  - _Requirements: 1.1, 2.1, 12.1_

- [ ] 2. Implement SQLite Adapter (source database connection)
  - Create `/src/lib/migration/sqlite-adapter.ts`
  - Implement `SqliteAdapter` class with connection management
  - Implement `connectToSource()` method using `sqlite` package
  - Implement `validateSourceSchema()` method that checks all 7 tables exist with correct column names
  - Implement `getTableRowCount()` method to retrieve row counts for all tables
  - Implement `getAllRows<T>(tableName)` method to read all rows from a table
  - Implement `getRowsByChunks(tableName, chunkSize)` generator for memory-efficient reading
  - Implement `closeConnection()` method
  - Log all operations using provided logger
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 3. Implement PostgreSQL Adapter (target database connection)
  - Create `/src/lib/migration/postgres-adapter.ts`
  - Implement `PostgresAdapter` class with connection management using `@prisma/adapter-pg` and `pg`
  - Implement `connectToTarget()` method to `postgres://zvuchi:s1003067@localhost:5433/zvuchi_vocal`
  - Implement `verifyTargetSchema()` method that checks all 7 tables exist
  - Implement `beginTransaction()` method to execute `BEGIN TRANSACTION`
  - Implement `disableForeignKeys()` method to execute `SET session_replication_role = 'replica'`
  - Implement `truncateAllTables()` method to truncate tables in dependency order
  - Implement `resetSequences()` method to reset AUTOINCREMENT sequences
  - Implement `enableForeignKeys()` method to execute `SET session_replication_role = 'default'`
  - Implement `commitTransaction()` method to execute `COMMIT`
  - Implement `rollbackTransaction()` method to execute `ROLLBACK`
  - Implement `insertRow<T>(table, values)` parameterized query execution
  - Implement `checkRowCount(table)` to verify row counts
  - Implement `checkForeignKeyOrphans()` to detect orphaned WikiTerm rows
  - Implement `closeConnection()` method
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 11.1, 11.4_

- [ ] 4. Implement Validation Engine
  - Create `/src/lib/migration/validation-engine.ts`
  - Implement `ValidationEngine` class
  - Implement `validateWikiCategoryRow(row)` - check id and label exist
  - Implement `validateWikiTermRow(row)` - check all required fields, validate category FK later
  - Implement `validateNewsRow(row)` - check all required fields
  - Implement `validateShortRow(row)` - validate URL format (http(s)://)
  - Implement `validateInstructorRow(row)` - validate JSON fields, level enum, slug uniqueness
  - Implement `validateUserRow(row)` - validate email format (contains @), role enum, BOOLEAN fields
  - Implement `validateProgramRow(row)` - validate slug uniqueness, JSON fields
  - Implement `validateForeignKey(value, referencedTable)` method for WikiTerm → WikiCategory validation
  - Implement `validateEmailFormat(email)` method (check for @ and domain)
  - Implement `validateUrlFormat(url)` method (check for http:// or https://)
  - Implement `validateJsonArray(jsonStr)` method (parse and validate array format)
  - Implement `validateEnum(value, allowedValues)` method
  - Return structured `ValidationResult` with `isValid`, `errors`, and `warnings`
  - _Requirements: 1.1, 4.3, 6.3, 6.4, 7.3, 8.3, 9.3_

- [ ] 5. Implement Conversion Engine
  - Create `/src/lib/migration/conversion-engine.ts`
  - Implement `ConversionEngine` class with type mapping logic
  - Implement `convertSqliteValue(value, targetType)` dispatcher method
  - Implement `convertTextValue(value)` - NULL → '' (empty string)
  - Implement `convertIntegerValue(value)` - NULL → 0
  - Implement `convertBooleanValue(value)` - SQLite 0/1 → PostgreSQL false/true, NULL → false
  - Implement `convertDateTimeValue(value)` - Parse SQLite DATETIME to UTC ISO format with timezone
  - Implement `convertJsonArrayValue(jsonStr)` - Validate and sanitize JSON, default to '[]' on error
  - Implement `convertNullToDefault(value, fieldType)` comprehensive NULL handling
  - Implement `WikiCategoryRowConverter` - convert all fields for WikiCategory table
  - Implement `WikiTermRowConverter` - convert all fields, handle category FK
  - Implement `NewsRowConverter` - convert all fields, handle views NULL → 0
  - Implement `ShortRowConverter` - convert all fields
  - Implement `InstructorRowConverter` - convert JSON fields, level enum, handle defaults
  - Implement `UserRowConverter` - convert BOOLEAN fields, datetime fields, role enum
  - Implement `ProgramRowConverter` - convert JSON fields, BOOLEAN, datetime, slug validation
  - Return structured `ConversionResult` with `convertedData`, `errors`, `warnings`
  - _Requirements: 3.2, 3.4, 4.5, 5.3, 5.5, 6.5, 7.2, 7.5, 7.7, 7.12, 8.2, 8.7, 8.8, 8.10, 9.2, 9.9, 9.10, 9.12_

- [ ] 6. Implement Logging Manager
  - Create `/src/lib/migration/logging-manager.ts`
  - Implement `LoggingManager` class with file creation and formatting
  - Implement `createLogFile()` method - create `migration_logs/sqlite_to_postgres_{timestamp}.log` directory
  - Implement `log(level, step, status, details)` method with timestamp and formatting
  - Implement `logInfo(step, message)` - log INFO level
  - Implement `logWarning(step, message)` - log WARNING level
  - Implement `logError(step, message, context?)` - log ERROR level with optional context
  - Implement `logValidationResult(table, result)` - log validation successes/failures
  - Implement `logInsertionResult(table, inserted, skipped, errors)` - log row migration results
  - Implement `generateSummaryReport(stats)` - generate formatted migration report with tables
  - Implement `formatReportEntry(tableName, migrated, skipped, status)` method
  - Implement `formatFinalReport(stats)` - generate final summary with execution time, totals
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 7. Implement Migration Orchestrator (main coordination engine)
  - Create `/src/lib/migration/migration-manager.ts`
  - Implement `MigrationManager` class that coordinates all components
  - Implement `execute()` async method - orchestrates entire migration workflow
  - Implement `validateSourceDatabase()` - use SQLite adapter to validate schema
  - Implement `prepareTargetDatabase()` - use PostgreSQL adapter for truncation and sequence reset
  - Implement `migrateTable<T>(tableName, tableSchema)` generic method to migrate a single table
  - Implement table-specific migration methods: `migrateWikiCategory()`, `migrateWikiTerm()`, `migrateNews()`, `migrateShort()`, `migrateInstructor()`, `migrateUser()`, `migrateProgram()`
  - Implement `verifyDataIntegrity()` - check row counts, foreign keys, data consistency
  - Implement `handleError(error)` - trigger rollback, log error details
  - Implement transaction wrapper: BEGIN → operations → COMMIT/ROLLBACK
  - Implement `getExecutionStats()` - return migration statistics (migrated, skipped, errors)
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 11.2, 11.3_

- [ ] 8. Create database migration script (combines all modules)
  - Create `/src/scripts/run-migration.ts`
  - Import and compose all modules (SQLite, PostgreSQL, validation, conversion, logging, orchestrator)
  - Implement `main()` async function
  - Initialize managers: SQLiteAdapter, PostgresAdapter, ValidationEngine, ConversionEngine, LoggingManager, MigrationManager
  - Pass configuration (batch size, timeout, log directory)
  - Execute migration via MigrationManager
  - Handle errors and display final status
  - Exit with appropriate code (0 for success, 1 for failure)
  - _Requirements: 1.1, 2.1, 11.1, 12.1_

- [ ] 9. Create API endpoint to trigger migration (optional REST interface)
  - Create `/src/app/api/v1/migration/route.ts`
  - Implement `POST /api/v1/migration` endpoint
  - Check admin authentication (require session with admin role)
  - Validate request body (accept optional `--skip-validation` flag)
  - Instantiate MigrationManager with configuration
  - Execute migration asynchronously
  - Return status JSON with: status (SUCCESS/PARTIAL_SUCCESS/FAILED), message, stats, logFile path
  - Handle errors gracefully with appropriate HTTP status codes
  - _Requirements: 2.1, 11.1, 12.1_

- [ ] 10. Create CLI runner for standalone execution
  - Update `package.json` scripts to add: `"migration": "tsx src/scripts/run-migration.ts"`
  - Create documentation: `/src/lib/migration/MIGRATION_GUIDE.md`
  - Document CLI command: `npm run migration`
  - Document environment variables required: DATABASE_URL (PostgreSQL), SQLite path
  - Document output: log file location, final status, troubleshooting steps
  - Provide example invocation and expected output
  - _Requirements: 1.1, 2.1, 12.1, 12.2_

- [ ] 11. Create comprehensive migration documentation
  - Create `/src/lib/migration/ARCHITECTURE.md` - document design patterns and module interactions
  - Create `/src/lib/migration/ERROR_HANDLING.md` - document all error types, recovery strategies, rollback procedures
  - Create `/src/lib/migration/DATA_TYPES.md` - document SQLite-to-PostgreSQL type mapping with examples
  - Document in main `MIGRATION_GUIDE.md`: pre-requisites, setup, execution, verification, rollback procedures
  - Include example log output and troubleshooting section
  - _Requirements: 1.1, 11.1, 12.1_

## Notes

- All tasks are core implementation tasks that must be completed
- Tasks build sequentially, with dependencies managed through the Task Dependency Graph
- TypeScript strict mode enforces type safety throughout
- All async operations include proper error handling with try-catch
- Transaction safety is guaranteed by wrapping all operations in BEGIN → COMMIT/ROLLBACK
- Migration is idempotent: running twice produces identical results
- Logging provides complete audit trail for troubleshooting

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2", "3"] },
    { "id": 2, "tasks": ["4", "5", "6"] },
    { "id": 3, "tasks": ["7"] },
    { "id": 4, "tasks": ["8"] },
    { "id": 5, "tasks": ["9", "10"] },
    { "id": 6, "tasks": ["11"] }
  ]
}
```

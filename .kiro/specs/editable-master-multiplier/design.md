# Design Document: Editable Master Multiplier

## Introduction

This design describes the architecture for adding a per-program configurable master multiplier to the Vocal School platform. The current global constant `LevelMultipliers.master = 1.3` is replaced with a per-program field that flows from the database through server actions, forms, and ultimately into the pricing calculator utilities. The expert level remains fixed at `1.0`.

## Architecture Overview

The feature follows the existing vertical data flow pattern in the application:

```
Prisma Schema (DB column)
  → db-prisma.ts (read/write layer)
    → Program type (src/lib/types.ts)
      → Server Actions (create/update)
        → Forms (add/edit) ←→ Validation Schema (ProgramSchema)
      → Page (server component)
        → ProgramPricingClient (client component)
          → Pricing Utilities (getAdjustedPrice, pricePerLesson)
```

No new packages or dependencies are introduced.

---

## Database Changes

### Prisma Schema Update

Add `masterMultiplier` column to the `Program` model:

```prisma
model Program {
  id               Int      @id @default(autoincrement())
  slug             String   @unique
  title            String
  shortDescription String
  fullDescription  String
  packages         String   @default("[]")
  lessonDuration   Int      @default(55)
  programDuration  Int
  features         String   @default("[]")
  isPopular        Boolean  @default(false)
  sortOrder        Int      @default(0)
  masterMultiplier Float    @default(1.3)  // NEW
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([slug])
  @@index([sortOrder])
}
```

### Migration

The migration adds the column with a default, so existing records automatically receive `1.3`:

```sql
ALTER TABLE "Program" ADD COLUMN "masterMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.3;
```

---

## Type System Updates

### `src/lib/types.ts` — Program Interface

```typescript
export interface Program {
  id: number
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  packages: Package[]
  lessonDuration: number
  programDuration: number
  features: string[]
  isPopular: boolean
  sortOrder: number
  masterMultiplier: number  // NEW
  createdAt: string
  updatedAt: string
}
```

### `src/lib/definitions.ts` — ProgramSchema & ProgramForm

```typescript
export const ProgramSchema = yup.object({
  title: yup.string().required('Введите название').trim(),
  short_description: yup.string().required('Введите краткое описание').trim(),
  full_description: yup.string().required('Введите полное описание').trim(),
  packages: yup.array().of(
    yup.object({
      lessons_count: yup.number().positive().required(),
      price: yup.number().positive().required(),
    })
  ).min(1, 'Добавьте хотя бы один пакет').required(),
  lesson_duration: yup.number().positive().default(55),
  program_duration: yup.number().positive().required('Введите срок действия'),
  features: yup.string().default(''),
  is_popular: yup.boolean().default(false),
  sort_order: yup.number().default(0),
  master_multiplier: yup.number()  // NEW
    .min(1.0, 'Множитель должен быть от 1.0 до 2.0')
    .max(2.0, 'Множитель должен быть от 1.0 до 2.0')
    .default(1.3),
});

export type ProgramForm = {
  title: string
  short_description: string
  full_description: string
  packages: Array<{ lessons_count: number; price: number }>
  lesson_duration: number
  program_duration: number
  features: string
  is_popular: boolean
  sort_order: number
  master_multiplier: number  // NEW
}
```

### `src/app/actions/programs.ts` — ProgramFormData

```typescript
interface ProgramFormData {
  title: string
  short_description: string
  full_description: string
  packages: Package[]
  lesson_duration: number
  program_duration: number
  features: string
  is_popular: boolean
  sort_order: number
  master_multiplier?: number  // NEW, optional for backward compat
}
```

---

## Database Layer Updates

### `src/lib/db-prisma.ts`

Both `createProgram` and `updateProgram` must include `masterMultiplier` in their Prisma calls, and all read functions (`getProgramBySlug`, `getProgramById`, `getAllPrograms`) must return the field.

**createProgram:**

```typescript
async function createProgram(
  data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Program> {
  const prisma = getPrisma();
  const created = await prisma.program.create({
    data: {
      slug: data.slug,
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      packages: JSON.stringify(data.packages ?? []),
      lessonDuration: data.lessonDuration,
      programDuration: data.programDuration,
      features: JSON.stringify(data.features ?? []),
      isPopular: data.isPopular,
      sortOrder: data.sortOrder,
      masterMultiplier: data.masterMultiplier,  // NEW
    },
  });
  // ... parse JSON fields, return Program with masterMultiplier
  return {
    // ... existing fields
    masterMultiplier: created.masterMultiplier,
  };
}
```

**updateProgram:**

```typescript
async function updateProgram(data: Program): Promise<Program> {
  const prisma = getPrisma();
  const updated = await prisma.program.update({
    where: { id: data.id },
    data: {
      // ... existing fields
      masterMultiplier: data.masterMultiplier,  // NEW
    },
  });
  return {
    // ... existing fields
    masterMultiplier: updated.masterMultiplier,
  };
}
```

**getProgramBySlug / getProgramById:**

```typescript
return {
  // ... existing fields
  masterMultiplier: p.masterMultiplier,  // NEW
};
```

---

## Server Actions Updates

### `src/app/actions/programs.ts`

**createProgramAction:**

```typescript
export async function createProgramAction(
  data: ProgramFormData
): Promise<ActionResult<{ id: number }>> {
  try {
    // ... existing slug/features logic
    const created = await createProgram({
      // ... existing fields
      masterMultiplier: data.master_multiplier ?? 1.3,  // NEW with fallback
    });
    return { success: true, data: { id: created.id } };
  } catch (error) {
    // ...
  }
}
```

**updateProgramAction:**

```typescript
export async function updateProgramAction(
  id: number,
  data: ProgramFormData
): Promise<ActionResult<void>> {
  try {
    const existingProgram = await getProgramById(id);
    if (!existingProgram) return { success: false, error: 'Абонемент не найден' };

    // ... existing features logic
    await updateProgram({
      // ... existing fields
      masterMultiplier: data.master_multiplier ?? existingProgram.masterMultiplier,  // NEW
    });
    return { success: true, data: undefined };
  } catch (error) {
    // ...
  }
}
```

---

## Form Updates

### `src/app/programs/program-add-form.tsx`

Add a numeric input for master multiplier in the form:

```typescript
defaultValues: {
  // ... existing defaults
  master_multiplier: 1.3,  // NEW
},
```

New form field (placed after the "Порядок сортировки" row):

```tsx
<div className="space-y-1">
  <label className="text-sm text-gray-300">Множитель мастера</label>
  <input
    type="number"
    step="0.01"
    min="1.0"
    max="2.0"
    {...register('master_multiplier')}
    className={errors.master_multiplier ? inputErrorCls : inputCls}
  />
  {errors.master_multiplier && (
    <p className="text-sm text-red-400">{errors.master_multiplier.message}</p>
  )}
</div>
```

### `src/app/programs/[slug]/program-edit-form.tsx`

Same input field, with `defaultValues` sourced from the program:

```typescript
defaultValues: {
  // ... existing defaults
  master_multiplier: program.masterMultiplier,  // NEW — from DB
},
```

Same form field markup as the add form.

---

## Pricing Flow Updates

### `src/app/programs/utils.ts`

Both pricing functions receive an optional `masterMultiplier` parameter. When not provided, they fall back to the global constant.

```typescript
import { LevelMultipliers } from "./constants";
import type { MentorLevelValue, Package } from "./types";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price) + '₽';
};

export const pricePerLesson = (
  pkg: Package,
  selectedLevel: MentorLevelValue,
  masterMultiplier?: number  // NEW optional param
) => {
  const multiplier = selectedLevel === 'master'
    ? (masterMultiplier ?? LevelMultipliers.master)
    : LevelMultipliers[selectedLevel];
  const adjustedPrice = Math.round(pkg.price * multiplier);
  return Math.round(adjustedPrice / pkg.lessons_count);
};

export const getAdjustedPrice = (
  pkg: Package,
  selectedLevel: MentorLevelValue,
  masterMultiplier?: number  // NEW optional param
) => {
  const multiplier = selectedLevel === 'master'
    ? (masterMultiplier ?? LevelMultipliers.master)
    : LevelMultipliers[selectedLevel];
  const finalPrice = pkg.price * multiplier;
  return Math.round(finalPrice / 100) * 100;
};
```

### `src/app/programs/[slug]/page.tsx`

Pass `masterMultiplier` from the fetched program to `ProgramPricingClient`:

```tsx
<ProgramPricingClient
  packages={program.packages}
  masterMultiplier={program.masterMultiplier}  // NEW
/>
```

### `src/app/programs/[slug]/program-pricing-client.tsx`

Accept and forward `masterMultiplier`:

```typescript
interface ProgramPricingClientProps {
  packages: Package[];
  masterMultiplier: number;  // NEW
}

export function ProgramPricingClient({ packages, masterMultiplier }: ProgramPricingClientProps) {
  // ... pass masterMultiplier to ProgramPricingTabs
  return (
    <ProgramPricingTabs
      packages={packages}
      selectedLevel={selectedLevel}
      masterMultiplier={masterMultiplier}  // NEW
    />
  );
}
```

### `src/app/programs/[slug]/program-pricing-tabs.tsx`

Accept and use `masterMultiplier` in pricing calls:

```typescript
interface ProgramPricingTabsWithLevelProps {
  packages: Package[];
  selectedLevel: MentorLevelValue;
  masterMultiplier: number;  // NEW
}

export function ProgramPricingTabs({ packages, selectedLevel, masterMultiplier }: ProgramPricingTabsWithLevelProps) {
  // Use in pricing:
  // formatPrice(getAdjustedPrice(pkg, selectedLevel, masterMultiplier))
  // formatPrice(pricePerLesson(pkg, selectedLevel, masterMultiplier))
}
```

---

## Constants — Preserved as Fallback

### `src/app/programs/constants.ts`

No changes. The `LevelMultipliers` object and `MentorLevel` constants remain:

```typescript
export const LevelMultipliers = {
  expert: 1.0,
  master: 1.3
} as const;

export const MentorLevel = {
  expert: { value: 'expert', title: 'Эксперт', multiplier: 1.0 },
  master: { value: 'master', title: 'Мастер', multiplier: 1.3 }
} as const;
```

These serve as fallback values in the pricing utilities when `masterMultiplier` is not passed.

---

## Error Handling

- **Validation layer**: Yup schema rejects values outside [1.0, 2.0] with a Russian-language message before the form can submit.
- **Server actions**: If `master_multiplier` is missing from form data, actions fall back to `1.3` (create) or preserve the existing value (update).
- **Pricing utilities**: If `masterMultiplier` is `undefined`, functions fall back to `LevelMultipliers.master` (1.3).
- **Migration**: Default value ensures no null records exist.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Program Form (Add/Edit)                                │
│  ┌─────────────────────┐                                │
│  │ master_multiplier    │ ← validated by ProgramSchema  │
│  │ (input number field) │   min: 1.0, max: 2.0         │
│  └─────────┬───────────┘                                │
└────────────┼────────────────────────────────────────────┘
             │ submit
             ▼
┌─────────────────────────────────────────────────────────┐
│  Server Action (create/update)                          │
│  data.master_multiplier → masterMultiplier              │
└────────────┬────────────────────────────────────────────┘
             │ prisma.program.create/update
             ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL: Program.masterMultiplier (Float, default 1.3)│
└────────────┬────────────────────────────────────────────┘
             │ getProgramBySlug
             ▼
┌─────────────────────────────────────────────────────────┐
│  Page (server component)                                │
│  program.masterMultiplier → prop to PricingClient       │
└────────────┬────────────────────────────────────────────┘
             │ props
             ▼
┌─────────────────────────────────────────────────────────┐
│  ProgramPricingClient → ProgramPricingTabs              │
│  → getAdjustedPrice(pkg, level, masterMultiplier)       │
│  → pricePerLesson(pkg, level, masterMultiplier)         │
└─────────────────────────────────────────────────────────┘
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid multiplier round-trip persistence

*For any* valid master multiplier value `m` in the range [1.0, 2.0], creating or updating a program with `masterMultiplier = m` and then reading that program back SHALL return `masterMultiplier` equal to `m`.

**Validates: Requirements 2.2, 3.2, 6.1, 6.2**

### Property 2: Invalid multiplier rejection

*For any* numeric value `m` where `m < 1.0` or `m > 2.0`, the ProgramSchema validation SHALL reject the value and the form SHALL not submit.

**Validates: Requirements 2.4, 3.3, 5.1**

### Property 3: Adjusted price calculation with per-program multiplier

*For any* package with base price `p > 0` and any master multiplier `m` in [1.0, 2.0], when the master level is selected, `getAdjustedPrice(pkg, 'master', m)` SHALL equal `Math.round(p * m / 100) * 100`.

**Validates: Requirements 4.1**

### Property 4: Per-lesson price calculation

*For any* package with base price `p > 0`, lesson count `n > 0`, and master multiplier `m` in [1.0, 2.0], when the master level is selected, `pricePerLesson(pkg, 'master', m)` SHALL equal `Math.round(Math.round(p * m) / n)`.

**Validates: Requirements 4.2**

### Property 5: Expert level ignores master multiplier

*For any* package and *for any* master multiplier `m` in [1.0, 2.0], `getAdjustedPrice(pkg, 'expert', m)` SHALL equal `getAdjustedPrice(pkg, 'expert', 1.0)` — that is, the master multiplier has no effect on expert-level pricing.

**Validates: Requirements 4.3**

### Property 6: Fallback to global constant when multiplier omitted

*For any* package, calling `getAdjustedPrice(pkg, 'master')` without a multiplier argument SHALL produce the same result as `getAdjustedPrice(pkg, 'master', 1.3)`.

**Validates: Requirements 4.4, 7.2**

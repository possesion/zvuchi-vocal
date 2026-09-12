---
inclusion: always
---

# Code Conventions — Vocal School

This document defines coding standards, naming conventions, architectural patterns, and best practices for Vocal School (Next.js 14, TypeScript, Tailwind CSS, Prisma).

## File & Directory Organization

**Directory structure:**
- `/src/app` — Next.js pages and API routes (`/api/v1/`)
- `/src/components` — React components (layout, common, sections, forms, providers)
- `/src/lib` — utilities, types, database, constants
- `/src/hooks` — custom React hooks
- `/src/middleware.ts`, `/src/auth.ts`, `/src/auth.config.ts` — authentication

**Naming:** Files use **kebab-case** (`program-card.tsx`, `db-prisma.ts`). Directories use lowercase.

---

## Component Conventions

### Client Components (FC Pattern)

All client components use `FC` type with explicit Props interface.

```typescript
'use client';

interface ProgramCardProps {
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    slug?: string;
    className?: string;
}

export const ProgramCard: FC<ProgramCardProps> = ({
    title,
    description,
    price,
    originalPrice,
    slug,
    className,
}) => {
    // Component implementation
};
```

**Key requirements:**
- Declare `ProgramCardProps` interface above component
- Use destructuring in function signature
- Export with explicit `FC<Props>` type
- Do NOT use inline types, `any`, or untyped props

### Server Components

Server components in `/app` and `/components/sections` use `async function`.

```typescript
interface ProgramPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
    const { slug } = await params;
    const program = await getProgramBySlug(slug);
    if (!program) notFound();
    return <div>{program.title}</div>;
}
```

### Import Order

1. React & Next.js imports
2. Third-party libraries (lucide-react, classnames)
3. Type imports (`import type { ... }`)
4. Absolute imports (`@/components`, `@/lib`, `@/hooks`)
5. Relative imports (`./`, `../`)


## Naming Conventions

| Category | Style | Examples |
|----------|-------|----------|
| **Components (exported)** | PascalCase | `ProgramCard`, `InstructorProfile`, `HeaderNav` |
| **Component files** | kebab-case | `program-card.tsx`, `instructor-profile.tsx` |
| **Functions** | camelCase | `calculateTotal()`, `formatPrice()`, `getUserById()` |
| **Variables** | camelCase | `currentUser`, `isAuthorized`, `programList` |
| **Constants** | UPPER_SNAKE_CASE | `ADMIN_ONLY_PATHS`, `DEFAULT_PAGE_SIZE`, `MAX_UPLOAD_SIZE` |
| **Interfaces** | PascalCase + suffix | `ComponentProps`, `UserRow`, `AuthConfig`, `ActionResult<T>` |
| **Type aliases** | PascalCase | `UserRole = 'admin' \| 'manager' \| 'client'` |
| **Database fields** | snake_case | `email_verified`, `phone_number`, `created_at` |
| **JS object keys** | camelCase | `emailVerified`, `phoneNumber`, `createdAt` |
| **API endpoints** | kebab-case, versioned | `/api/v1/instructors`, `/api/v1/users/[id]` |

## Code Organization Patterns

### Database Layer (src/lib/db-prisma.ts)

Use **singleton pattern** for Prisma Client — one instance per app.

```typescript
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) prismaInstance = new PrismaClient();
  return prismaInstance;
}

export async function getAllTerms(): Promise<WikiTermRow[]> {
  const prisma = getPrisma();
  const terms = await prisma.wikiTerm.findMany();
  return terms.map(term => ({ id: term.id, title: term.title, ... }));
}
```

**Anti-pattern:** Creating new PrismaClient instances causes memory leaks.

### Server Actions (src/app/actions/*)

All Server Actions return `ActionResult<T>` for consistent error handling.

```typescript
'use server';

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function updateUserName(name: string): Promise<ActionResult<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        
        await updateUser(parseInt(session.user.id), { name });
        revalidatePath('/profile');
        return { success: true, data: undefined };
    } catch (error) {
        console.error('Failed to update user name:', error);
        return { success: false, error: 'Internal server error' };
    }
}
```

**Key:** Never throw exceptions; always return ActionResult.

### Context & Providers (src/components/providers/*)

Context is for global state (notifications, theme, auth data).

```typescript
'use client';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error';
}

interface UIContextValue {
    notify: (message: string, type?: 'success' | 'error') => void;
}

const UIContext = createContext<UIContextValue>({ notify: () => {} });

export function UIProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(uiReducer, initialState);
    const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
    }, []);
    return <UIContext.Provider value={{ notify }}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);
```


## API Routes

API endpoints use versioning (`/api/v1/`) with RESTful HTTP methods.

```typescript
// GET /api/v1/instructors/[id]
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const instructor = await getInstructorById(parseInt(id));
    if (!instructor) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(instructor);
}

// POST /api/v1/instructors
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user || !canEdit(session.user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const instructor = await createInstructor(body);
    return Response.json(instructor, { status: 201 });
}

// DELETE /api/v1/instructors/[id]
export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!isAdmin(session?.user?.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await deleteInstructor(parseInt(id));
    return Response.json({ success: true });
}
```

**Requirements:**
- Use HTTP status codes (201 for creation, 404 for not found, 403 for forbidden)
- Always handle errors and auth checks
- Use response types: `.json()` with appropriate status codes
- Never use query params for mutations (use DELETE, PUT, POST instead of GET)

## Styling

**Tailwind CSS v4** with custom `--color-brand` CSS variable (`#ab1515`).

```typescript
import cn from 'classnames';

export const Button: FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => (
    <button
        className={cn(
            'inline-flex items-center justify-center',  // Layout
            'px-4 py-2 text-sm',                        // Sizing
            'transition-colors',                        // Effects
            variant === 'primary' && 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90',
            variant === 'secondary' && 'bg-white/10 text-white hover:bg-white/20',
            className
        )}
        {...props}
    />
);
```

**Patterns:**
- Order: layout → sizing → colors/background → effects/transitions → variants → custom
- Use `cn()` for conditional classes
- Use CSS variables instead of hardcoded colors: `var(--color-brand)`, `var(--color-bg-primary)`
- Never hardcode colors like `bg-red-600` or `text-blue-500`

## Error Handling

Always use try-catch in Server Actions and API routes. Return errors via `ActionResult<T>`, never throw exceptions.

```typescript
export async function updateUser(id: number, data: UserUpdateData): Promise<ActionResult<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        
        const user = await getUserById(id);
        if (!user) return { success: false, error: 'User not found' };
        
        await updateUserInDB(id, data);
        revalidatePath('/profile');
        return { success: true, data: undefined };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Internal server error' };
    }
}
```

## Critical Anti-Patterns to Avoid

1. **Multiple Prisma Instances:** Creates memory leaks. Always use singleton pattern via `getPrisma()`.

2. **Props Drilling:** Pass data through many component levels. Use Context instead.

3. **Untyped Props:** Never use `any` type or untyped function parameters. Define explicit Props interfaces.

4. **Mixing Server & Client Code:** Keep Server Actions in separate files (`src/app/actions/`) and import into Client Components.

5. **Hardcoded Route Protection:** Use middleware to protect routes, not repeated checks in components.

6. **Not Revalidating Cache:** After updates, always call `revalidatePath()` or `revalidateTag()`.

7. **Missing Error Handling:** Always wrap async operations in try-catch. Handle null/undefined checks.

## TypeScript Essentials

- **Always** use `import type` for types to avoid implicit dependencies
- **Always** handle `null` and `undefined` explicitly; don't assume values exist
- **Never** use `any` type
- Use strict null checks in `tsconfig.json`

```typescript
import type { Instructor } from '@/lib/types';
import { db } from '@/lib/db';

export async function getInstructor(id: number): Promise<Instructor | undefined> {
    const instructor = await db.getInstructor(id);
    if (!instructor) return undefined;  // Explicit null check
    return instructor;
}
```

## Performance

**Image optimization:** Use Next.js `Image` with `sizes` attribute.
```typescript
<Image src={image} alt={`Фото преподавателя ${name}`} fill sizes="(max-width: 1024px) 100vw, 50vw" priority />
```

**Cache revalidation:** Always call `revalidatePath()` after data mutations.
```typescript
await db.updateInstructor(id, data);
revalidatePath(`/instructors/${id}`);
revalidatePath('/instructors');
```

## Testing

Tests use **Vitest** and live alongside code (`file.test.ts`).

```typescript
import { describe, it, expect } from 'vitest';
import { createUser, getUserByEmail } from '@/lib/db-prisma';

describe('User Database', () => {
    it('should create a new user', async () => {
        const user = await createUser({ email: 'test@ex.com', passwordHash: 'hashed', role: 'client' });
        expect(user.email).toBe('test@ex.com');
    });
});
```

## Documentation

**Inline comments** explain **WHY**, not WHAT (code shows the what).
```typescript
// Prevent credential login for OAuth users by using invalid hash format
const unusableHash = `google:${crypto.randomUUID()}`;
```

**JSDoc** for exported functions:
```typescript
/**
 * Updates user profile.
 * @param userId User ID from session
 * @param data Object with name, phone
 * @returns ActionResult with operation result
 */
export async function updateUserProfile(userId: number, data: UserProfileData): Promise<ActionResult<void>> { ... }
```

## Accessibility

- Use semantic HTML: `<article>`, `<header>`, `<section>`, `<button>` not `<div>`
- Add `alt` text to all images
- Add `aria-label` to icon-only buttons
- Maintain heading hierarchy: `<h1>` → `<h2>` → `<h3>` (no skipping levels)

## Environment Variables

```bash
# .env.local (don't commit)
DATABASE_URL=file:./data/wiki.db
AUTH_SECRET=<generated_secret>
NEXTAUTH_URL=http://localhost:3000

**Usage:**
```typescript
const dbUrl = process.env.DATABASE_URL || 'file:./data/wiki.db';
const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error('AUTH_SECRET not set');
```

## Git Conventions

**Branch naming:** `<type>/<description>` (e.g., `feature/add-reviews`, `fix/auth-redirect`)

**Commit format:**
```
<type>(<scope>): <subject>

<body>
<footer>
```

**Example:**
```
feat(auth): add email verification endpoint

- Generate 256-bit verification tokens with 24h expiration
- Validate token existence and expiry

Closes #123
```

## Component Checklist

Before creating a new component:
- [ ] File named kebab-case
- [ ] Component exported as PascalCase with `FC<Props>` type
- [ ] Props interface defined above component
- [ ] Imports ordered: React → Third-party → Types → Absolute → Relative
- [ ] Tailwind classes ordered: layout → sizing → colors → effects
- [ ] `alt` text on images, `aria-label` on icon buttons
- [ ] Page-specific components in `/sections`, reusable in `/common`
- [ ] No `any` types
- [ ] Error handling in async functions
- [ ] Tests for utilities and Server Actions

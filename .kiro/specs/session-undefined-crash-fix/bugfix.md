# Bugfix Requirements Document

## Introduction

In production the app throws a runtime `TypeError: "Cannot destructure property 'status' of '(0 , h.useSession)(...)' as it is undefined."` This happens because `next-auth@5.0.0-beta.31` `useSession()` reads a React context whose default value is `undefined`. When a component that calls `useSession()` renders without a `SessionProvider` ancestor in the tree, `useSession()` returns `undefined`. In development next-auth throws a friendly error, but in a production build it silently returns `undefined`, so destructuring `status` (or `data`) off the result throws and crashes the render.

The header (`NavMenu` + `MobileMenu`, both call `useSession()`) is rendered per-page, including on special pages such as `not-found.tsx` and error boundaries where the `AuthSessionProvider` context may not be present. `UserAvatar` and the contest page share the same destructuring risk. The impact is a hard crash of the affected route instead of graceful rendering of the unauthenticated UI.

## Bug Analysis

### Current Behavior (Defect)

When a component that calls `useSession()` renders outside a `SessionProvider` ancestor in a production build, `useSession()` returns `undefined` and destructuring throws.

1.1 WHEN `MobileMenu` renders without a `SessionProvider` ancestor THEN the system throws a `TypeError` while destructuring `status` from `useSession()`, crashing the render
1.2 WHEN `NavMenu` renders without a `SessionProvider` ancestor THEN the system throws a `TypeError` while destructuring `status` from `useSession()`, crashing the render
1.3 WHEN `UserAvatar` renders without a `SessionProvider` ancestor THEN the system throws a `TypeError` while destructuring `data` from `useSession()`, crashing the render
1.4 WHEN the contest page renders without a `SessionProvider` ancestor THEN the system throws a `TypeError` while destructuring `data` from `useSession()`, crashing the render

### Expected Behavior (Correct)

When `useSession()` returns `undefined`, components must degrade gracefully to the unauthenticated state instead of crashing.

2.1 WHEN `MobileMenu` renders and `useSession()` returns `undefined` THEN the system SHALL treat the user as unauthenticated (`isAuthorized === false`) and render the menu without throwing
2.2 WHEN `NavMenu` renders and `useSession()` returns `undefined` THEN the system SHALL treat the user as unauthenticated (`isAuthorized === false`) and render the nav without throwing
2.3 WHEN `UserAvatar` renders and `useSession()` returns `undefined` THEN the system SHALL treat the session as absent and render `null` without throwing
2.4 WHEN the contest page renders and `useSession()` returns `undefined` THEN the system SHALL treat the session as absent (no admin controls, unauthenticated prompt shown) and render without throwing

### Unchanged Behavior (Regression Prevention)

Inputs where `useSession()` returns a defined result (a real session object with a `status`/`data`) must behave exactly as before.

3.1 WHEN `useSession()` returns `{ status: 'authenticated', data }` THEN the system SHALL CONTINUE TO render the authenticated UI (profile link, user avatar, logout) in `MobileMenu` and `NavMenu`
3.2 WHEN `useSession()` returns `{ status: 'unauthenticated' }` THEN the system SHALL CONTINUE TO render the login link in `MobileMenu` and `NavMenu`
3.3 WHEN `useSession()` returns a session with `data.user` THEN the system SHALL CONTINUE TO render the user avatar, initials, email, and menu in `UserAvatar`
3.4 WHEN `useSession()` returns a session with `data.user.role` THEN the contest page SHALL CONTINUE TO compute `userIsAdmin` and show admin controls exactly as before

## Bug Condition

**Bug Condition Function** — identifies inputs that trigger the bug:

```pascal
FUNCTION isBugCondition(X)
  INPUT: X = return value of useSession() during render
  OUTPUT: boolean

  // The hook returns undefined when no SessionProvider ancestor is present
  // (silent in production, throws on destructure)
  RETURN X = undefined
END FUNCTION
```

**Property Specification (Fix Checking)** — correct behavior for buggy inputs:

```pascal
// Property: Fix Checking - Undefined session degrades gracefully
FOR ALL X WHERE isBugCondition(X) DO
  result ← renderComponent'(X)   // F' = fixed component
  ASSERT no_throw(result)
        AND treated_as_unauthenticated(result)
END FOR
```

**Preservation Goal (Preservation Checking)** — unchanged for defined sessions:

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO   // X is a defined session object
  ASSERT renderComponent(X) = renderComponent'(X)   // F(X) = F'(X)
END FOR
```

Where **F** is the original (unfixed) component and **F'** is the fixed component.

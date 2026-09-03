<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI text

- Product-facing UI text lives in `lib/content/*.ts`, exported `as const`.
- Extract a string if it's used twice OR asserted in a test; one-offs stay inline.
- Components and tests import the same constant — never retype a string in a test.
- Use formatter functions for pluralization or non-trivial interpolation.
- Simple React composition may use shared static text constants.

```ts
export const BOOKING = { confirmCta: 'Confirm pickup' } as const;

// ❌ getByText('Confirm pickup')
// ✅ getByText(BOOKING.confirmCta)
```

String literals elsewhere in tests are a review blocker.

## Destructuring

- Destructure repeated property access when the same object path is used more than once.
- Prefer module-level destructuring for static content objects.
- Prefer function-level destructuring for props and request-specific values.
- Do not destructure a property that is used only once unless it improves readability.

```ts
// ❌
caregiverText.invitation.title;
caregiverText.invitation.description;
caregiverText.invitation.cta;

// ✅
const { title, description, cta } = caregiverText.invitation;
```

## Test fixtures

- Fixtures stay local to the test file.
- Assert on the fixture property, not a copy of its value:
  `expect(row).toHaveTextContent(child.firstName)` — not `'Anna'`.

# 0008. Auth.js with a custom Prisma adapter

Date: 2026-08-28
Status: accepted

## Context

The application needs real authentication. 

I considered 3 alternatives:

* **Neon Auth** was rejected because it would manage the `User` table already used by `ChildGuardian` and `Location`, 
and would couple authentication to the database provider.
* **Better Auth** has good typing and schema generation, but Auth.js is more widely adopted in real-world projects.
* **Custom authentication from scratch** was rejected because OAuth is easy to implement incorrectly and would take 
* extra time. For the MVP, Auth.js provides everything the app needs at this stage.

## Decision

Use **Auth.js v5** with **Google as the only provider** and a **custom Prisma adapter**.

The adapter is small and makes Auth.js database operations explicit. It also allows the domain model to keep its own 
naming instead of following Auth.js conventions.

Auth.js fields are mapped to domain fields in one place:

* `name` → `fullName`
* `emailVerified` → `emailVerifiedAt`
* `image` → `avatarUrl`

OAuth fields in `Account`, such as `access_token`, `expires_at`, and `id_token`, stay in snake_case because Auth.js 
expects these names.

Sessions are stored in the DB instead of JWTs. This allows immediate session revocation by deleting the session 
row. For an application involving child pickup, immediate access removal is more important than avoiding an extra DB query.

`allowDangerousEmailAccountLinking` is enabled for Google so an existing user can sign in with the same Google email. 
This is acceptable because Google verifies email ownership. If a provider without verified emails is added later, 
this setting must be removed and account linking must be handled explicitly.

## Consequences

Protected requests read the session from the DB, which adds a database query.

The proxy runs in the Node.js runtime so it can verify sessions against the database. Moving it to Edge later would 
require a different setup.

The proxy is not the main security boundary. Server Actions do not go through it, so every action must perform 
its own permission checks.

Because the Prisma adapter is maintained in this project, Auth.js adapter API changes may require local changes.

Google sign-in does not work on preview deployments because preview URLs change and Google requires exact 
redirect URIs. Preview deployments can only be used for features that do not require authentication.

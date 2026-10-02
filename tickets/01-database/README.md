# Database

Firebase, Cloud Firestore and the document collections the whole product rests on.

| Ticket | Title | Depends on |
|---|---|---|
| DB-001 | Provision Firebase and Firestore | FND-001, FND-005 |
| DB-002 | User and Note schema and indexes | DB-001 |
| DB-003 | Firestore client singleton and seed | DB-002 |

Exit condition: Local Firestore emulator (or Firebase project) is connected, composite indexes
are defined in `firestore.indexes.json`, and `npm run db:seed` produces a demo user with two notes.

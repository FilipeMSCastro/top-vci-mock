# siga-vp-sandbox

A disposable, local mock of a **fictional** municipal heavy-vehicle circulation
permit portal ("SIGA-VP" / Município de Vilarinho — not a real place or
institution). It exists to support a browser-automation proof of concept:
developing and testing a script that logs in, fills a multi-step request form,
and reads back a confirmation code, without depending on any real external
system.

Node.js + Express, server-rendered pages, no database — all submitted
requests live in memory and are lost on restart.

## Run it

```bash
npm install
npm start
```

Defaults to `http://localhost:4000`. Configurable via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Server port |
| `MOCK_VCI_EMAIL` | `demo@vci-mock.local` | Login email for the single seeded account |
| `MOCK_VCI_PASSWORD` | `demo-password` | Login password for the seeded account |

These are placeholder credentials for local use only.

## Behaviour

- Login is required to reach the request form or the submitted-requests list.
- The request flow is a 3-step wizard: plate details, an itinerary (4 place +
  date/time pairs), and a document upload with an optional reference code.
- Submitting the same plate with the same start date/time twice is rejected —
  no duplicate record is created.
- A successful submission returns a deterministic confirmation code (the same
  plate + start time always produces the same code).
- Everything resets when the process restarts; there is no persistence and no
  reset endpoint.

## Smoke test

1. Visit the app without logging in → redirected to the login page.
2. Log in with the seeded account above.
3. Complete the 3-step form with a file attached → confirmation screen with a
   code.
4. Repeat with the same plate and start date/time → rejected as a duplicate.
5. Repeat with a different start date/time → succeeds with a new code.
6. Open the submitted-requests list → the new entry appears.
7. Restart the process → the list is empty again.

## Out of scope

- Real account creation (the sign-up screen is cosmetic only).
- Password recovery / email confirmation flows.
- Any browser-automation test suite against this mock — that lives in the
  project this mock supports, not here.
- Deployment to any shared environment — this is a local development aid.

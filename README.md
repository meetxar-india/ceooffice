# CEO Office OS — RMX | BluBird

A multi-user command center for the CEO office. Plan, run, watch, and generate board-grade PDFs from one place. Built to deploy on Railway.

## What's inside

**Command**
- Dashboard: flags, due today, this week, objective health, workload
- Only-Me Queue: the decisions and sign-offs only the CEO can resolve
- War Room: the live-wire projects, plus every red flag in one place

**Plan & Run**
- Planning (objectives on a three-ring priority model), Projects, Tasks, Decisions, Meetings (with action items)

**Watch**
- Risks, Hot Topics & Watchlist, Stakeholders & Comms, Capital / North Star / Bold Bets, Commitments Ledger

**Output**
- Cadence: daily standup and weekly review views
- Briefing Studio: interview-driven PDF generator (8 document types)

**Admin**
- Team: users, roles, live presence, activity feed (owner only)

## Briefing Studio

The studio pulls what it can from the live data, asks only the gaps and the judgment questions, then renders a co-branded PDF. Document types: Daily CEO Brief, Weekly Operating Review, Decision Memo, Board / Investor Update, Deal Brief (Project Hose), War-Room Brief, Stakeholder Update, Monthly Business Review.

## Flag engine

Scans every module and surfaces what is slipping: overdue, blocked, no owner, no next action, stale, objectives off-track, decisions past review, overdue meeting actions, high/high risks, CEO actions overdue, fires and hot topics, stakeholders owed a touch, overdue commitments, north-star metrics below target. Red first.

## Deploy on Railway

1. Push this folder to a GitHub repo.
2. Railway: New Project, Deploy from GitHub repo.
3. Add a Volume mounted at `/data`.
4. Set Variables:
   - `SESSION_SECRET` = a long random string
   - `DATA_DIR` = `/data`
5. Deploy. Railway gives you a public URL.

Start command is `npm start`. Node 18+.

## Logins (seeded)

Temp password for all: `rmx-office-2026`. Rotate on first login under the account menu.

- abhinav (owner / CEO)
- mandeep (Executive Assistant)
- awadhesh (Chief of Staff)
- neha (Governance)
- ishan (Systems)

## Watchouts

- Set `SESSION_SECRET` and the `/data` Volume before real use, or sessions break and data resets on redeploy.
- The JSON store is fine for a small office. Move to Postgres past ~15 users or heavy concurrency.
- Put governance under one owner (Ishan) before live company data goes in. The studio generates board and investor documents.
- This is the manual core. Phase 2 wires Gmail, Calendar, Fireflies, and HubSpot into the studio intake so briefs pre-fill, and adds scheduled auto-generation.

## Stack

Node, Express, vanilla JS front end, pdfkit for PDFs. No build step. File-based JSON store.

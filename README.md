# Resourceful Superstack

This is the consolidated handoff repo for the Resourceful platform — the working culmination of prototyping and early build work, brought together from several separate projects into one place for the team to build from.

## What's in here right now

- **/onboardingv5** — live, functional onboarding shell page (static HTML). Fully viewable and shareable at its deployed URL now. Not yet wired into the Next.js app's shared state/auth — that integration is future work.
- **/superuser-v3** — live, functional superuser interface (static HTML). Same status as above.
- **/dashboard** — early MVP page copied from `onboarding-launch-v2/app/dashboard/page.tsx`
- **/cockpit** — live, functional member-facing pages (34 pages: Business/Family/Fitness/Travel/Network hubs, Rizz Chat, etc.), copied from parent `/Users/nickhadfield/Resourceful Dev files/` repo via git HEAD.
- **/v2/room/[id]** — video room page for onboarding calls copied from `onboarding-launch-v2/app/v2/room/[id]/`
- **/components/cockpit/** — 23 React components supporting cockpit pages
- **/components/shell/** — PlatformFrame, RizzPanel components
- **/components/ui/** — shadcn/ui components (alert-dialog, avatar, badge, button, card, input, label, scroll-area, switch, textarea)
- **/components/intelligence/**, **/components/knowledge/** — additional UI components
- **/hooks/** — 12 React hooks (useAuth, useAudioRecorder, useDailyCall, etc.)
- **/lib/** — 41 lib files covering supabase, meetings, ai services, db, git-integration, knowledge-base, etc.
- **/stores/**, **/toast/** — state stores and toast utilities

**Total files copied: ~140 TypeScript/TSX source files** (plus supporting JSON and static assets).

**Note on old-supabase exception:** `app/cockpit/london/page.tsx`, `lembongan/page.tsx`, `malvern/page.tsx`, and `morzine/page.tsx` intentionally still use `lib/db/old-supabase.ts` (`fetchTestVenues`, `OldVenue` type) — this is a known, isolated exception for venue/location pages, not leftover technical debt to be fixed without checking with Nick first.

## What we're building toward — and why we need you

What's built today is the foundation: one clean, working repo instead of three fragmented ones. The real vision is bigger, and it's not built yet — that's exactly why we're bringing people in now, while the architecture is still being decided rather than already locked in.

**An agentic OS, not a dashboard.** The goal is to move past static, hardcoded pages toward a platform where tools — coding agents, Notion, Daily.co, Open Design, and whatever comes next — are dynamic, resizable objects that snap into a common shell, rather than pages someone has to hand-build one at a time. The shell is generic; the plugins are what change depending on who's using it.

**Agent-readable, not just human-readable.** Every tool that gets built should register itself through a standard manifest pattern (SKILL.md + plugin registration), so that Rizz and other agents can discover, understand, and use tools autonomously — not just humans clicking through a UI. That's what makes this a genuinely agentic workflow rather than a nicely designed app.

**Zero-to-hero onboarding.** A new member — technical or not, from Dulfrey building on the platform to Joe with no prior context — should land in one unified shell that carries them from first login through real contribution, without ever needing to understand the daemon, CLI, or API layer underneath.

**Bypassing vendor lock-in.** By building on open standards (MCP, standard manifests) instead of hard-wiring against one backend, every plugin and tool built today should remain portable — if the underlying engine changes, the work built on top of it doesn't have to be rebuilt.

**The team builds the platform on the platform.** This isn't just a product ambition — it's the plan for how Resourceful itself gets built. Contributors coordinate through the Superstack itself, Rizz-mediated task handoffs, and shared Hot Zones (Tue/Wed/Thu, 11am–4pm Peru time), proving the platform works for real, demanding work before it's asked to work for everyone else.

**Sacred Valley as the rehearsal, not the ceiling.** The 60-day Sacred Valley launch is the live test of all of this at small scale — free/community users, local accommodation and venue partners, a handful of Clubhouses — before the same model is offered to fully-paying members globally at £5-10k/month. If it works here, with real people and real friction, it's ready to scale.

**None of this exists yet.** The consolidated repo you're looking at is the starting point, not the destination — the plugin shell, agent-readable tooling, and unified onboarding described above are the work ahead, and where the next phase of building needs to happen.

## Next steps — what needs building from here

The pieces in this repo work individually but aren't yet built out or unified. In rough priority order:

1. **onboardingv5 becomes the design master.** Every other page — cockpit, dashboard, superuser — needs to be brought into visual alignment with onboardingv5's design, not the other way around. This is planned to happen via Open Design, as one of the Superstack's plugin integrations.

2. **Onboarding hub sections built out fully**, not just scaffolded: Watch, Calls, Bounties, Projects/Rooms, Network, My Rizz setup, Membership — each needs real functionality, not placeholder pages.

3. **Rizz made fully context-aware.** Right now Rizz doesn't reliably know which user it's talking to or what stage they're at. This needs to read user role, onboarding_stage, and member_context before every interaction, consistently across every surface (onboarding, cockpit, video calls).

4. **Video hub rebuilt as dynamic, not hardcoded.** Currently the room at /v2/room is fixed/hardcoded data. This needs to become: dynamic room creation for any meeting, a real pre-call Rizz brief generated from actual meeting context, and a real post-call summary — not a fixed template.

This is the near-term build sequence. It doesn't yet cover longer-term plans (video recording/clips, superuser going fully live, B2B AI company integration, Sacred Valley launch) — those live in the project's main planning document, not here.

## Important context

- onboardingv5 and superuser-v3 are static HTML pages — they work fully as standalone pages right now, but aren't yet connected to the app's shared state, auth, or data layer the way the Next.js app routes are.
- **RizzCodeDashboard at /cockpit/rizz-code currently shows a graceful error state** — it depends on `/api/git/*` endpoints that don't exist yet. This is known future work (API routes for git-integration), not a broken feature from this consolidation.
- This repo is expected to be a stepping stone: real product build work will likely happen here initially, then get forked into a new repo for the actual first MVP release.
- Do not assume this repo is the final production codebase — check with Nick before treating anything here as permanent architecture.

## Build status

**✓ Build passes cleanly** — `next build` completes with no errors:
- Compiled successfully in ~6-7s
- TypeScript type checking passes
- 34 routes generated (32 static, 2 dynamic)

## Package alignment notes

Version mismatches resolved during consolidation:
- `@daily-co/daily-js`: pinned to `0.87.0` (matching parent repo) to resolve type incompatibilities
- `@daily-co/daily-react`: `^0.25.1` with `jotai`, `jotai-family` peer dependencies

## Related repos

- **onboarding-launch-v2** — source of the dashboard and video room pages copied into this repo
- **resourceful-cockpit** — source of the cockpit pages copied into this repo (the parent `/Users/nickhadfield/Resourceful Dev files/` directory)
- Both remain live/active separately; changes made here are not automatically synced back to them.
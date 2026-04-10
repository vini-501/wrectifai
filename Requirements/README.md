# Wrectifai Requirements

## Product Vision
- Define the product mission and target users.
- Clarify the core problem Wrectifai solves.
- Capture the expected business impact.

## Features
- List MVP features for API, web, and mobile.
- Mark each feature with priority (P0/P1/P2).
- Add acceptance criteria for every feature.

## Tech Decisions
- Nx monorepo with `apps/api`, `apps/web`, and `apps/mobile`.
- Backend: Node.js + Express.
- Web: Next.js App Router + Tailwind + shadcn-ready components.
- Mobile: Expo managed workflow + NativeWind.

## Milestones
- Milestone 1: Workspace and base architecture setup.
- Milestone 2: Authentication, user module, and dashboard foundations.
- Milestone 3: Production hardening, observability, deployment.

## Open Questions
- Authentication strategy (JWT, OAuth, or both).
- Database and ORM selection.
- Role and permission model.
- Deployment environments and CI/CD strategy.

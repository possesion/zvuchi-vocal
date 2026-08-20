# AI Coding Agent Instructions

This file provides context and instructions for AI coding agents working on this Next.js project.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Documentation

When working on Next.js code, **always read the bundled Next.js documentation first** before writing or modifying code.

The documentation is located at:
- `node_modules/next/dist/docs/` (version-matched to the installed Next.js package)

The structure mirrors https://nextjs.org/docs:
- App Router guides: `node_modules/next/dist/docs/app/`
- API reference: `node_modules/next/dist/docs/app/api-reference/`
- Upgrade guides: `node_modules/next/dist/docs/app/guides/upgrading/`

**Always verify APIs and patterns against these bundled docs before implementing changes.**
<!-- END:nextjs-agent-rules -->

## Project-Specific Context

This is a vocal school website built with:
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM with PostgreSQL
- NextAuth v5 for authentication

See `.kiro/steering/` for detailed coding conventions and project guidelines.

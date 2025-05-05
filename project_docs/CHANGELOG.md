# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Refactored Lead Reviewer Role Handling (Phase 1)**
  - **Reason:** The initial implementation of the `createSearchSession` action incorrectly updated the global `User.role` to 'Lead Reviewer'. This contradicted the project documentation (PRD, Authentication docs) which specified an *implicit* Lead Reviewer role for Phase 1, based solely on session ownership (`session.userId === context.user.id`). Mixing global and session-specific roles in the `User.role` field is architecturally unsound and would complicate Phase 2 implementation.
  - **Change:** The `createSearchSession` action in `src/server/searchStrategy/actions.ts` was refactored to remove the logic that updated the `User.role`.
  - **Impact:** Phase 1 now consistently uses implicit ownership checks for Lead Reviewer authorization, aligning the codebase with the documentation and simplifying the model for future extensions.
- **Task Definitions Updated:** `tasks/task_003.txt` and `tasks/tasks.json` were updated to reflect the refactoring: subtask 15 (role promotion) marked as obsolete, and descriptions adjusted.
- **Project Status Updated:** `project_docs/project_status.md` updated to clarify the implicit role implementation and reflect Task 3 progress.

### Added
- **Search Strategy Detail Page (`SearchSessionDetailPage`)**: Basic structure and data fetching implemented.
- **`getSearchSession` Query**: Server-side query added to fetch details for a specific session.
- **Wasp Definitions**: Added route, page, and query definitions in `main.wasp` for session detail view.

[Unreleased]: https://github.com/your-org/thesis-grey/compare/HEAD 
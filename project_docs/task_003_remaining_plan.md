# Implementation Plan for Remaining Task 3 Subtasks

This plan outlines the steps to complete Task 3 (Develop Search Strategy Builder) based on the current project state and decisions made.

**Assumptions:**
- Subtasks 1, 2, 11 are completed.
- Subtask 15 is obsolete (Implicit Lead Reviewer role via ownership check `session.userId === context.user.id`).

**Plan:**

1.  **Implement Query Builder UI Components (Subtasks 5 & 6):**
    *   **Subtask 5:** Create `src/client/searchStrategy/components/QueryBuilder/DomainSelector.tsx`.
    *   **Subtask 6:** Create `src/client/searchStrategy/components/QueryBuilder/FileTypeFilter.tsx`.
    *   *Code Source:* Use implementation from `task_003_notes.md`.
    *   *Note:* State will be passed via props initially.

2.  **Implement Query Generation Logic (Subtask 7):**
    *   Create `src/client/searchStrategy/services/queryGenerator.ts`.
    *   Implement `generateQueryString(picData, domains, fileTypes)` function.

3.  **Implement Query Builder State Management Hook (Subtask 10):**
    *   Create `src/client/searchStrategy/hooks/useQueryBuilder.ts`.
    *   Manage state for PIC terms, domains, file types.
    *   Include state update functions.
    *   Provide memoized `previewQueryString` using `queryGenerator.ts`.

4.  **Implement Query Preview UI (Subtask 8):**
    *   Create `src/client/searchStrategy/components/QueryBuilder/QueryPreview.tsx`.
    *   *Code Source:* Use implementation from `task_003_notes.md`.
    *   Display `previewQueryString` from the hook.

5.  **Integrate Query Builder into Detail Page (Refine Subtask 14):**
    *   Modify `src/client/searchStrategy/pages/SearchSessionDetailPage.tsx`.
    *   Instantiate `useQueryBuilder` hook.
    *   Render `PICFrameworkInput`, `DomainSelector`, `FileTypeFilter`, `QueryPreview`.
    *   Connect component props to hook state/setters.

6.  **Implement `createSearchQuery` Backend Action:**
    *   Define action in `main.wasp`.
    *   Implement function in `src/server/searchStrategy/actions.ts` (takes `sessionId`, `query`, `description`; performs auth check).

7.  **Implement `SearchQueryForm` Component (Subtask 9):**
    *   Create `src/client/searchStrategy/components/QueryBuilder/SearchQueryForm.tsx`.
    *   Wrap integrated components from Step 5.
    *   Add query description input.
    *   Manage submission state.
    *   Trigger save via button in `QueryPreview` or here.

8.  **Connect `SearchQueryForm` to Backend (Subtask 13):**
    *   Modify `SearchQueryForm.tsx`.
    *   Use `useAction` hook with `createSearchQuery` action.
    *   Pass `sessionId`, `previewQueryString`, `description` to action.
    *   Handle loading/error states.
    *   Trigger `refetch` of `getSearchSession` in parent page on success.

9.  **Refine `SearchSessionDetailPage` (Finalize Subtask 14):**
    *   Replace placeholder in `SearchSessionDetailPage.tsx` with `SearchQueryForm`.
    *   Ensure query list updates reactively.

10. **Optional Refactor: `SearchSessionForm` (Subtasks 3 & 12):**
    *   **Subtask 3:** Extract session creation form from `SearchStrategyPage.tsx` to `SearchSessionForm.tsx`.
    *   **Subtask 12:** Connect the new form using `useAction`.
    *   *Priority:* Low.

11. **End-to-End Integration and Testing (Subtask 16):**
    *   Test full workflow: session create -> detail -> build query -> save query -> list update.
    *   Test edge cases, authorization, UI. 
## ✅ **Solo Developer Git Workflow for Incremental Feature Development**

### 🔁 DAILY FLOW (applies to all tasks)

1. **Start your day**:

   ```bash
   git pull origin main
   ```

   Keeps your local code up to date.

2. **Create a new branch for each task**:

   ```bash
   git checkout -b feat/task-03-search-strategy
   ```

3. **Work on the task in small, testable steps. Commit frequently**:

   ```bash
   git add .
   git commit -m "Implement SearchStrategyPage layout"
   git commit -m "Add PICO input form"
   git commit -m "Fix query generation logic"
   ```

4. **If needed, test locally and backtrack using:**

   * `git log` to view recent commits
   * `git checkout <commit-id>` to explore older states
   * `git revert <commit-id>` to undo bad changes cleanly

---

### ✅ **When Task Is Done**

1. **Ensure everything works (build/test runs cleanly)**

2. **Squash and clean up commits (optional but tidy)**:

   ```bash
   git rebase -i main
   ```

   Replace `pick` with `squash` to combine commits.

3. **Merge to main**:

   ```bash
   git checkout main
   git pull
   git merge feat/task-03-search-strategy
   git push origin main
   ```

4. **Tag the merge if it’s a milestone**:

   ```bash
   git tag -a v0.1.2 -m "Completed Search Strategy Builder"
   git push origin v0.1.2
   ```

---

## 🔒 SAFETY TIPS

* **Use `.gitignore`**: Prevent committing `.env`, `node_modules`, and other sensitive or large files.
* **Use GitHub as backup**: Push regularly, even mid-task:

  ```bash
  git push -u origin feat/task-03-search-strategy
  ```
* **Use tags for major features/milestones** (`v0.1.0`, `auth-done`, etc.)

---

## 🚨 WHEN THINGS BREAK

* Use `git log` to find the last working commit.
* Use:

  ```bash
  git checkout <commit-id>
  ```

  to return to a safe state temporarily.
* Or:

  ```bash
  git reset --hard <commit-id>
  ```

  to go back permanently (⚠️ this erases changes — use with care).

---

## 💡 OPTIONAL TOOLS TO HELP YOU

* **GitHub Desktop**: Friendly GUI for everything above.
* **VS Code GitLens Extension**: Visualizes history, blame, branches.
* **GitHub Issues + Projects**: Track tasks inline with commits.

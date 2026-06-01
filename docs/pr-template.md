<!-- 🛈 Please ensure your PR is focused, descriptive, and broken down into a manageable size (< 500 lines is ideal). -->

## Description
<!-- 
Provide a clear, detailed summary of the changes introduced by this PR. 
Explain WHAT you did, WHY you did it, and HOW it accomplishes the goal. 
Avoid vague titles or blank descriptions (e.g., don't just say "dashboard prototype", explain what features were added).
-->

## Related Issues & Traceability
<!-- 
Ensure bidirectional traceability. Link the issue(s) this PR resolves.
Example: Fixes #42 or Closes #56
-->
- **Fixes / Closes:** #
- **Related PRs / Commits:** 

## 🛠️ Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring / Tech Debt (code reorganization, e.g., tracker.js split, directory renaming)

---

## 📋 Definition of Done (DoD) Checklist
*Please review and check all items that apply to this PR before requesting a review:*

### Code Quality & Security
- [ ] **Code Style:** My code follows the team's established style guide and formatting rules.
- [ ] **Refactoring & Architecture:** Code is modular and intuitive (e.g., proper route handling like `/api/events`, clean directory nesting).
- [ ] **Security:** Input has been sanitized / queries are parameterized to protect against SQL Injection. Endpoints are properly protected via the auth-key mechanism if applicable.

### Testing
- [ ] **Unit Tests:** I have added robust unit tests for my changes (especially critical for core logic like the Event validation system, tracking valid/invalid payloads).
- [ ] **Test Execution:** All existing and new unit/e2e tests pass locally without errors.
- [ ] **Messy Data Handling:** (If backend/ingestion) Code has been verified to handle malformed or messy edge cases safely without crashing.

### Documentation & Tracking
- [ ] **Documentation:** I have updated the relevant README files, repository tree view, or architecture diagrams if directory structures or setups changed.
- [ ] **ADRs & Changelog:** I have documented major architectural decisions or updated the project changelog if required.
- [ ] **GenAI Log:** If Generative AI was used to assist in writing, debugging, or refactoring this code, I have logged the usage in `docs/GenAI.md`.

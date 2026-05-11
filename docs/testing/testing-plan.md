# WatchTower Early Testing Plan

## Purpose

This plan explains how we will test the WatchTower prototype during Sprint 1. Since the prototype is still early and uses mock data, our goal is not to test everything perfectly yet. Instead, we want to show that the main idea works: a team should be able to notice a problem, look at the details, and see whether it may be connected to a recent deployment or build.

For this sprint, testing should stay simple and focused on the prototype’s main user flow.

## Unit Tests We Can Add Later

Later on, we can add unit tests for the JavaScript logic behind the prototype. These tests should focus on small functions that do not depend too much on the page layout.

Possible unit tests include:

- Checking that mock error, performance, feedback, and deployment data have the correct structure.
- Testing filters for severity, event type, date, status, or deployment.
- Testing the logic that connects an issue to a related deployment/build signal.
- Testing helper functions that label issues as critical, warning, resolved, or unresolved.
- Testing dashboard summary counts, such as open errors or recent warnings.
- Testing the feedback widget logic, if we include it in the prototype.
- Testing display helper functions that turn mock data into readable labels or cards.
- Testing recurring checkup logic, if the MVP includes scheduled checks for the target software.

We should avoid writing too many tests for the visual design right now because the UI may still change. It makes more sense to get the prototype and dashboard layout working first.

## E2E Flow to Demonstrate

The main end-to-end demo should show WatchTower from a user’s point of view.

The flow should be:

1. If included in the prototype, enter or confirm a mock target URL for the software being monitored.
2. Open the WatchTower dashboard.
3. See the main overview with recent errors, performance warnings, upset user signals, and deployment/build signals.
4. Use a basic filter, such as severity or event type.
5. Click or select an issue from the dashboard.
6. Open the issue detail view.
7. Check that the issue detail shows the severity, timestamp, related users or feedback notes, and related deployment/build signal.
8. Go back to the dashboard.
9. If the feedback widget is included, submit a simple rating or feedback signal and show that it appears as an upset user signal.

This flow shows the main purpose of WatchTower: helping a team understand what went wrong and when it may have started.

## Manual Testing Checklist

For Sprint 1, there is not too much testing needed yet, so manual testing is enough as long as we show clear evidence. Before submitting, we should check that:

- The dashboard opens correctly.
- There are no major console errors.
- Mock data appears in the correct sections.
- Filters update the displayed issues correctly.
- The issue detail page matches the issue that was selected.
- Related deployment/build information is visible.
- The feedback widget works, if it is included.
- The page is readable on different screen sizes.
- Buttons and controls can be used with a keyboard.
- The text is clear and easy to understand.

## Testing Evidence in the Repo

We will show testing evidence directly in the repository. This makes it easier for graders and teammates to see what was tested.

The repo should include:

- This file at `docs/testing-plan.md`.
- Screenshots of the main E2E flow.
- A short manual testing notes file explaining what passed and what still needs work.
- Links in the notes to relevant images and files.
- A screenshot of the browser console if we want to show that there are no major errors.
- Terminal output later if we add automated tests.

Suggested files:

```text
docs/testing-plan.md
docs/testing-evidence/dashboard-loads.png
docs/testing-evidence/filter-by-severity.png
docs/testing-evidence/issue-detail-view.png
docs/testing-evidence/deployment-signal-link.png
docs/testing-evidence/manual-test-notes.md
```

## Sprint 1 Scope

For Sprint 1, the testing plan should stay lightweight. The prototype is mainly meant to prove the MVP direction and show that the core WatchTower flow makes sense. Automated tests can be added later once the prototype structure becomes more stable.


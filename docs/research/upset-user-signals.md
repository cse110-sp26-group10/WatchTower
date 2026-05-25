# User Feedback Signals - WatchTower MVP Research

A *build signal* marks a point in time where software changed. User feedback signals are the human side of that equation - they mark points in time where *users reacted* to what changed. Together, they let WatchTower answer: "Did this deploy upset people?"

## What Are User Feedback Signals?

User feedback signals are measurable expressions of user sentiment collected directly from the product. Unlike infrastructure metrics (error rates, latency), these signals capture the **lived experience** of the user - confusion, frustration, delight, or abandonment.

For WatchTower's MVP, the goal is to correlate these signals with build events to surface regressions in user experience automatically.

## Signal Types

### 1. ★ Star / Thumbs Rating Widgets

**What it is:** An inline micro-survey embedded in the UI - typically 1–5 stars, thumbs up/down, or an emoji scale - shown after a key user action (e.g. completing a purchase, finishing onboarding, submitting a form).

**What it captures:** Immediate, low-friction sentiment tied to a specific moment or feature.

**Example tools:** Hotjar, Delighted, custom inline widget

**How it appears in WatchTower:**
- Each rating submission is sent as an event with a `timestamp`, `score`, and optional `page` or `feature` tag
- WatchTower plots average rating over time and overlays build markers
- A sudden drop in average score after a deploy = regression flag
- Threshold alert: "Average rating fell below 3.5 within 2 hours of build `v2.4.1`"

```
Timeline view:
  ──────────●────────────▼──────────────────────
            Build        Rating avg drops: 4.2 → 2.8
            v2.4.1       🚨 Signal: Possible UX regression
```

### 2. 📋 Feedback Forms (Open Text)

**What it is:** A short-form text input - often triggered by a "Give feedback" button, a NPS follow-up, or an exit intent prompt - where users describe a problem in their own words.

**What it captures:** Qualitative detail that numeric scores miss. Users often name the exact broken thing ("the checkout button stopped working").

**Example tools:** Typeform, Intercom, native textarea widget

**How it appears in WatchTower:**
- Form submissions are stored with `timestamp`, `text`, and optional `user_id` / `session_id`
- WatchTower runs keyword/sentiment analysis on submissions in a rolling window
- Spike in negative keywords (e.g. "broken", "can't", "error", "slow") after a build = flag
- Build-correlated feedback feed: "14 users mentioned 'broken' within 90 min of deploy `v2.4.1`"

### 3. 😤 Complaint / Bug Report Events

**What it is:** Explicit signals that something is wrong - in-app bug report buttons, support ticket submissions, or structured "report a problem" flows.

**What it captures:** High-intent, high-signal frustration. A user filing a bug report is more upset than one clicking a low star.

**Example tools:** Zendesk, Linear, GitHub Issues, custom report button

**How it appears in WatchTower:**
- Each complaint/ticket is an event with `timestamp`, `category`, `severity`
- WatchTower tracks complaint volume over time, segmented by category
- Volume spike after a build triggers an alert with a linked build event
- Severity weighting: a "data loss" complaint counts more than a "cosmetic glitch"

### 4. 📊 CSAT - Customer Satisfaction Score

**What it is:** A post-interaction survey asking "How satisfied were you with [feature/session/support]?" scored 1–5 or 1–10.

**What it captures:** Feature-level satisfaction over time. More structured than open text, more granular than NPS.

**Example tools:** Delighted, SurveyMonkey, Intercom CSAT

**How it appears in WatchTower:**
- CSAT scores streamed as events with `timestamp`, `score`, `feature_context`
- WatchTower aggregates rolling CSAT per feature area
- Drops in CSAT for a specific feature after a deploy pinpoint *which part* of the release caused the regression

### 5. 🔢 NPS - Net Promoter Score

**What it is:** "How likely are you to recommend us to a friend?" scored 0–10. Responses bucket into Detractors (0–6), Passives (7–8), Promoters (9–10). Score = % Promoters − % Detractors.

**What it captures:** Overall brand/product sentiment. Typically surveyed periodically (monthly/quarterly) rather than in real-time.

**Example tools:** Delighted, Typeform, Wootric

**How it appears in WatchTower:**
- NPS score and category stored with `timestamp`
- Less suited to real-time build correlation, but useful for **release cycle retrospectives**
- WatchTower can show NPS trend alongside a release history view
- "NPS dropped 12 points in the week following the v2.4.0 feature launch"

## MVP Integration Plan

| Signal | Collection Method | WatchTower Hook | Alert Condition |
|---|---|---|---|
| Star Rating | Inline widget → event API | Rolling avg chart + build overlay | Avg drops ≥ 1 point within 2h of build |
| Feedback Form | Submit → event API | Keyword spike detector | >10 negative keywords in 1h window |
| Complaint / Bug | Ticket webhook | Volume spike chart | Volume 2× baseline within 4h of build |
| CSAT | Survey embed → event API | Per-feature score trend | Feature CSAT drops ≥ 20% post-deploy |
| NPS | Survey tool webhook | Release retrospective view | Week-over-week drop ≥ 10 points |

## Data Model (Proposed Event Shape)

```json
{
  "signal_type": "rating" | "feedback" | "complaint" | "csat" | "nps",
  "timestamp": "2025-06-01T14:32:00Z",
  "score": 2,
  "text": "The new checkout flow is broken on mobile",
  "feature_context": "checkout",
  "user_id": "u_abc123",
  "session_id": "sess_xyz",
  "build_id": "v2.4.1"   // optional - can be inferred by WatchTower from timestamp
}
```

## Implementation Notes for MVP

- **Lightweight first:** Start with a single thumbs rating widget on 1–2 key screens. This alone provides a time-series signal sufficient to prove the build-correlation concept.
- **Anonymous is fine:** User ID is optional. Timestamp + score is enough for trend detection.
- **Don't ask too often:** Triggered surveys (post-action) outperform timed popups. Rate-limit per user session.
- **Backend requirement:** An ingestion endpoint that accepts signal events and stores them with millisecond timestamps for accurate build alignment.
- **Build alignment logic:** WatchTower matches each signal event to the most recent build at or before its timestamp. This powers the "signals since last deploy" view.

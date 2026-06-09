# WatchTower — Design Brief

**Project:** WatchTower  
**Course:** CSE 110 — Software Engineering, UC San Diego, Spring 2026  
**Team:** Group 10  
**Version:** 1.0  

---

## 1. The Problem

Small software teams (startups, student projects, side projects) ship code constantly and have basically no idea what happens after it goes out. Tools like Datadog and Sentry exist but they're expensive, take forever to configure, and assume you have a dedicated SRE team. Most small teams don't.

So the gap looks like this: errors surface only when users complain. Downtime goes undetected for an hour. Nobody can answer "did my last push break something?" without checking five different places.

WatchTower is built to close that gap. It's a dashboard that captures errors, uptime status, page-load times, click events, and user feedback — and ties all of it back to the specific deployment that caused it. The goal is simple: any team member should be able to go from "something feels wrong" to "here's what broke and when" in under a minute.

---

## 2. Who Uses It

We designed WatchTower around three specific people, each with pretty different jobs to do.

**Alex — The Developer**  
Alex is a full-stack engineer at a startup, ships multiple times a week, and has maybe five years of experience but basically none with dedicated monitoring tools. When something breaks, Alex needs fast, specific answers: which route failed, what error type, which commit introduced it. The last thing they want is to spend an hour hunting through raw logs. WatchTower should feel like a faster version of that investigation — not a new tool to learn.

**Sam — The Team Lead**  
Sam manages a team of four to six developers and owns release decisions. They understand the system deeply but rarely write production code anymore. What Sam actually needs is a trustworthy high-level health signal, not raw log lines, not a wall of alerts. When a deployment goes out on a Friday afternoon, Sam needs to be able to answer "are we good?" without pinging three people on Slack. Alert fatigue is a real problem; if WatchTower fires too many false alarms, Sam stops trusting it entirely.

**Taylor — Customer Support**  
Taylor is non-technical and deals with user complaints directly. They can't read a stack trace, but they need enough objective evidence to say "this isn't just user error, there's a real bug" and back it up with specifics. Right now Taylor's day involves a lot of back-and-forth with engineers on Slack asking "is the site down?" WatchTower should let Taylor answer that themselves.

---

## 3. What It Needs to Do

| # | Who | What | Why It Matters |
|---|-----|------|----------------|
| 1 | Developer | Correlate an error spike to a specific deployment | Know immediately whether a recent push caused a regression |
| 2 | Developer | Filter errors by severity and time window | Focus on critical issues without noise from minor warnings |
| 3 | Developer | View page-load times grouped by route | Find slow paths without reading raw performance logs |
| 4 | Team Lead | Read the system status banner | Make a rollback decision in under 60 seconds |
| 5 | Team Lead | View summary counts (errors, loads, avg. rating) | Gauge overall health at a glance during or after a release |
| 6 | Team Lead | See a "Recent Activity" feed across all signal types | Reconstruct what happened leading up to a degradation |
| 7 | Support | Correlate a low user rating with a backend error | Write a specific, evidence-backed ticket for engineering |
| 8 | Support | Check whether a complaint is isolated or widespread | Respond to users accurately and confidently |
| 9 | Anyone | Get alerted when the site is unreachable | Know before users do |
| 10 | Anyone | Use the dashboard on any screen size or with a screen reader | No barriers |

---

## 4. Constraints

**Technical**

We're building with vanilla HTML, CSS, and JavaScript — no frameworks. This is intentional (see ADR-001): the codebase needs to be readable by everyone on the team regardless of what frameworks they know. The dashboard is fully client-rendered; there's no server-side rendering. Supabase handles the database (PostgreSQL under the hood) with Row-Level Security, and a Node.js server handles event ingestion and uptime monitoring.

The client-side tracker script also has a hard constraint: it has to be loadable via a single `<script>` tag with no build step. Whatever it does, it can't require the integrating app to set anything up.

**Project**

Ten people, three sprints, no budget. We're on Supabase free tier, GitHub Pages or Cloudflare Pages for hosting, and Twilio trial for SMS alerts. All pull requests over 300 lines need a human code reviewer — course requirement, slows things down but it's non-negotiable.

**Out of Scope for MVP**

- Historical uptime SLA reports  
- Role-based access control  
- Deep stack trace exploration (we capture high-level error messages only)  
- Native mobile app  

---

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tracker script blocks page load on the monitored site | Medium | High | All tracker operations are async; errors never propagate to the host page |
| False-positive uptime alerts (flapping) | Medium | Medium | Retries up to 3× before marking a site down; threshold is configurable |
| Event volume overwhelms the Supabase free tier | Low | High | Events are validated and size-capped server-side before insertion |
| Dashboard shows stale data and users stop trusting it | Medium | High | Polls every 5 seconds; "Updated at" timestamp is always visible |
| Merge conflicts and integration failures from parallel work | High | Medium | Feature branches, required PR reviews, CI linting/testing on every push |
| Twilio trial limits block SMS alert delivery | High | Low | Email fallback via Google API is implemented as a secondary channel |
| Accessibility gets deprioritized under deadline pressure | Medium | Medium | Accessibility user stories are in the sprint backlog; ARIA live regions and zoom layout are in the base component architecture |

---

## 6. Why Stability Is Non-Negotiable

Here's the thing about a monitoring tool: everyone opening the dashboard is already worried something is wrong. If WatchTower shows stale data, misses an outage, or fires false alerts at 3am — it becomes worse than not having a monitoring tool at all. A team that gets burned once by a flaky dashboard stops trusting it and goes back to finding out about outages from angry users on Twitter.

That shapes three specific requirements that run through every decision in this project:

**The tracker has to be invisible.** The JavaScript we embed in someone else's app cannot degrade that app's performance or throw uncaught errors. Every network call is fire-and-forget. The tracker wraps its own fetch calls in try/catch and never surfaces failures to the host page. No exceptions.

**The dashboard has to reflect reality quickly.** A status banner that says "Operational" ten minutes after the site went down is actively harmful. The 5-second polling interval and the visible "Updated at" timestamp exist to make the freshness of data explicit — so users can actually verify what they're seeing is current.

**Alerts have to mean something.** If WatchTower pages people too often, they start ignoring it. The retry logic on the uptime monitor (three attempts, five seconds apart) and severity-based error grouping are both there to cut false positives. When WatchTower raises an alarm, it should feel credible.

Stability isn't a feature we add at the end. It's the whole point.

---

*Document owner: Team 10 — CSE 110 SP26*

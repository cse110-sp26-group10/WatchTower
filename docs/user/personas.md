# WatchTower Personas: Deep Dive

To ensure WatchTower solves real-world problems for our target customers which are small, fast-moving software teams, we decided to design the product around the specific "Jobs to be Done" of our primary users. We created seperate personnas for different kinds of users/customers we are targetting: developers, team leads, and support staff.

---

## 1. Persona 1: Alex : The Software Engineer/Developer

**Demographics & Background**
* **Age:** 25
* **Occupation:** Full-Stack Software Engineer at a startup
* **Tech Proficiency:** Medium-High. Comfortable with code, IDEs, Git, and deploying applications. Has about 5 years of professional experience in this field. They are comfortable using various tech stacks including MERN, MEAN, and LAMP, but may not be an expert in any single one. They have limited to no experience in working with monitoring tools.
* **Context:** Alex is a fast-moving developer(vibe coder) who pushes code multiple times a week. They want to spend their time building features, not wrestling with infrastructure or hunting for needles in log haystacks to figure out what went wrong. They rely on speed and agility to meet aggressive deadlines.

**Goals**
* To ship code quickly and confidently without fear of breaking production.
* To instantly pinpoint the exact file and error message when their code breaks, so they can ship a fix before too many users notice or it spirals into something way bigger.
* To verify whether a bug reported by a user was introduced in the most recent code push.

**Pain Points and Daily Workflow**
* **Context Switching:** When an error is reported, Alex's workflow is interrupted. They hate having to open multiple different tools which they have limited to no experience in using, just to piece together what happened.
* **The "Unknown Unknown":** Fixing a bug is easy; finding the bug is hard. Vague reports of "ohh the site is slow or laggy" leave Alex completely blind without any proper error reports.
* **Vague Alerts:** Getting non-specific "the app is down" messages without any context makes their job so much harder.

**How They Use WatchTower**
* **Deployment Context:** Alex merges a PR updating the app's checkout logic. Ten minutes later, WatchTower flags a spike in `TypeErrors`. Alex opens the WatchTower dashboard and looks at the Errors Panel. 
* **Instant Correlation:** Crucially, WatchTower shows that 100% of these new errors are tagged with the commit Alex just used to deploy to GitHub. 
* **Fast Resolution:** Alex doesn't need to dig through raw logs; they instantly know the new checkout logic is flawed, revert the commit, and begin fixing the bug locally, drastically reducing the time it takes to resolve the issue.

---

## 2. Persona 2: Sam : The Team Lead

**Demographics & Background**
* **Age:** 35
* **Occupation:** Engineering Manager / Tech Lead.
* **Tech Proficiency:** Very High, they have a deep understanding of the system architecture but rarely code. Act more like managers but rarely push to production. Focuses heavily on system health, SLAs, and team velocity.
* **Context:** Sam oversees a team of 4-6 developers and manages the release pipeline. Their job is to protect the team from burnout while ensuring the business keeps making money. They job includes prioritizing which bugs are critical and which can wait.

**Goals**
* To keep the system operational and minimize downtime for end users.
* To have a high-level, trustworthy indicator of system health to confidently decide whether to let a release stand or trigger an immediate rollback.
* To foster alignment between Product and Engineering by having an objective source of truth when things go wrong.

**Pain Points and Daily Workflow**
* **Alert Fatigue:** Sam's phone buzzes constantly with low-priority warnings from noisy monitoring tools. This makes them paranoid that they will sleep through a legitimate outage.
* **The Blame Game:** When the site degrades, Product blames Engineering, Engineering blames DevOps. Sam spends too much of their day mediating instead of managing.
* **Blind Spots:** Finding out about critical system failures from angry users on Twitter or Reddit rather than internal monitoring tools.

**How They Use WatchTower**
* **High-Level Monitoring:** During a major Friday afternoon release, Sam monitors the WatchTower dashboard. The System Status Banner immediately flips from green "Operational" to red "Service Disruption."
* **Triaging Impact:** Sam sees that Error rates are climbing and User Feedback ratings are plummeting with comments about the site being broken. 
* **Decisive Action:** Sam doesn't need to read the specific stack traces; the high-level correlation between the deployment, the errors, and the user anger is enough. Sam presses the "Rollback" button in their CI/CD tool, restoring the previous stable version.

---

## 3. Persona 3: Taylor : Customer Support

**Demographics & Background**
* **Age:** 29
* **Occupation:** Customer Support.
* **Tech Proficiency:** Low-to-Medium. Cannot read code, but understands the product deeply from a functional perspective. Needs visual, intuitive dashboards. They can navigate the web and basic software tools but may struggle with complex technical interfaces like CLI and logging software.
* **Context:** Taylor is who deals with user complaints and the voice of the user internally. When users are angry, Taylor is the one who gets yelled at. They need to prove to engineering that a problem is real and widespread, not just "user error."

**Goals**
* To identify patterns in user complaints quickly and accurately.
* To know if a user's problem is an isolated incident or a systemic failure, so they can write good tickets that engineering can actually use.
* To provide users with accurate updates when a issue occurs.

**Pain Points and Daily Workflow**
* **Lack of Technical Proof:** Users submit tickets saying "It doesn't work," providing no browser info, URLs, or screenshots. Taylor spends hours going back and forth, only to have Engineering close the ticket.
* **The Information Silo:** Taylor has no idea when engineering pushes new code. They often spend time troubleshooting a "user error" only to find out engineering pushed a bug an hour ago.
* **Constant Pinging:** Having to constantly message engineers on Slack to ask "is the site down?" every time a user complains.

**How They Use WatchTower**
* **Verifying User Complaints:** A user submits an angry chat message: "I can't upload my profile picture!" Instead of asking the user to clear their cache, Taylor opens the WatchTower User Feedback panel.
* **Connecting Feedback to Errors:** Taylor sees the user's 1-star rating. Right next to it, WatchTower links a `503 Service Unavailable` error that occurred on the `/api/upload` route at the exact same timestamp.
* **Bridging the Gap:** Taylor immediately sees this is tied to a deployment that went out that morning. Taylor responds to the user confidently and links the WatchTower error trace directly to a high-priority Jira ticket for engineering.

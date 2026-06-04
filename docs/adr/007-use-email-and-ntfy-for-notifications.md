# Use Email and ntfy for User Notifications

## Context and Problem Statement

WatchTower needs to alert users when a monitored site reports errors or goes down. Detecting a problem is only useful if the responsible users actually find out, so we need one or more delivery channels to reach them outside the dashboard. The channels should be quick to build with the time and team we have, and should reach users through means they already pay attention to.

Which notification channels should WatchTower deliver alerts through?

## Considered Options

* Email (SMTP) plus ntfy push notifications
* SMS through a provider such as Twilio
* Chat webhooks (Slack / Discord)
* A custom, in-house notification delivery system

## Decision Outcome

Chosen option: **Email plus ntfy**, for two reasons:

* **Low integration overhead.** Both require very little to stand up and almost no infrastructure to maintain. ntfy publishes a notification with a single HTTP request to a topic and needs no SDK, and email goes out over standard SMTP. Neither obliges us to run or operate a delivery service of our own, unlike SMS (paid provider, account and number setup) or an in-house system (which we would have to build and keep running).
* **Familiar channels.** Email and phone push notifications are formats users already understand and check daily, so receiving alerts through them takes essentially no learning. A dedicated chat integration or a bespoke channel would ask users to adopt something less obvious.

How we adopted it:

* Each user has a private ntfy topic stored as their `alert_id`, and the server publishes pushes to it. Email is sent separately over Gmail SMTP (via `nodemailer`).
* The two channels are delivered independently, so a failure or outage in one never blocks the other.
* Users choose which channels they receive through a `notify_methods` preference (`["push"]`, `["email"]`, both, or none).

### Consequences

* Good, because both channels were fast to implement and add no service for us to operate.
* Good, because users receive alerts through formats they already use, lowering the barrier to adoption.
* Good, because two independent channels provide redundancy and let users opt into whichever fits them.
* Neutral, because each user must subscribe to their ntfy topic once (today by pasting the `alert_id`; a dashboard subscribe link or QR code is the intended path).
* Bad, because the public ntfy.sh server treats the topic name as the only secret, so privacy depends on the `alert_id` staying unguessable (hence a random UUID), and it does not allow anonymous email, which is why email runs through our own SMTP credentials.

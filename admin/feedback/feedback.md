# Team 10 Review of Team 8

## Overall Impression

Overall, we thought Team 8’s WatchTower project had a clear purpose and was easy to
understand. The project matches the main goal of WatchTower well because it focuses on
helping developers monitor apps, track errors, and look at performance data. We also liked that
the repo was organized into clear sections like frontend, backend, documentation, and planning,
which made it easier to explore.

## Strengths

One thing we liked was that the README gave a good overview of the project and explained
the general setup. The collector script also stood out because it connects directly to the purpose
of the project. It makes the app feel more like a real developer tool since it can collect errors and
performance information from another project.
We also liked that the team included CI/testing workflows. This shows that they are thinking
about code quality and not just the visual parts of the app. The overall idea is realistic because
developers would actually benefit from a tool that helps track errors, downtime and performance
issues.

## Improvements

One area that could be improved is the setup process for people outside the team. If the project
needs environment variables or database credentials, it would maybe be helpful to include a
`.env.example` file so reviewers know what values are needed.
It would also help to have clearer instructions for testing the app. For example, they could
include demo login information, mock data, or a short reviewer setup guide. This would make it
easier for someone outside the team to run the project without needing to contact them first.
The documentation could also be stronger with more screenshots of the dashboard, app detail
page, error logs, and alert flow. This would help reviewers understand the app even before
running it locally.
For CI, the workflows are a good start, but over time it would be better if linting and tests were
required to pass instead of being treated as optional checks.

## Question

How does Team 8 plan to let outside reviewers test the project if they do not have access to the
team’s environment files or database credentials?
Answer: When our website is actually hosted, the reviewers wouldn’t need such credentials as
they would be stored as secret keys on the hosting platform. If the reviewers need to locally test
our website then they would need to set up their own databases and add the connection link to
the environment file (for which a .env.example is a good suggestion). Publicly making the
database secret keys available is a dangerous thing to do, as hackers disguised as reviewers
would be able to edit the main database which is connected to real users. But we agree that a
thorough setup guide needs to be established.

## Suggestion

I think a good next step would be to add a “Reviewer Setup” section in the README. This could
include the commands to run the project, a `.env.example`, test account information,
screenshots, and common setup issues.

## What We Learned

One thing that we learned from Team 8’s project was how useful it is to separate the collector
script from the main app. It made the monitoring feature feel more realistic and gave us ideas
for how WatchTower can be presented more like a real tool that developers could add to their
own projects.

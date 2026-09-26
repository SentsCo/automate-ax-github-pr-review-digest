# Send one Slack digest for GitHub pull requests awaiting review

A weekday Slack digest gives reviewers a short list of older GitHub pull requests still waiting on them, with links back to the code.

Review requests can sit in GitHub while the team works in chat. A developer may miss the notification tab, and a generic channel feed makes it hard to see which requests still need attention.

This example checks one repository on weekdays and posts a digest of open, non-draft pull requests that still have requested people or teams after your chosen age. It links directly to each pull request and names those reviewers. GitHub remains the source of truth for review state.

## Set it up with a coding agent

Copy the setup prompt from [the article](https://automate.ax/articles/github-pr-review-digest) into your coding agent. The agent creates the Automate.ax project, asks for your choices, guides account authorization, checks the automation, and deploys it. You do not need to clone this repository yourself when using the prompt.

You'll choose:

- The GitHub owner and repository to inspect. The agent can find these from your authorized GitHub account.
- How old an open review request must be before it appears and the Slack channel for the digest.
- Account authorization for GitHub and Slack. Slack requires a paid workspace for the current Automate.ax connection.

## Manual setup

If you prefer to set it up yourself:

```sh
git clone https://github.com/SentsCo/automate-ax-github-pr-review-digest.git
cd automate-ax-github-pr-review-digest
bun install
bunx automate.ax login
bunx automate.ax init
bun run typecheck
bunx automate.ax deploy
```

Connect the accounts requested by Automate.ax when you deploy. The platform stores credentials outside this repository. Set any project parameters requested by the automation, then review the read and write operations before turning it on.

## Check a run

Use a test repository or a known open pull request with a requested reviewer. Run the automation and check its link, draft status, reviewer list, and age against GitHub.

## Limits

- This version reads the first 100 open pull requests. If it reaches that limit, the Slack message warns that the digest may be incomplete. A larger repository needs pagination before deployment.
- It uses pull request age as a simple threshold, not the time the latest reviewer was requested. Re-requesting a review does not reset that clock.
- GitHub also offers built-in notifications and scheduled reminders. Use this when a team wants a shared, filtered digest with its own age rule.

The workflow responds to [a real problem described by a developer's missed GitHub review requests](https://www.reddit.com/r/github/comments/1pt3mja). The public report informed the example; it is not an endorsement of this implementation.

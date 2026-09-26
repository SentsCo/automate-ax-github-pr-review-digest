import { automation, onSchedule, t, transform } from "automate.ax"
import { github } from "automate.ax/github"
import { slack } from "automate.ax/slack"
import { z } from "zod"

export default automation(
  "Send a focused pull request review digest",
  {
    parameters: [
      { label: "GitHub owner", name: "owner", type: "text" },
      { label: "GitHub repository", name: "repository", type: "text" },
      { label: "Slack channel ID", name: "slackChannelId", type: "text" },
      { label: "Minimum age in hours", name: "minimumAgeHours", type: "text" },
    ],
  },
  ({ parameters }) => {
    const minimumAgeHours = z.coerce
      .number()
      .positive()
      .parse(parameters.minimumAgeHours)
    const tick = onSchedule({ schedule: "0 9 * * 1-5", timeZone: "UTC" })
    const pullRequests = github.listPullRequests({
      owner: parameters.owner,
      repository: parameters.repository,
      state: "open",
      perPage: 100,
    })

    const pending = transform(
      [pullRequests, tick],
      (requests, { scheduledAt }) => ({
        atLimit: requests.length === 100,
        lines: requests
          .filter(
            (request) =>
              !request.draft &&
              ((request.requested_reviewers?.length ?? 0) > 0 ||
                (request.requested_teams?.length ?? 0) > 0) &&
              scheduledAt.getTime() - Date.parse(request.created_at) >=
                minimumAgeHours * 3_600_000,
          )
          .map(
            (request) =>
              `• #${request.number} ${request.title} — ${request.html_url} — waiting for ${[
                ...(request.requested_reviewers ?? []).map(
                  (reviewer) => reviewer.login,
                ),
                ...(request.requested_teams ?? []).map(
                  (team) => `team:${team.slug}`,
                ),
              ].join(", ")}`,
          ),
      }),
    ).filter(({ lines, atLimit }) => lines.length > 0 || atLimit)

    slack.sendMessage({
      conversation: parameters.slackChannelId,
      text: t`Pull requests awaiting review (first 100 open PRs):\n${pending.lines.transform((lines) => lines.join("\n"))}\n${pending.atLimit.transform((atLimit) => (atLimit ? "The page limit was reached. Add pagination before treating this digest as complete." : ""))}`.transform(
        escapeSlackText,
      ),
      unfurlLinks: false,
    })
  },
)

/** Keeps provider text from becoming Slack mentions or control markup. */
function escapeSlackText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

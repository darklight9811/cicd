// Packages
import * as core from "@actions/core"
import * as github from "@actions/github"

// Events
import push from "./events/push"

async function main () {
	// ------------------------------
	// Arguments
	// ------------------------------

	const config = {
		token: core.getInput("token", { required: true }),
		branch: {
			dev: core.getInput("dev-branch") || "dev",
			prod: core.getInput("prod-branch") || "prod",
		}
	}

	// ------------------------------
	// Setup
	// ------------------------------

	const client = github.getOctokit(config.token)
	const ctx = github.context
	
	// ------------------------------
	// Job
	// ------------------------------

	const { eventName: event, ref: rawBranch } = ctx
	const branch = rawBranch.replace("refs/heads", "")

	core.info(`Event "${event}" triggered${branch ? ` on branch ${branch}` : ""}`);

	({
		push,
	})[event](
		{
			branch,
			actions: core,
			client: client.rest,
			owner: ctx.repo.owner,
			repo: ctx.repo.repo,
		},
		config,
	)

}

main()
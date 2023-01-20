import * as core from "@actions/core"
import * as github from "@actions/github"

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

	core.info(JSON.stringify(ctx))
}

main()
// Utils
import { fromMarkdown, toMarkdown } from "../utils/markdown";
import run from "../utils/run";

export default run(async function push(ctx, config) {
	// check if is working branch
	if (ctx.branch !== config.branch.prod) {
		const response = await ctx.client.pulls.list({
			state: "open",
			owner: ctx.owner,
			repo: ctx.repo,
			base: config.branch[ctx.branch === "dev" ? "prod":"dev"],
		}).then(t => t.data.filter(t => t.head.ref.replace("refs/heads/", "") === ctx.branch))

		// only allow one pull request per branch to automate
		if (response.length > 1) {
			ctx.actions.error(`You have more than one pull request for ${ctx.branch}, for this automation to work you can only have one`)
		}

		// pull request already created, update
		if (response.length === 1) {
			const data = response[0]
			const markdown = fromMarkdown(data.body)

			if (!markdown) {
				ctx.actions.error(`Invalid markdown for the pull request ${data.id}`)
				return process.exit(1)
			}

			ctx.changes.forEach(t => markdown.changes.push(t))

			await ctx.client.pulls.update({
				owner: ctx.owner,
				repo: ctx.repo,
				pull_number: data.id,
				body: toMarkdown(markdown),
			})

			return
		}
		
		// create new pull request
		await ctx.client.pulls.create({
			owner: ctx.owner,
			repo: ctx.repo,
			base: config.branch[ctx.branch === "dev" ? "prod":"dev"],
			head: ctx.branch,
			title: `[wip] ${ctx.branch}`,
			draft: true,
			body: toMarkdown({
				title: ctx.branch,
				changes: ctx.changes,
				description: "",
			})
		})
	}
})

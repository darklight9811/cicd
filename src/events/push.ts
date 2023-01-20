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
			ctx.actions.info(`Branch ${ctx.branch} already has one pull request, we are updating it`)
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
				pull_number: data.number,
				body: toMarkdown(markdown),
			})
			ctx.actions.info("Pull request updated")
		}

		// create new pull request
		else {
			ctx.actions.info(`Creating new pull request for branch ${ctx.branch}`)

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

			ctx.actions.info("Created pull request")
		}
		
	}

	// update dev branch
	if (ctx.branch === config.branch.prod) {
		ctx.actions.info("Updating branches")
		const [work] = await Promise.all([
			ctx.client.repos.listBranches({
				owner: ctx.owner,
				repo: ctx.repo,
				protected: false,
				per_page: 20,
			})
		])
		
		await Promise.all([
			ctx.client.repos.merge({
				message: `update ${config.branch.dev}`,
				owner: ctx.owner,
				repo: ctx.repo,
				base: config.branch.dev,
				head: config.branch.prod,
			}),
			...work.data.map(t => ctx.client.repos.merge({
				message: `update ${config.branch.dev}`,
				owner: ctx.owner,
				repo: ctx.repo,
				base: t.name,
				head: config.branch.prod,
			}))
		])
		ctx.actions.info("Updated branches")
	}
	
	// update work branches
	else if (ctx.branch === config.branch.dev) {
		ctx.actions.info("Updating branches")
		const [work] = await Promise.all([
			ctx.client.repos.listBranches({
				owner: ctx.owner,
				repo: ctx.repo,
				protected: false,
				per_page: 20,
			})
		])
		
		await Promise.all(work.data.map(t => ctx.client.repos.merge({
			message: `update ${config.branch.dev}`,
			owner: ctx.owner,
			repo: ctx.repo,
			base: t.name,
			head: config.branch.prod,
		})))
		ctx.actions.info("Updated branches")
	}
})

import type Markdown from "../types/markdown"

export function fromMarkdown (body: string): Markdown | false {
	const lines = body.split("\n")
	const changesTitle = lines.indexOf("## Changes", 1)

	// verify
	if (
		!lines[0].match(/^#\s+/) ||
		changesTitle === -1
	){
		return false
	}

	// find description
	const description = lines.slice(1, changesTitle).join("\n")

	// find changes
	const changes = lines.slice(changesTitle + 1).map(t => t.replace("- ", ""))

	return {
		title: lines[0].replace("# ", ""),
		description,
		changes,
	}
}

export function toMarkdown(data: Markdown) {
	const filtered = data.changes.reduce((prev, curr) => {
		if (prev.at(-1) === curr) return prev

		return [...prev, curr]
	}, []).map(t => `- ${t}`).join("\n")

	return `# ${data.title}\n${data.description}\n## Changes\n${filtered}`
}
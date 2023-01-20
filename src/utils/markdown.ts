import type Markdown from "../types/markdown"

export function fromMarkdown (body: string): Markdown | false {
	const lines = body.split("\n")
	const changesTitle = lines.indexOf("# Changes", 1)

	// verify
	if (
		!lines[0].match(/^#\s+/) ||
		!lines.find(e => e.match("Changes"))
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
	return `# ${data.title}\n${data.description}\n# Changes\n${data.changes.map(t => `- ${t}`).join("\n")}`
}
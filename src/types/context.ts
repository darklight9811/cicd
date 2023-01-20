// Packages
import type * as core from "@actions/core";
import type { getOctokit } from "@actions/github";

type Context = {
	client: ReturnType<typeof getOctokit>["rest"];
	actions: typeof core;

	repo: string;
	owner: string;
	branch: string;
	changes: string[];
}

export default Context
// Types
import type Config from "../types/config";
import type Context from "../types/context";

export default function run (runner: (ctx: Context, config: Config) => Promise<void> | void) {
	return runner
}
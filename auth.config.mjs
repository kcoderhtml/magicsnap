import Slack from "@auth/core/providers/slack";
import { defineConfig } from "auth-astro";

export default defineConfig({
	providers: [
		Slack({
			clientId: import.meta.env.SLACK_CLIENT_ID,
			clientSecret: import.meta.env.SLACK_CLIENT_SECRET,
		}),
	],
});

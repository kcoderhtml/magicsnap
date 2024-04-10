import Slack from "@auth/core/providers/slack";
import { defineConfig } from "auth-astro";

export default defineConfig({
	providers: [
		Slack({
			clientId: import.meta.env.SLACK_CLIENT_ID,
			clientSecret: import.meta.env.SLACK_CLIENT_SECRET,
			checks: ["pkce", "nonce"],
			async profile(profile) {
				return {
					id: profile["https://slack.com/user_id"],
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					team: profile["https://slack.com/team_id"],
					teamName: profile["https://slack.com/team_name"],
					teamImage: profile["https://slack.com/team_image_230"],
				};
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				// User is available during sign-in
				token.team = user.team;
				token.teamName = user.teamName;
				token.teamImage = user.teamImage;
			}
			return token;
		},
		session({ session, token }) {
			if (token) {
				// Token is available during sign-in
				session.team = token.team;
				session.teamName = token.teamName;
				session.teamImage = token.teamImage;
			}
			return session;
		},
	},
});

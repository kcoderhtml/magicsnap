import Slack from "@auth/core/providers/slack";
import { defineConfig } from "auth-astro";
import { db, like, User } from "astro:db";

export default defineConfig({
	providers: [
		Slack({
			clientId: import.meta.env.SLACK_CLIENT_ID,
			clientSecret: import.meta.env.SLACK_CLIENT_SECRET,
			checks: ["pkce", "nonce"],
			async profile(profile) {
				const role = await db
					.select({ role: User.role })
					.from(User)
					.where(like(User.userId, profile["https://slack.com/user_id"]));

				console.log("Role:", role[0].role);

				return {
					id: profile["https://slack.com/user_id"],
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					team: profile["https://slack.com/team_id"],
					teamName: profile["https://slack.com/team_name"],
					teamImage: profile["https://slack.com/team_image_230"],
					role: role[0].role || "user",
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
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			if (token) {
				// Token is available during sign-in
				session.team = token.team;
				session.teamName = token.teamName;
				session.teamImage = token.teamImage;
				session.user.role = token.role;
			}
			return session;
		},
	},
});

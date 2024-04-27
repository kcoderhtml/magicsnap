import Slack from "@auth/core/providers/slack";
import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { db, like, User, Organization } from "astro:db";

export default defineConfig({
	providers: [
		Slack({
			clientId: import.meta.env.SLACK_CLIENT_ID,
			clientSecret: import.meta.env.SLACK_CLIENT_SECRET,
			checks: ["pkce", "nonce"],
			async profile(profile) {
				profile["https://slack.com/team_id"] =
					"slack-" + profile["https://slack.com/team_id"];

				const role = await db
					.select()
					.from(User)
					.where(
						like(User.userId, profile["https://slack.com/user_id"]) &&
							like(User.team, profile["https://slack.com/team_id"])
					);

				if (role.length === 0) {
					const users = await db
						.select()
						.from(User)
						.where(like(User.team, profile["https://slack.com/team_id"]));

					const organizations = await db
						.select()
						.from(Organization)
						.where(
							like(Organization.team, profile["https://slack.com/team_id"])
						);

					// check if the user is part of an organization in the db by checking if the team id is the same
					if (
						organizations
							.map((org) => org.team)
							.includes(profile["https://slack.com/team_id"])
					) {
						if (users.length === 0) {
							await db.insert(User).values({
								userId: profile["https://slack.com/user_id"],
								name: profile.name,
								email: profile.email,
								image: profile.picture,
								team: profile["https://slack.com/team_id"],
								role: "admin",
							});

							role[0] = { role: "admin" };
						} else {
							await db.insert(User).values({
								userId: profile["https://slack.com/user_id"],
								name: profile.name,
								email: profile.email,
								image: profile.picture,
								team: profile["https://slack.com/team_id"],
								role: "user",
							});

							role[0] = { role: "user" };
						}
					} else {
						role[0] = { role: "guest" };
					}
				}

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
		GitHub({
			clientId: import.meta.env.GITHUB_CLIENT_ID,
			clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
			checks: ["pkce", "nonce"],
			async profile(profile) {
				profile.node_id = "github-" + profile.node_id;

				const role = await db
					.select()
					.from(User)
					.where(like(User.userId, profile.id));

				if (role.length === 0) {
					const users = await db
						.select()
						.from(User)
						.where(like(User.team, profile.node_id));

					const organizations = await db
						.select()
						.from(Organization)
						.where(like(Organization.team, profile.node_id));

					// check if the user is part of an organization in the db by checking if the team id is the same
					if (organizations.map((org) => org.team).includes(profile.node_id)) {
						if (users.length === 0) {
							await db.insert(User).values({
								userId: profile.id,
								name: profile.name,
								email: profile.email,
								image: profile.avatar_url,
								team: profile.node_id,
								role: "admin",
							});

							role[0] = { role: "admin" };
						} else {
							await db.insert(User).values({
								userId: profile.id,
								name: profile.name,
								email: profile.email,
								image: profile.avatar_url,
								team: profile.node_id,
								role: "user",
							});

							role[0] = { role: "user" };
						}
					} else {
						role[0] = { role: "guest" };
					}
				}

				return {
					id: profile.id,
					name: profile.name,
					email: profile.email,
					image: profile.avatar_url,
					team: profile.node_id,
					teamName: profile.login,
					teamImage: profile.avatar_url,
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
				token.id = user.id;
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
				session.user.id = token.id;
			}
			return session;
		},
	},
});

import type { APIRoute } from "astro"
import { db, Invite, like, Organization } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
    const urlParams = new URLSearchParams(request.url.split("?")[1])
    const code = urlParams.get("code")
    const state = urlParams.get("state") || ""

    if (!code) {
        const error = "authorization_error";
        const errorDescription =
            "The authorization code was not provided in the request.";
        const queryParams = new URLSearchParams({ error, errorDescription });
        const redirectUrl = `/error?${queryParams.toString()}`;

        return new Response(null, {
            status: 302,
            headers: new Headers({
                Location: redirectUrl,
            }),
        });
    }

    const slackResponse = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.SLACK_CLIENT_ID || '',
            client_secret: process.env.SLACK_CLIENT_SECRET || '',
            redirect_uri: request.url.split("?")[0],
            code,
        }).toString(),
    });

    const slackData = await slackResponse.json();

    if (!slackData.ok) {
        const error = "authorization_error";
        const errorDescription = slackData.error;
        const queryParams = new URLSearchParams({ error, errorDescription });
        const redirectUrl = `/error?${queryParams.toString()}`;

        return new Response(null, {
            status: 302,
            headers: new Headers({
                Location: redirectUrl,
            }),
        });
    }

    // check if the team is already in the database

    const teamExists = await db.select().from(Organization).where(like(Organization.team, slackData.team.id)).all();

    if (teamExists.length > 0) {
        const error = "authorization_error";
        const errorDescription = "This team is already registered.";
        const queryParams = new URLSearchParams({ error, errorDescription });
        const redirectUrl = `/error?${queryParams.toString()}`;

        return new Response(null, {
            status: 302,
            headers: new Headers({
                Location: redirectUrl,
            }),
        });
    }

    const teamProfileResponse = await fetch("https://slack.com/api/team.info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${slackData.access_token}`,
        },
        body: JSON.stringify({
            team: slackData.team.id,
        }),
    });

    const teamProfileData = await teamProfileResponse.json();

    await db.insert(Organization).values({
        team: slackData.team.id,
        name: slackData.team.name,
        image: teamProfileData.team.icon.image_132,
    });

    const invite = (await db.select().from(Invite).where(like(Invite.verificationCode, state)))[0];

    return new Response(null, {
        status: 302,
        headers: new Headers({
            Location: `/join/${state}?verification=${invite.installationToken}`,
        }),
    });

    return new Response(null);
}
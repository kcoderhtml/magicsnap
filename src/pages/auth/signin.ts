import { jwtDecode } from "jwt-decode";
import { db, Organization, User, eq } from 'astro:db';

export async function GET({ params, request }: { params: any, request: any }) {
    const baseUrl = process.env.BASEURL === "preview" ? "{BASEURL}" : process.env.BASEURL;

    function response(error: string) {
        return new Response("", { status: 302, headers: { "Location": `/auth/error?error=${encodeURIComponent(error)}` } });
    }

    // check if the token cookie is present
    if (request.cookies && request.cookies.get("token") !== undefined) {
        return new Response("", { status: 302, headers: { "Location": "/dashboard" } });
    }

    const code = new URLSearchParams(request.url.split("?")[1]).get("code");

    if (code === null) {
        return response("It seems you have not provided me with a code!");
    }

    const slackToken = await (await fetch("https://slack.com/api/openid.connect.token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code: code,
            client_id: process.env.SLACK_CLIENT_ID as string,
            client_secret: process.env.SLACK_CLIENT_SECRET as string,
            redirect_uri: `${baseUrl}/auth/signin`
        })
    })).json();

    if (!slackToken.ok) {
        return response("It seems like the token is not valid!");
    }

    type SlackProfile = {
        iss: string,
        sub: string
        aud: string,
        exp: number,
        iat: number,
        auth_time: number,
        nonce: string,
        at_hash: string,
        'https://slack.com/team_id': string,
        'https://slack.com/user_id': string,
        locale: string,
        name: string,
        picture: string,
        given_name: string,
        family_name: string,
        'https://slack.com/team_name': string,
        'https://slack.com/team_domain': string,
        'https://slack.com/team_image_230': string,
        'https://slack.com/team_image_default': boolean
    }

    const profile: SlackProfile = jwtDecode(slackToken.id_token);

    console.log(profile);

    if (profile === null) {
        return response("It seems like the profile is not valid!");
    }

    // check if the organization exists
    const org = await db.select().from(Organization).where(eq(Organization.orgId, profile['https://slack.com/team_id']));

    if (org.length === 0) {
        return response("It seems like the organization is not valid!");
    }

    // add the user to the database if they don't exist but if they do, update the token and expiration
    const user = await db.select().from(User).where(eq(User.userId, profile['https://slack.com/user_id']));

    const hashedToken = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(slackToken.access_token)).then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));

    if (user.length === 0) {
        await db.insert(User).values([
            { userId: profile['https://slack.com/user_id'], orgId: profile["https://slack.com/team_id"], token: hashedToken, expiration: new Date(Date.now() + 60 * 60 * 1000) }
        ]);
    } else {
        await db.update(User).set({ token: hashedToken, expiration: new Date(Date.now() + 60 * 60 * 1000) }).where(eq(User.userId, profile['https://slack.com/user_id']));
    }

    // set the token in the local storage
    const cookie = `token=${hashedToken}; Path=/; Secure; HttpOnly; SameSite=Strict; Expires=${new Date(Date.now() + 60 * 60 * 1000).toUTCString()}`;
    return new Response("", { status: 302, headers: { "Location": "/dashboard", "Set-Cookie": cookie } });
}

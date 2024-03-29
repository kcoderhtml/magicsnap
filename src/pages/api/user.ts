import { jwtDecode } from "jwt-decode";
import { db, Organization, User, eq } from 'astro:db';

export async function GET({ params, request }: { params: any, request: any }) {
    const baseUrl = process.env.BASEURL === "preview" ? "{BASEURL}" : process.env.BASEURL;

    function errorResponse(error: string) {
        return new Response(error, { status: 401 });
    }

    // get the token from the bearer token
    const token = request.headers.get("Authorization")
    console.log(token);

    // check if the token cookie is present
    if (token == undefined) {
        return errorResponse("You are not authenticated!");
    }

    const hashedToken = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));

    // check if the token is valid
    const user = await db.select().from(User).where(eq(User.token, hashedToken));

    if (user.length == 0) {
        return errorResponse("You are not authenticated!");
    }

    // check if the token is expired and remove it
    if (new Date(user[0].expiration) < new Date()) {
        await db.delete(User).where(eq(User.token, hashedToken));
        return errorResponse("Your session has expired!");
    }

    // get information about the user from the slack api
    const SlackProfile = await fetch("https://slack.com/api/openid.connect.userinfo", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json());

    // refresh the date of the cookie
    const cookie = `token=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Expires=${new Date(Date.now() + 60 * 60 * 1000).toUTCString()}`;

    return new Response(JSON.stringify(SlackProfile), { status: 200, headers: { "Set-Cookie": cookie } });
}

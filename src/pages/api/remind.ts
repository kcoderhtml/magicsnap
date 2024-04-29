import type { APIRoute } from "astro"
import { db, User, Organization, Event } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    // get authorization header
    const auth = request.headers.get("Authorization")

    if (auth === process.env.API_SECRET) {
        const events = await db.select().from(Event)
        const users = await db.select().from(User)
        const organizations = await db.select().from(Organization)

        console.log(`Found ${events.length} events and ${users.length} users`)

        const eventsHappeningToday = events.filter((e) => {
            const eventDate = new Date(e.date)
            const now = new Date()
            const diff = eventDate.getTime() - now.getTime()
            const diffHours = diff / (1000 * 60 * 60)
            return diffHours < 24 && diffHours > 0
        })

        return new Response(JSON.stringify({
            ok: true, eventsHappeningToday: eventsHappeningToday, users: users, organizations: organizations
        }), { status: 200 })
    } else {
        return new Response(JSON.stringify({
            ok: false, error: "Unauthorized"
        }), { status: 401 })
    }
}
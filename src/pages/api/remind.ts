import type { APIRoute } from "astro"
import { db, like, User, Organization, Event } from "astro:db";

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

        console.log(`Found ${eventsHappeningToday.length} events happening in the next 24 hours`)

        for (const org of organizations) {
            const teamMembers = users.filter((u) => u.team === org.team)
            console.log(`Organization: ${org.name} has ${teamMembers.length} team members`)

            for (const member of teamMembers) {
                console.log(`Member: ${member.name} (${member.email})`)

                // get all events that the user is going to
                const eventsGoing = eventsHappeningToday.filter((e) => e.statusGoing.includes(member.userId))
                console.log(`Found ${eventsGoing.length} events going`)

                // get all events that the user is maybe going to
                const eventsMaybe = eventsHappeningToday.filter((e) => e.statusMaybe.includes(member.userId))
                console.log(`Found ${eventsMaybe.length} events maybe going`)

                // get all events that the user is not going to
                const eventsNotGoing = eventsHappeningToday.filter((e) => e.statusNotGoing.includes(member.userId))
                console.log(`Found ${eventsNotGoing.length} events not going`)

                // send email to user

                const message = `Hey ${member.name},\nJust a friendly reminder about your schedule for tomorrow, ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:`;
                let emailMessage = message;

                if (eventsGoing.length > 0) {
                    const going = eventsGoing.map((e) => `* **${e.name}** at ${new Date(e.date).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })} in ${e.location}`).join("\n");
                    emailMessage += "\n\n**Events you're attending:**\n" + going;
                }

                if (eventsMaybe.length > 0) {
                    const maybe = eventsMaybe.map((e) => `* **${e.name}** at ${e.date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })} in ${e.location}`).join("\n");
                    emailMessage += "\n\n**Events you might be attending:**\n" + maybe;
                }

                if (eventsNotGoing.length > 0) {
                    const notGoing = eventsNotGoing.map((e) => `* **${e.name}** at ${e.date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })} in ${e.location}`).join("\n");
                    emailMessage += "\n\n**Events you declined:**\n" + notGoing;
                }

                if (eventsGoing.length === 0 && eventsMaybe.length === 0 && eventsNotGoing.length === 0) {
                    emailMessage += "\n\nLooks like you have a free day tomorrow! Enjoy!";
                }

                emailMessage += "\n\nDon't forget to stay organized and have a productive day!";


                console.log(`Sending email to ${member.email}`)
                console.log(emailMessage)
                const response = await fetch("https://email.magicsnap.org/api/email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: process.env.EMAIL_API_KEY || "",
                    },
                    body: JSON.stringify({
                        to: member.email,
                        from: "events@magicsnap.org",
                        subject: "Event Reminder for " + new Date().toDateString(),
                        markdown: emailMessage,
                    }),
                });

                if (!response.ok) {
                    console.error(`Failed to send email to ${member.email}`)
                    console.error(await response.text())

                    return new Response(JSON.stringify({
                        ok: false, error: "Failed to send email"
                    }), { status: 500 })
                }
            }
        }

        return new Response(JSON.stringify({
            ok: true, message: "Reminders sent"
        }), { status: 200 })
    } else {
        return new Response(JSON.stringify({
            ok: false, error: "Unauthorized"
        }), { status: 401 })
    }
}
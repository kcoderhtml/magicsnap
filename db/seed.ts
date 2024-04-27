import { db, Invite, Event, Organization } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Organization).values([
    {
      team: "slack-T0266FRGM",
      name: "Hack Club",
      image:
        "https://avatars.slack-edge.com/2022-04-01/3330920659891_26353517af684373601b_230.png",
    },
  ]);
  await db.insert(Event).values([
    {
      team: "T0266FRGM",
      name: "Hackclub Meeting",
      comments: "This is a test event",
      date: new Date(),
      location: "Some location",
      statusGoing: "",
      statusMaybe: "",
      statusNotGoing: "U062UG485EE",
    },
  ]);

  await db.insert(Invite).values([
    {
      verificationCode: "123456",
      teamName: "Hack Club",
      installationToken: "xoxb-123456",
    },
  ]);
}

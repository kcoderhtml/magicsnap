import { db, User, Organization, Event } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Organization).values([
		{ team: 'T0266FRGM', name: 'Hackclub', image: 'https://avatars.slack-edge.com/2022-04-01/3330920659891_26353517af684373601b_230.png' },
	]);

	await db.insert(User).values([
		{ userId: 'U062UG485EE', team: 'T0266FRGM', name: 'Kieran', email: 'test@test.com', image: 'https://avatars.slack-edge.com/2023-11-05/6146547827571_b208ddface0cda2b3978_512.jpg', role: 'admin' },
	]);

	await db.insert(Event).values([
		{ eventId: 'E0266FRGM', team: 'T0266FRGM', name: 'Hackclub Meeting', comments: 'This is a test event', date: new Date(), location: 'Some location' },
	]);
}
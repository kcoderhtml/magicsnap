import { db, User, Organization, Event } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Event).values([
		{ team: 'T0266FRGM', name: 'Hackclub Meeting', comments: 'This is a test event', date: new Date(), location: 'Some location', statusGoing: '', statusMaybe: '', statusNotGoing: 'U062UG485EE' },
	]);
}
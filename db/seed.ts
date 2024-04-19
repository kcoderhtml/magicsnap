import { db, Invite, Event } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Event).values([
		{ team: 'T0266FRGM', name: 'Hackclub Meeting', comments: 'This is a test event', date: new Date(), location: 'Some location', statusGoing: '', statusMaybe: '', statusNotGoing: 'U062UG485EE' },
	]);

	await db.insert(Invite).values([
		{ verificationCode: '123456', teamName: 'Hack Club', installationToken: 'xoxb-123456' },
	]);
}
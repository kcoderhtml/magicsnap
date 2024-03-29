import { db, User, Organization, Event } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Organization).values([
		{ orgId: 'T0266FRGM', name: 'Hackclub' }
	]);
}
import { defineDb, defineTable, column } from "astro:db";

const Organization = defineTable({
  columns: {
    team: column.text({ primaryKey: true }),
    name: column.text(),
    image: column.text(),
    lastMessageHash: column.text({ optional: true, default: "" }),
  },
  indexes: {
    teamx: { on: ["team"], unique: true },
  },
});

const User = defineTable({
  columns: {
    userId: column.text({ primaryKey: true }),
    team: column.text(),
    name: column.text(),
    email: column.text(),
    image: column.text(),
    role: column.text(),
    allergies: column.text({ optional: true }),
  },
  indexes: {
    userIdx: { on: ["userId"], unique: true },
  },
});

const Event = defineTable({
  columns: {
    id: column.number({ primaryKey: true, unique: true }),
    team: column.text(),
    name: column.text(),
    comments: column.text(),
    date: column.date(),
    location: column.text(),
    statusGoing: column.text(),
    statusMaybe: column.text(),
    statusNotGoing: column.text(),
  },
  indexes: {
    idx: { on: ["id"], unique: true },
  },
});

const Invite = defineTable({
  columns: {
    verificationCode: column.text({ primaryKey: true }),
    teamName: column.text(),
    installationToken: column.text(),
  },
  indexes: {
    verificationCodeIdx: { on: ["verificationCode"], unique: true },
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Organization, User, Event, Invite },
});

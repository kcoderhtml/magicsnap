import { defineDb, defineTable, column } from 'astro:db';


const Organization = defineTable({
  columns: {
    team: column.text({ primaryKey: true }),
    name: column.text(),
    image: column.text(),
  },
  indexes: {
    teamx: { on: ["team"], unique: true },
  }
})

const User = defineTable({
  columns: {
    userId: column.text({ primaryKey: true }),
    team: column.text(),
    name: column.text(),
    email: column.text(),
    image: column.text(),
    role: column.text(),
  },
  indexes: {
    userIdx: { on: ["userId"], unique: true },
  }
})

const Event = defineTable({
  columns: {
    eventId: column.text({ primaryKey: true }),
    team: column.text(),
    name: column.text(),
    comments: column.text(),
    date: column.date(),
    location: column.text(),
  },
  indexes: {
    eventIdx: { on: ["eventId"], unique: true },
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: { Organization, User, Event },
});

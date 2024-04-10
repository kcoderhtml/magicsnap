import { defineDb, defineTable, column } from 'astro:db';


const Organization = defineTable({
  columns: {
    orgId: column.text({ primaryKey: true }),
    name: column.text(),
  },
  indexes: {
    orgIdx: { on: ["orgId"], unique: true },
  }
})

const User = defineTable({
  columns: {
    userId: column.text({ primaryKey: true }),
    orgId: column.text(),
    token: column.text(),
    expiration: column.date(),
  },
  indexes: {
    userIdx: { on: ["userId"], unique: true },
  }
})

const Event = defineTable({
  columns: {
    eventId: column.text({ primaryKey: true }),
    orgId: column.text(),
    name: column.text(),
    comments: column.text(),
    date: column.date(),
  },
  indexes: {
    eventIdx: { on: ["eventId"], unique: true },
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: { Organization, User, Event },
});
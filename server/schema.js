import { date, doublePrecision, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    client: text("client").notNull(),
    taxId: text("tax_id").notNull(),
    department: text("department").notNull(),
    category: text("category").notNull(),
    technician: text("technician").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    hours: doublePrecision("hours").notNull(),
    // numeric avoids floating point drift on money; mode "number" gives JS numbers back.
    amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});


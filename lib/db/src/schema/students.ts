import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  enrollmentDate: date("enrollment_date", { mode: "string" }).notNull(),
  graduationYear: integer("graduation_year"),
  major: text("major").notNull(),
  gpa: real("gpa"),
  status: text("status", { enum: ["active", "inactive", "graduated", "suspended"] }).notNull().default("active"),
  year: text("year", { enum: ["freshman", "sophomore", "junior", "senior", "graduate"] }).notNull(),
  photoUrl: text("photo_url"),
  address: text("address"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;

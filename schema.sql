-- ============================================================
--  SUAS Student Profile Manager — Database Schema
-- ============================================================

CREATE TABLE "students" (
  "id"              serial PRIMARY KEY NOT NULL,
  "first_name"      text NOT NULL,
  "last_name"       text NOT NULL,
  "email"           text NOT NULL,
  "phone"           text,
  "date_of_birth"   date,
  "enrollment_date" date NOT NULL,
  "graduation_year" integer,
  "major"           text NOT NULL,
  "gpa"             real,
  "status"          text DEFAULT 'active' NOT NULL,
  "year"            text NOT NULL,
  "photo_url"       text,
  "address"         text,
  "bio"             text,
  "created_at"      timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "students_email_unique" UNIQUE("email")
);

CREATE TABLE "auth_users" (
  "id"            serial PRIMARY KEY NOT NULL,
  "name"          text NOT NULL,
  "email"         text NOT NULL,
  "password_hash" text NOT NULL,
  "role"          text DEFAULT 'student' NOT NULL,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);

CREATE TABLE "leave_types" (
  "id"         serial PRIMARY KEY NOT NULL,
  "name"       text NOT NULL,
  "total_days" integer NOT NULL
);

CREATE TABLE "leave_applications" (
  "id"              serial PRIMARY KEY NOT NULL,
  "applicant_name"  text NOT NULL,
  "applicant_email" text NOT NULL,
  "leave_type_id"   integer NOT NULL REFERENCES "leave_types"("id"),
  "from_date"       date NOT NULL,
  "to_date"         date NOT NULL,
  "total_days"      integer NOT NULL,
  "reason"          text NOT NULL,
  "status"          text DEFAULT 'pending' NOT NULL,
  "created_at"      timestamp with time zone DEFAULT now() NOT NULL
);

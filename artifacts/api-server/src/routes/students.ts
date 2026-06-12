import { Router, type IRouter, type Request, type Response } from "express";
import { eq, ilike, and, desc, sql, type SQL } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  GetStudentParams,
  GetStudentResponse,
  UpdateStudentParams,
  UpdateStudentBody,
  UpdateStudentResponse,
  DeleteStudentParams,
  ListStudentsResponse,
  GetStudentStatsResponse,
  GetRecentStudentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students/stats", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(studentsTable);

  const byStatus = { active: 0, inactive: 0, graduated: 0, suspended: 0 };
  const byYear = { freshman: 0, sophomore: 0, junior: 0, senior: 0, graduate: 0 };
  const majorMap: Record<string, number> = {};

  let gpaSum = 0;
  let gpaCount = 0;
  const gpaRanges = { "Below 2.5": 0, "2.5 – 3.0": 0, "3.0 – 3.5": 0, "3.5 – 4.0": 0 };

  for (const s of rows) {
    byStatus[s.status as keyof typeof byStatus]++;
    byYear[s.year as keyof typeof byYear]++;
    majorMap[s.major] = (majorMap[s.major] ?? 0) + 1;
    if (s.gpa != null) {
      gpaSum += s.gpa;
      gpaCount++;
      if (s.gpa < 2.5) gpaRanges["Below 2.5"]++;
      else if (s.gpa < 3.0) gpaRanges["2.5 – 3.0"]++;
      else if (s.gpa < 3.5) gpaRanges["3.0 – 3.5"]++;
      else gpaRanges["3.5 – 4.0"]++;
    }
  }

  const byMajor = Object.entries(majorMap)
    .map(([major, count]) => ({ major, count }))
    .sort((a, b) => b.count - a.count);

  const gpaDistribution = Object.entries(gpaRanges).map(([range, count]) => ({ range, count }));

  const stats = {
    total: rows.length,
    byStatus,
    byYear,
    byMajor,
    averageGpa: gpaCount > 0 ? Math.round((gpaSum / gpaCount) * 100) / 100 : null,
    gpaDistribution,
  };

  res.json(GetStudentStatsResponse.parse(stats));
});

router.get("/students/recent", async (req: Request, res: Response): Promise<void> => {
  const students = await db
    .select()
    .from(studentsTable)
    .orderBy(desc(studentsTable.createdAt))
    .limit(5);

  res.json(GetRecentStudentsResponse.parse(
    students.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))
  ));
});

router.get("/students", async (req: Request, res: Response): Promise<void> => {
  const query = ListStudentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search, status, major, year } = query.data;
  const conditions: SQL[] = [];

  if (search) {
    conditions.push(
      sql`(${ilike(studentsTable.firstName, `%${search}%`)} OR ${ilike(studentsTable.lastName, `%${search}%`)} OR ${ilike(studentsTable.email, `%${search}%`)})`
    );
  }
  if (status) conditions.push(eq(studentsTable.status, status));
  if (major) conditions.push(eq(studentsTable.major, major));
  if (year) conditions.push(eq(studentsTable.year, year));

  const students = await db
    .select()
    .from(studentsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(studentsTable.createdAt));

  res.json(ListStudentsResponse.parse(students.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))));
});

router.post("/students", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [student] = await db
    .insert(studentsTable)
    .values({ ...parsed.data, status: parsed.data.status ?? "active" })
    .returning();

  res.status(201).json(GetStudentResponse.parse({ ...student, createdAt: student.createdAt.toISOString() }));
});

router.get("/students/:id", async (req: Request, res: Response): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(GetStudentResponse.parse({ ...student, createdAt: student.createdAt.toISOString() }));
});

router.patch("/students/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [student] = await db
    .update(studentsTable)
    .set(parsed.data)
    .where(eq(studentsTable.id, params.data.id))
    .returning();

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(UpdateStudentResponse.parse({ ...student, createdAt: student.createdAt.toISOString() }));
});

router.delete("/students/:id", async (req: Request, res: Response): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db.delete(studentsTable).where(eq(studentsTable.id, params.data.id)).returning();

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

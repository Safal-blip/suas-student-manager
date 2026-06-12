import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db, leaveTypesTable, leaveApplicationsTable } from "@workspace/db";
import {
  ListLeavesQueryParams,
  ApplyForLeaveBody,
  UpdateLeaveStatusParams,
  UpdateLeaveStatusBody,
  ListLeavesResponse,
  UpdateLeaveStatusResponse,
  ListLeaveTypesResponse,
  GetLeaveStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leave-types", async (_req: Request, res: Response): Promise<void> => {
  const types = await db.select().from(leaveTypesTable).orderBy(leaveTypesTable.id);
  res.json(ListLeaveTypesResponse.parse(types.map(t => ({ id: t.id, name: t.name, totalDays: t.totalDays }))));
});

router.get("/leaves/stats", async (_req: Request, res: Response): Promise<void> => {
  const leaves = await db.select().from(leaveApplicationsTable);
  const types = await db.select().from(leaveTypesTable);

  const byTypeMap: Record<number, number> = {};
  let pending = 0, approved = 0, rejected = 0;

  for (const l of leaves) {
    if (l.status === "pending") pending++;
    else if (l.status === "approved") approved++;
    else if (l.status === "rejected") rejected++;
    byTypeMap[l.leaveTypeId] = (byTypeMap[l.leaveTypeId] ?? 0) + 1;
  }

  const byType = types.map(t => ({ name: t.name, count: byTypeMap[t.id] ?? 0 }));

  res.json(GetLeaveStatsResponse.parse({ total: leaves.length, pending, approved, rejected, byType }));
});

router.get("/leaves", async (req: Request, res: Response): Promise<void> => {
  const query = ListLeavesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const leaves = await db
    .select({
      id: leaveApplicationsTable.id,
      applicantName: leaveApplicationsTable.applicantName,
      applicantEmail: leaveApplicationsTable.applicantEmail,
      leaveTypeId: leaveApplicationsTable.leaveTypeId,
      leaveTypeName: leaveTypesTable.name,
      fromDate: leaveApplicationsTable.fromDate,
      toDate: leaveApplicationsTable.toDate,
      totalDays: leaveApplicationsTable.totalDays,
      reason: leaveApplicationsTable.reason,
      status: leaveApplicationsTable.status,
      createdAt: leaveApplicationsTable.createdAt,
    })
    .from(leaveApplicationsTable)
    .leftJoin(leaveTypesTable, eq(leaveApplicationsTable.leaveTypeId, leaveTypesTable.id))
    .orderBy(desc(leaveApplicationsTable.createdAt));

  const filtered = query.data.status
    ? leaves.filter(l => l.status === query.data.status)
    : leaves;

  res.json(
    ListLeavesResponse.parse(
      filtered.map(l => ({
        ...l,
        leaveTypeName: l.leaveTypeName ?? "Unknown",
        createdAt: l.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/leaves", async (req: Request, res: Response): Promise<void> => {
  const parsed = ApplyForLeaveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [leave] = await db
    .insert(leaveApplicationsTable)
    .values({ ...parsed.data, status: "pending" })
    .returning();

  const [type] = await db
    .select()
    .from(leaveTypesTable)
    .where(eq(leaveTypesTable.id, leave.leaveTypeId));

  res.status(201).json(
    UpdateLeaveStatusResponse.parse({
      ...leave,
      leaveTypeName: type?.name ?? "Unknown",
      createdAt: leave.createdAt.toISOString(),
    })
  );
});

router.patch("/leaves/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateLeaveStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLeaveStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [leave] = await db
    .update(leaveApplicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(leaveApplicationsTable.id, params.data.id))
    .returning();

  if (!leave) {
    res.status(404).json({ error: "Leave application not found" });
    return;
  }

  const [type] = await db
    .select()
    .from(leaveTypesTable)
    .where(eq(leaveTypesTable.id, leave.leaveTypeId));

  res.json(
    UpdateLeaveStatusResponse.parse({
      ...leave,
      leaveTypeName: type?.name ?? "Unknown",
      createdAt: leave.createdAt.toISOString(),
    })
  );
});

export default router;

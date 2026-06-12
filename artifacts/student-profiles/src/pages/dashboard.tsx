import React from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentStats, useGetRecentStudents, useGetLeaveStats, useListLeaveTypes } from "@workspace/api-client-react";
import { Users, GraduationCap, AlertCircle, BookOpen, Clock, ChevronRight, XCircle, CheckCircle } from "lucide-react";
import { GpaDisplay } from "@/components/gpa-display";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStudentStats();
  const { data: recentStudents, isLoading: recentLoading } = useGetRecentStudents();
  const { data: leaveStats, isLoading: leaveStatsLoading } = useGetLeaveStats();

  const PIE_COLORS_STATUS = {
    active: '#22c55e',
    inactive: '#94a3b8',
    graduated: '#6366f1',
    suspended: '#ef4444'
  };

  const PIE_COLORS_GPA = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  
  const statusData = stats ? Object.entries(stats.byStatus).map(([key, value]) => ({ name: key, value })) : [];
  const yearData = stats ? Object.entries(stats.byYear).map(([key, value]) => ({ name: key, students: value })) : [];
  const majorData = stats?.byMajor || [];
  const gpaData = stats?.gpaDistribution || [];
  
  const leaveStatusData = leaveStats ? [
    { name: 'Pending', value: leaveStats.pending },
    { name: 'Approved', value: leaveStats.approved },
    { name: 'Rejected', value: leaveStats.rejected }
  ] : [];

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of institutional academic records.</p>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={statsLoading ? null : stats?.total}
            icon={Users}
            description="Currently enrolled"
          />
          <StatCard
            title="Active Students"
            value={statsLoading ? null : stats?.byStatus?.active}
            icon={BookOpen}
            description="In good standing"
          />
          <StatCard
            title="Graduated"
            value={statsLoading ? null : stats?.byStatus?.graduated}
            icon={GraduationCap}
            description="Alumni network"
          />
          <StatCard
            title="Average GPA"
            value={statsLoading ? null : stats?.averageGpa?.toFixed(2)}
            icon={AlertCircle}
            description="Across all years"
            isGpa
          />
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Pending Leaves"
            value={leaveStatsLoading ? null : leaveStats?.pending}
            icon={Clock}
            description="Awaiting approval"
          />
          <StatCard
            title="Approved Leaves"
            value={leaveStatsLoading ? null : leaveStats?.approved}
            icon={CheckCircle}
            description="Approved requests"
          />
          <StatCard
            title="Suspended Students"
            value={statsLoading ? null : stats?.byStatus?.suspended}
            icon={XCircle}
            description="Requires attention"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Student Status</CardTitle>
              <CardDescription>Current enrollment breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_STATUS[entry.name as keyof typeof PIE_COLORS_STATUS] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Students by Year</CardTitle>
              <CardDescription>Academic year distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Top Majors</CardTitle>
              <CardDescription>Most popular study programs</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={majorData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="major" width={100} style={{ fontSize: '11px' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">GPA Distribution</CardTitle>
              <CardDescription>Academic performance overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gpaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count">
                      {gpaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_GPA[index % PIE_COLORS_GPA.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Leave Types</CardTitle>
              <CardDescription>Applications by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {leaveStatsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaveStats?.byType || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Leave Status</CardTitle>
              <CardDescription>Application approval rate</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {leaveStatsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveStatusData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" label>
                      <Cell fill="#eab308" /> {/* Pending */}
                      <Cell fill="#22c55e" /> {/* Approved */}
                      <Cell fill="#ef4444" /> {/* Rejected */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Students */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border bg-muted/20">
            <div>
              <CardTitle className="text-lg font-serif">Recently Added</CardTitle>
              <CardDescription>New student profiles created in the system</CardDescription>
            </div>
            <Link href="/students" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentStudents?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No recent students found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentStudents?.map(student => (
                  <Link key={student.id} href={`/students/${student.id}`}>
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{student.major}</span>
                            <span>&bull;</span>
                            <span className="capitalize">{student.year}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={student.status} />
                        <ChevronRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, description, isGpa = false }: any) {
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {value === null || value === undefined ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {isGpa ? <GpaDisplay gpa={Number(value)} /> : value}
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 text-primary rounded-md">
            <Icon size={20} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">{description}</p>
      </CardContent>
    </Card>
  );
}

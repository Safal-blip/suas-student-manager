import React from "react";
import { Layout } from "@/components/layout";
import { useGetStudentStats, useGetLeaveStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetStudentStats();
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed breakdown of institutional data.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Student Status Distribution</CardTitle>
              <CardDescription>Current enrollment breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
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
            <CardHeader>
              <CardTitle className="font-serif">Students by Academic Year</CardTitle>
              <CardDescription>Academic year distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CardHeader>
              <CardTitle className="font-serif">Top Majors</CardTitle>
              <CardDescription>Most popular study programs</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={majorData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="major" width={120} style={{ fontSize: '12px' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">GPA Distribution</CardTitle>
              <CardDescription>Academic performance overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {statsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gpaData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">
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
            <CardHeader>
              <CardTitle className="font-serif">Leave Applications by Type</CardTitle>
              <CardDescription>Applications by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {leaveStatsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaveStats?.byType || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CardHeader>
              <CardTitle className="font-serif">Leave Status</CardTitle>
              <CardDescription>Application approval rate</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {leaveStatsLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveStatusData} cx="50%" cy="50%" innerRadius={0} outerRadius={100} dataKey="value" label>
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
      </div>
    </Layout>
  );
}

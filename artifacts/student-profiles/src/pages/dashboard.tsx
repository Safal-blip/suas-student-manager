import React from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentStats, useGetRecentStudents } from "@workspace/api-client-react";
import { Users, GraduationCap, AlertCircle, BookOpen, Clock, ChevronRight } from "lucide-react";
import { GpaDisplay } from "@/components/gpa-display";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStudentStats();
  const { data: recentStudents, isLoading: recentLoading } = useGetRecentStudents();

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of institutional academic records.</p>
        </div>

        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Students */}
          <Card className="lg:col-span-2 shadow-sm border-border">
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

          {/* Quick Actions & Distribution */}
          <div className="space-y-8">
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/students/new" className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium">
                  <div className="bg-primary/10 text-primary p-2 rounded-md">
                    <Users size={16} />
                  </div>
                  Add New Profile
                </Link>
                <Link href="/students" className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium">
                  <div className="bg-primary/10 text-primary p-2 rounded-md">
                    <BookOpen size={16} />
                  </div>
                  Browse Directory
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif">Class Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats?.byYear || {}).map(([year, count]) => {
                      const total = stats?.total || 1;
                      const percentage = Math.round(((count as number) / total) * 100);
                      return (
                        <div key={year}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize font-medium text-foreground">{year}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
            {value === null ? (
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

import React from "react";
import { Layout } from "@/components/layout";
import { useListStudents, useGetStudentStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GpaDisplay } from "@/components/gpa-display";
import { Clock } from "lucide-react";

export default function Grades() {
  const { data: students, isLoading } = useListStudents();
  const { data: stats } = useGetStudentStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Grades & Results</h1>
          <p className="text-muted-foreground mt-1">Overview of student academic performance.</p>
        </div>

        {stats?.gpaDistribution && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.gpaDistribution.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">GPA {item.range}</div>
                  <div className="text-3xl font-bold mt-2">{item.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Academic Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Clock className="animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Current GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.major}</TableCell>
                      <TableCell className="capitalize">{student.year}</TableCell>
                      <TableCell className="text-right">
                        {student.gpa ? <GpaDisplay gpa={student.gpa} /> : <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

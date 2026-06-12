import React from "react";
import { Layout } from "@/components/layout";
import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export default function Attendance() {
  const { data: students, isLoading } = useListStudents();
  const today = format(new Date(), 'MMM d, yyyy');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">Daily attendance tracking records.</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 text-indigo-800 text-sm">
          <strong>Note:</strong> Attendance tracking integration is coming soon. The data below is a placeholder mock view.
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Roster</CardTitle>
              <CardDescription>{today}</CardDescription>
            </div>
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
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student, i) => {
                    const isPresent = i % 5 !== 0; // Fake some absentees
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>{today}</TableCell>
                        <TableCell className="text-right">
                          {isPresent ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>
                          ) : (
                            <Badge variant="destructive">Absent</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

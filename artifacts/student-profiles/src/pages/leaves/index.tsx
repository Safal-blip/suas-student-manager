import React from "react";
import { Layout } from "@/components/layout";
import { useListLeaves, useUpdateLeaveStatus, useGetLeaveStats, getListLeavesQueryKey, getGetLeaveStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function LeavesIndex() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: leaves, isLoading } = useListLeaves();
  const { data: stats } = useGetLeaveStats();
  const updateStatus = useUpdateLeaveStatus();

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListLeavesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLeaveStatsQueryKey() });
      toast({
        title: "Status updated",
        description: `Leave application has been ${status}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage student leave applications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Applications</div>
              <div className="text-3xl font-bold mt-2">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
              <div className="text-3xl font-bold mt-2 text-yellow-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Approved</div>
              <div className="text-3xl font-bold mt-2 text-green-600">{stats?.approved || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Rejected</div>
              <div className="text-3xl font-bold mt-2 text-red-600">{stats?.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Clock className="animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead className="w-1/4">Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No leave applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaves?.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div className="font-medium">{leave.applicantName}</div>
                          <div className="text-xs text-muted-foreground">{leave.applicantEmail}</div>
                        </TableCell>
                        <TableCell>{leave.leaveTypeName}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(leave.fromDate), 'MMM d, yyyy')} - <br/>
                          {format(new Date(leave.toDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{leave.totalDays}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]" title={leave.reason}>
                          {leave.reason}
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {leave.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                disabled={updateStatus.isPending}
                              >
                                <Check size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                disabled={updateStatus.isPending}
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

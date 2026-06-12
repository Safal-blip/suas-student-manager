import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useListLeaveTypes, useApplyForLeave } from "@workspace/api-client-react";

export default function ApplyLeave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: leaveTypes } = useListLeaveTypes();
  const applyLeave = useApplyForLeave();

  const [formData, setFormData] = useState({
    applicantName: user?.name || "",
    applicantEmail: user?.email || "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setTotalDays(diffDays > 0 ? diffDays : 0);
    } else {
      setTotalDays(0);
    }
  }, [formData.fromDate, formData.toDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, leaveTypeId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveTypeId) {
      toast({ title: "Error", description: "Please select a leave type", variant: "destructive" });
      return;
    }

    try {
      await applyLeave.mutateAsync({
        data: {
          applicantName: formData.applicantName,
          applicantEmail: formData.applicantEmail,
          leaveTypeId: parseInt(formData.leaveTypeId),
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          totalDays: totalDays,
          reason: formData.reason
        }
      });

      toast({ title: "Success", description: "Leave application submitted successfully." });
      setLocation("/leaves");
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Apply for Leave</h1>
          <p className="text-muted-foreground mt-1">Submit a new leave application.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>Fill out the form below to request time off.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Applicant Name</Label>
                  <Input 
                    id="applicantName" 
                    name="applicantName"
                    value={formData.applicantName} 
                    onChange={handleChange}
                    required 
                    readOnly={!!user}
                    className={user ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Applicant Email</Label>
                  <Input 
                    id="applicantEmail" 
                    name="applicantEmail"
                    type="email"
                    value={formData.applicantEmail} 
                    onChange={handleChange}
                    required 
                    readOnly={!!user}
                    className={user ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={formData.leaveTypeId} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input 
                    id="fromDate" 
                    name="fromDate"
                    type="date"
                    value={formData.fromDate} 
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input 
                    id="toDate" 
                    name="toDate"
                    type="date"
                    value={formData.toDate} 
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  <span className="font-medium">Total Days:</span> {totalDays}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea 
                  id="reason" 
                  name="reason"
                  rows={4}
                  value={formData.reason} 
                  onChange={handleChange}
                  required 
                  placeholder="Please provide details about your leave request..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setLocation("/leaves")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={applyLeave.isPending}>
                  {applyLeave.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

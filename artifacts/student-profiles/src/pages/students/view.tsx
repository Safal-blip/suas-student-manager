import React from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useGetStudent, useDeleteStudent, getGetStudentQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { GpaDisplay } from "@/components/gpa-display";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, MapPin, GraduationCap, BookOpen, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function StudentView() {
  const [, params] = useRoute("/students/:id");
  const id = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const { data: student, isLoading } = useGetStudent(id as number, {
    query: {
      enabled: !!id,
      queryKey: getGetStudentQueryKey(id as number)
    }
  });

  const deleteMutation = useDeleteStudent();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Student deleted", description: "The student record has been removed." });
      setLocation("/students");
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete student.", variant: "destructive" });
    }
  };

  if (!id) return null;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Student Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The requested student profile could not be located.</p>
          <Button onClick={() => setLocation("/students")}>Return to Directory</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <Link href="/students" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Directory
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shadow-sm">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
              ) : (
                <>{student.firstName[0]}{student.lastName[0]}</>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">{student.firstName} {student.lastName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={student.status} />
                <span className="text-muted-foreground text-sm font-medium capitalize">{student.year}</span>
                <span className="text-muted-foreground text-sm">&bull;</span>
                <span className="text-muted-foreground text-sm">ID: {student.id.toString().padStart(6, '0')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation(`/students/${student.id}/edit`)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-1 space-y-6">
            {/* Academic Summary */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Academic Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Major</div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <BookOpen size={16} className="text-primary/70" />
                    {student.major}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">GPA</div>
                    <GpaDisplay gpa={student.gpa} className="text-lg" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Class of</div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <GraduationCap size={16} className="text-primary/70" />
                      {student.graduationYear || "TBD"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Enrolled</div>
                  <div className="font-medium text-foreground text-sm">
                    {format(new Date(student.enrollmentDate), "MMMM d, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Email</div>
                    <a href={`mailto:${student.email}`} className="text-sm font-medium text-primary hover:underline break-all">
                      {student.email}
                    </a>
                  </div>
                </div>
                {student.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Phone</div>
                      <a href={`tel:${student.phone}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {student.phone}
                      </a>
                    </div>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Address</div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {student.address}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Date of Birth</div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      {student.dateOfBirth ? format(new Date(student.dateOfBirth), "MMMM d, yyyy") : "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Record Created</div>
                    <div className="font-medium text-foreground">
                      {format(new Date(student.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Biography / Notes</div>
                  {student.bio ? (
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-md border border-border/50">
                      {student.bio}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-border/50">
                      No biographical notes provided for this student.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the profile for {student.firstName} {student.lastName}? This action cannot be undone and will remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

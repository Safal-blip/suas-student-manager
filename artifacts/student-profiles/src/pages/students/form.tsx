import React from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetStudent, useCreateStudent, useUpdateStudent, getGetStudentQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  graduationYear: z.coerce.number().min(2000).max(2100).optional().or(z.literal("")),
  major: z.string().min(1, "Major is required"),
  gpa: z.coerce.number().min(0).max(4.0).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "graduated", "suspended"]).default("active"),
  year: z.enum(["freshman", "sophomore", "junior", "senior", "graduate"]).default("freshman"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function StudentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [, viewParams] = useRoute("/students/:id/edit");
  const [, newParams] = useRoute("/students/new");
  
  const isEdit = !!viewParams?.id;
  const id = isEdit ? parseInt(viewParams.id!) : null;

  const { data: student, isLoading: isFetching } = useGetStudent(id as number, {
    query: {
      enabled: isEdit && !!id,
      queryKey: getGetStudentQueryKey(id as number)
    }
  });

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      enrollmentDate: new Date().toISOString().split('T')[0],
      graduationYear: undefined,
      major: "",
      gpa: undefined,
      status: "active",
      year: "freshman",
      photoUrl: "",
      address: "",
      bio: "",
    },
  });

  React.useEffect(() => {
    if (student && isEdit) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : "",
        enrollmentDate: student.enrollmentDate.split('T')[0],
        graduationYear: student.graduationYear || undefined,
        major: student.major,
        gpa: student.gpa || undefined,
        status: student.status,
        year: student.year,
        photoUrl: student.photoUrl || "",
        address: student.address || "",
        bio: student.bio || "",
      });
    }
  }, [student, isEdit, form]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const formattedData = {
        ...data,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined,
        gpa: data.gpa ? Number(data.gpa) : undefined,
        photoUrl: data.photoUrl || undefined,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        bio: data.bio || undefined,
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: formattedData });
        toast({ title: "Student updated", description: "The profile has been saved." });
        setLocation(`/students/${id}`);
      } else {
        const newStudent = await createMutation.mutateAsync({ data: formattedData });
        toast({ title: "Student created", description: "The new profile has been added." });
        setLocation(`/students/${newStudent.id}`);
      }
    } catch (error) {
      toast({ title: "Error", description: "There was a problem saving the record.", variant: "destructive" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isFetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <Link href={isEdit ? `/students/${id}` : "/students"} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={16} />
            {isEdit ? "Back to Profile" : "Back to Directory"}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isEdit ? "Edit Student Profile" : "Add New Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update institutional records for this student." : "Enter details to register a new student in the system."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freshman">Freshman</SelectItem>
                        <SelectItem value="sophomore">Sophomore</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="major" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major / Program <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Computer Science" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="enrollmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="graduationYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Graduation Year</FormLabel>
                    <FormControl><Input type="number" placeholder="YYYY" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gpa" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current GPA</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-serif">Contact & Additional Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="student@institution.edu" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input type="tel" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Permanent Address</FormLabel>
                    <FormControl><Textarea className="resize-none" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Biographical Notes</FormLabel>
                    <FormControl><Textarea className="min-h-32" placeholder="Administrative notes, achievements, special circumstances..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setLocation(isEdit ? `/students/${id}` : "/students")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Create Student Record"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}

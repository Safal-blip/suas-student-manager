import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/not-found";

// Auth Pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";

// App Pages
import Dashboard from "@/pages/dashboard";
import StudentList from "@/pages/students/index";
import StudentView from "@/pages/students/view";
import StudentForm from "@/pages/students/form";
import LeavesIndex from "@/pages/leaves/index";
import ApplyLeave from "@/pages/leaves/apply";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Grades from "@/pages/grades";
import Attendance from "@/pages/attendance";

const queryClient = new QueryClient();

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/signup" component={Signup} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={StudentList} />
      <Route path="/students/new" component={StudentForm} />
      <Route path="/students/:id" component={StudentView} />
      <Route path="/students/:id/edit" component={StudentForm} />
      <Route path="/leaves" component={LeavesIndex} />
      <Route path="/leaves/apply" component={ApplyLeave} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route path="/grades" component={Grades} />
      <Route path="/attendance" component={Attendance} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

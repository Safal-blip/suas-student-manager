import React, { useState } from "react";
import { Link } from "wouter";
import { Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SignupInputRole } from "@workspace/api-client-react";

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SignupInputRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength logic
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let strength = 0;
  if (password.length > 0) strength = 1;
  if (hasMinLength && (hasNumber || hasUpper)) strength = 2;
  if (hasMinLength && hasNumber && hasUpper) strength = 3;
  if (password.length >= 12 && hasNumber && hasUpper && hasSpecial) strength = 4;

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-muted", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isSubmitDisabled = !passwordsMatch || strength < 3 || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    
    setIsLoading(true);
    try {
      await signup({ name, email, password, role });
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.message || "An error occurred during registration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-indigo-900" />
          </div>
          <CardTitle className="text-xl font-serif font-bold text-indigo-950">Create an account</CardTitle>
          <p className="text-muted-foreground text-sm">Join Symbiosis University of Applied Sciences</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@suas.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {password && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-colors ${
                          level <= strength ? strengthColors[strength] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-medium text-right text-muted-foreground">
                    {strengthLabels[strength]}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className={hasMinLength ? "text-green-500" : "text-muted-foreground opacity-50"} />
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className={hasUpper ? "text-green-500" : "text-muted-foreground opacity-50"} />
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className={hasNumber ? "text-green-500" : "text-muted-foreground opacity-50"} />
                      <span>Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className={hasSpecial ? "text-green-500" : "text-muted-foreground opacity-50"} />
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white mt-4" disabled={isSubmitDisabled}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
            
            <div className="flex justify-between items-center mt-4 text-sm">
              <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                Forgot password?
              </Link>
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                Already have an account?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

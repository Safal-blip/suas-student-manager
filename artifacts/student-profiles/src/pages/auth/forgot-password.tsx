import React, { useState } from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!res.ok) throw new Error("Request failed");
      
      setIsSuccess(true);
      toast({
        title: "Link sent",
        description: "If an account exists with this email, a reset link has been sent.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-10 h-10 text-indigo-900" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-indigo-950">Reset Password</CardTitle>
          <p className="text-muted-foreground text-sm">Enter your email to receive a reset link</p>
        </CardHeader>
        <CardContent>
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@suas.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-green-50 text-green-800 rounded-md text-sm text-center mb-4">
              If an account exists with this email, a reset link has been sent.
            </div>
          )}
          <div className="text-center mt-6">
            <Link href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const { login, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading...</p></div>;
  }

  if (isAuthenticated) {
    router.push('/dashboard');
    return null; 
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(code)) {
      toast({ title: "Login Successful!", description: "Welcome to the Family Dashboard." });
    } else {
      toast({ title: "Login Failed", description: "Invalid family code. Please try again.", variant: "destructive" });
      setCode('');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-full w-fit mb-4">
            <KeyRound size={32} className="text-primary-foreground" />
          </div>
          <CardTitle>Family Member Login</CardTitle>
          <CardDescription>Enter the secret family code to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="family-code">Family Code</Label>
              <Input 
                id="family-code" 
                type="password" 
                placeholder="Enter code" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required 
                className="bg-input"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground">
              <LogIn className="mr-2" /> Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

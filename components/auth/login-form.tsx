"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@labflow.test", name: "Amina Bello" },
  { role: "Scientist", email: "scientist@labflow.test", name: "Chinedu Okafor" },
  { role: "Intern", email: "intern@labflow.test", name: "Tunde Adeyemi" },
  { role: "Dispatch", email: "dispatch@labflow.test", name: "Ngozi Eze" },
];

const DEMO_PASSWORD = "Password123!";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@labflow.test");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password, or the account is inactive.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Could not sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@hospital.test"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="rounded-lg border bg-slate-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Demo accounts (seed data)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(DEMO_PASSWORD);
                setError(null);
              }}
              className="rounded-md border bg-white px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="block text-xs font-semibold">{account.role}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {account.email}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Password for all demo accounts: <span className="font-mono">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}

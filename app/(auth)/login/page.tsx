import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FlaskConical, ShieldCheck, TimerReset, Workflow } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (session?.user?.id) {
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isActive: true },
    });
    if (current?.isActive) {
      redirect("/dashboard");
    }
  }

  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/dashboard";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 18%, rgba(255,255,255,0.35) 0, transparent 32%), radial-gradient(circle at 85% 82%, rgba(255,255,255,0.2) 0, transparent 28%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">LabFlow</p>
            <p className="text-xs uppercase tracking-widest text-white/70">
              Laboratory Workflow
            </p>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Every sample accounted for. Every result traceable.
          </h1>
          <p className="text-sm leading-relaxed text-white/80">
            Replace the logbook with a clear, auditable path from sample
            registration to result collection.
          </p>
          <div className="space-y-3">
            {[
              {
                icon: Workflow,
                title: "One workflow",
                text: "Registered, processing, result produced, dispatch and collection.",
              },
              {
                icon: TimerReset,
                title: "Timestamped handovers",
                text: "Know who moved a sample and when at every stage.",
              },
              {
                icon: ShieldCheck,
                title: "Role-based access",
                text: "Interns, scientists, dispatch staff and supervisors see the right actions.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg bg-white/10 p-3 ring-1 ring-white/15"
              >
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs leading-relaxed text-white/70">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/60">
          Workflow tracking only — not a diagnostic or clinical decision-support
          system.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">LabFlow</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Laboratory Workflow
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use your laboratory account to access the workflow.
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Access is managed by your laboratory administrator. Contact a
            supervisor if you cannot sign in.
          </p>
        </div>
      </div>
    </div>
  );
}

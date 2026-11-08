import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { department: { select: { name: true } } },
  });

  if (!user || !user.isActive) {
    redirect("/login?inactive=1");
  }

  const dispatchCount = await prisma.sample.count({
    where: { status: { in: ["AWAITING_DISPATCH", "RECEIVED_AT_DISPATCH"] } },
  });

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        departmentName: user.department?.name ?? null,
      }}
      dispatchCount={dispatchCount}
    >
      {children}
    </AppShell>
  );
}

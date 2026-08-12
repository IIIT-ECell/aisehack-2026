import { redirect } from "next/navigation";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";
import { Dashboard } from "@/components/mail-ops/Dashboard";

export default async function MailOpsPage() {
  const session = await auth();

  // Middleware already enforces this; re-checked here so the page never
  // renders without a valid, admin-only session even if middleware config
  // ever drifts from the route it's meant to protect.
  if (!session || session.error) {
    redirect(mailOpsConfig.signInPath);
  }

  return <Dashboard adminEmail={session.user?.email ?? mailOpsConfig.adminEmail} />;
}

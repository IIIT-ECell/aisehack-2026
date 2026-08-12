"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { mailOpsConfig } from "@/lib/mail-ops/config";

export function SignInButton() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: mailOpsConfig.dashboardPath })} className="w-full">
      Sign in with Google
    </Button>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { mailOpsConfig } from "@/lib/mail-ops/config";

export function SignInButton() {
  // Auth.js's post-sign-in redirect is built as `origin + callbackUrl`
  // with NO basePath applied -- unlike its own internal action URLs
  // (session/csrf/callback), it has no concept of the app's Next.js
  // basePath at all. Without the prefix here, sign-in would land on
  // "precog.iiit.ac.in/mail-ops-x9k2" instead of ".../aisehack/mail-ops-x9k2".
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: `${basePath}${mailOpsConfig.dashboardPath}` })}
      className="w-full"
    >
      Sign in with Google
    </Button>
  );
}

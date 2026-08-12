import { SignInButton } from "@/components/mail-ops/SignInButton";

export default async function MailOpsSignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <h1 className="text-lg font-semibold">Internal access</h1>
        <p className="mt-1 text-sm text-zinc-500">Restricted to a single authorized account.</p>
        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            Sign-in failed or this account is not authorized.
          </p>
        )}
        <div className="mt-6">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}

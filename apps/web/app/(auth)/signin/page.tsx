import { AuthShell } from "@/components/auth-shell";
import { SigninForm } from "@/components/signin-form";

function SigninPromo() {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="mt-16">
        <h2 className="font-heading text-3xl font-medium">Welcome back.</h2>
        <p className="font-heading text-3xl italic text-auth-panel-foreground/80">
          Let&apos;s finish what you started.
        </p>
      </div>
      <blockquote className="text-sm text-auth-panel-foreground/80">
        <p>
          &ldquo;Cleared Assam TET Paper II on the first attempt — the recap cards did
          the heavy lifting.&rdquo;
        </p>
        <footer className="mt-2 text-auth-panel-foreground/60">— Priyanka B., Nagaon</footer>
      </blockquote>
    </div>
  );
}

export default function SigninPage() {
  return (
    <AuthShell promo={<SigninPromo />}>
      <SigninForm />
    </AuthShell>
  );
}

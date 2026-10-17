"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { authClient, googleAuthEnabled } from "@repo/auth/client";
import { signinSchema } from "@/lib/validations/signin.validation";
import { signin } from "@/lib/actions/signin.action";

export function SigninForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = signinSchema.safeParse({ ...values, rememberMe });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input", { richColors: true });
      return;
    }
    startTransition(async () => {
      const result = await signin(parsed.data);
      if (!result.success) {
        toast.error(result.error, { richColors: true });
        return;
      }
      toast.success("Signed in.", { richColors: true });
      router.replace("/dashboard");
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-foreground"
            render={<Link href="/signup" />}
          >
            Create an account
          </Button>
        </p>
      </div>

      {googleAuthEnabled && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            authClient.signIn.social({ provider: "google", callbackURL: "/" })
          }
        >
          Continue with Google
        </Button>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="example@gmail.com"
            value={values.email}
            onChange={(e) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            required
          />
        </div>
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="your password here"
              minLength={8}
              maxLength={20}
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
              required
              className="pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
            Remember me
          </label>
          {/*<Button
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            render={<Link href="/forgot-password" />}
          >
            Forgot password?
          </Button>*/}
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground flex flex-row items-center align-baseline gap-1">
        <p>By creating an account you agree to our</p>
        <Link href={"/privacypolicy"}>Terms &amp; Privacy Policy.</Link>
      </div>
    </div>
  );
}

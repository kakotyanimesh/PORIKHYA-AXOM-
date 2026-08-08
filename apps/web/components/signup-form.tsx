"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { authClient } from "@repo/auth/client";
import { signupSchema } from "@/lib/validations/signup.validation";
import { signup } from "@/lib/actions/signup.action";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleChange(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    startTransition(async () => {
      const result = await signup(parsed.data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Check your email to verify your account before signing in.");
      router.push("/signin");
      router.refresh();
    });
  }

  const strength = passwordStrength(values.password);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Already have one?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-foreground"
            render={<Link href="/signin" />}
          >
            Sign in
          </Button>
        </p>
      </div>

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

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
          placeholder="username_"
            id="username"
            maxLength={30}
            minLength={3}
            value={values.username}
            onChange={handleChange("username")}
            required
          />
        </div>
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="example@email.com"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            required
          />
        </div>
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="phone_number">Phone number</Label>
          <Input
            id="phone_number"
            placeholder="10 digit Indian Number"
            type="tel"
            maxLength={10}
            value={values.phone_number}
            onChange={handleChange("phone_number")}
            required
          />
        </div>
        <div className="auth-field-enter flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
            placeholder="8 character password"
              minLength={8}
              maxLength={20}
              id="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange("password")}
              required
              className="pr-9"
            />
            <button
              type="button"
              // variant="ghost"
              // size="icon-sm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {values.password ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={
                    i < strength
                      ? "h-1 flex-1 rounded-full bg-primary"
                      : "h-1 flex-1 rounded-full bg-muted"
                  }
                />
              ))}
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters, numbers and symbols
          </p>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/*<p className="text-xs text-muted-foreground">
        By creating an account you agree to our Terms &amp; Privacy Policy.
      </p>*/}
      <div className="text-xs text-muted-foreground flex flex-row items-center align-baseline gap-1">
        <p>By creating an account you agree to our</p>
        <Link href={"/"}>Terms &amp; Privacy Policy.</Link>
      </div>
    </div>
  );
}

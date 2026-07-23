import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";

const benefits = [
  "Personalised mocks for Assam TET, APSC, ADRE",
  "Free previous-year papers with explanations",
  "Weekly recap that tells you what to revise",
];

function SignupPromo() {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="mt-16">
        <h2 className="font-heading text-3xl font-medium">Prep with a plan.</h2>
        <p className="font-heading text-3xl italic text-auth-panel-foreground/80">
          Not another PDF dump.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-auth-panel-foreground/70" />
            <span className="text-auth-panel-foreground/90">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthShell promo={<SignupPromo />}>
      <SignupForm />
    </AuthShell>
  );
}

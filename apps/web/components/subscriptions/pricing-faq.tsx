"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@repo/ui/components/collapsible";
import { Card } from "@repo/ui/components/card";

const FAQS = [
  {
    q: "What is included in a category plan?",
    a: "Every category plan unlocks all mock tests, sectional drills, previous-year solutions and study notes for that exam category, for the full plan duration.",
  },
  {
    q: "Can I hold plans for more than one exam?",
    a: "Yes. Plans are per-category and stack — buy Assam TET and Assam Police and both stay active independently, each with its own validity window.",
  },
  {
    q: "What happens when my subscription expires?",
    a: "Access to that category's paid mocks pauses, but your past attempts and results stay. Renew any time to continue. Single-exam purchases never expire.",
  },
  {
    q: "Do I need a subscription for a single test?",
    a: "No — buy one full-length mock for a flat one-time price, no subscription needed. It stays yours regardless of any plan.",
  },
];

export function PricingFaq() {
  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => (
        <Collapsible key={item.q} defaultOpen={i === 0} render={<Card className="p-0" />}>
          <CollapsibleTrigger className="group/faq flex w-full items-center justify-between gap-4 p-5 text-left font-medium">
            {item.q}
            {/* +/− swap — the plus fades out as the minus fades in on open */}
            <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground">
              <PlusIcon className="absolute size-3.5 transition-opacity duration-200 group-data-[panel-open]/faq:opacity-0" />
              <MinusIcon className="absolute size-3.5 opacity-0 transition-opacity duration-200 group-data-[panel-open]/faq:opacity-100" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[closed]:h-0 motion-reduce:transition-none">
            <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

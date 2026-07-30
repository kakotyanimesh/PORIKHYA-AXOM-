"use client";

import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m, MotionConfig } from "motion/react";
// import { ArrowUpRightIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { TestSeriesGroup } from "@/lib/utils/test-series";
import { LinkPending } from "./link-pending";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const MEDIA_GRADIENTS = [
  "from-rose-200 to-orange-100 dark:from-rose-950 dark:to-orange-950",
  "from-sky-200 to-indigo-100 dark:from-sky-950 dark:to-indigo-950",
  "from-emerald-200 to-teal-100 dark:from-emerald-950 dark:to-teal-950",
  "from-amber-200 to-yellow-100 dark:from-amber-950 dark:to-yellow-950",
  "from-violet-200 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950",
];

function gradientFor(seed: string) {
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  return MEDIA_GRADIENTS[hash % MEDIA_GRADIENTS.length];
}

export function TestSeriesGrid({ groups }: { groups: TestSeriesGroup[] }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, index) => {
            const href = `/all-test-series/${encodeURIComponent(group.seriesName)}`;
            return (
              <m.div
                key={group.seriesName}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  ease: EASE_OUT,
                  delay: index * 0.05,
                }}
              >
                <Card className="h-full gap-4">
                  <Link href={href} className="group flex flex-col gap-4">
                    {group.imageUrl ? (
                      <div className="relative mx-(--card-spacing) aspect-video overflow-hidden rounded-2xl">
                        <Image
                          src={group.imageUrl}
                          alt={group.seriesName}
                          fill
                          loading="eager"
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "mx-(--card-spacing) aspect-video rounded-2xl bg-linear-to-br",
                          gradientFor(group.seriesName),
                        )}
                      />
                    )}
                    <CardHeader className="gap-1.5">
                      <div className="flex items-center justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <span className="truncate">{group.subjectLabel}</span>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {group.seriesName}
                        <LinkPending />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5">
                      {group.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {group.extraTagCount > 0 && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          +{group.extraTagCount}
                        </span>
                      )}
                    </CardContent>
                  </Link>
                  <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <div className="text-right">
                        <div className="font-heading text-xl leading-none">
                          {group.totalTests}
                        </div>
                        <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                          Tests
                        </div>
                      </div>
                      {/*<ArrowUpRightIcon className="size-4 text-muted-foreground" />*/}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={href} />}
                    >
                      View more
                      <LinkPending />
                    </Button>
                  </CardFooter>
                </Card>
              </m.div>
            );
          })}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

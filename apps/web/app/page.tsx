import { Logo } from "@repo/ui/components/logo";
;

export default function Home() {
  return (
    <main className="flex flex-col gap-10 min-h-screen items-center justify-center ">
      <div>
        <h1 className="font-dottedFont text-7xl">Comming Sonnnnnnnnnnnnnnnnnnnnnnnn</h1>
      </div>
      <Logo className="text-4xl" />
      {/*<div className="flex items-center gap-2">
        <Button variant="ghost" render={<Link href="/signin" />}>
          Sign in
        </Button>
        <Button render={<Link href="/signup" />}>
          Get started
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </div>*/}
      
    </main>
  );
}

import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-medium">Content management</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage exams, questions, and plans.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link href="/exams" className="font-medium text-foreground underline-offset-4 hover:underline">
            Exams
          </Link>
        </li>
        <li className="text-muted-foreground">
          Questions — open an exam, then <span className="text-foreground">Add questions</span> to type them in one by one (or use JSON import below for bulk)
        </li>
        <li>
          <Link href="/plans" className="font-medium text-foreground underline-offset-4 hover:underline">
            Plans
          </Link>
        </li>
        <li>
          <Link href="/import" className="font-medium text-foreground underline-offset-4 hover:underline">
            Import exam from JSON
          </Link>
          <span className="text-muted-foreground"> — bulk shortcut</span>
        </li>
      </ul>
    </div>
  );
}

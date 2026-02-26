import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link
        to="/inbox"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to Inbox
      </Link>
    </div>
  );
}

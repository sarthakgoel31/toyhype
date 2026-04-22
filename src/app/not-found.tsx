import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] px-4">
      <div className="text-center">
        <p className="text-7xl mb-4">🎮</p>
        <h1 className="text-3xl font-bold font-heading mb-2">Page Not Found</h1>
        <p className="text-[var(--text-muted)] mb-8">
          This toy seems to have rolled off the shelf!
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
          Back to ToyHype
        </Link>
      </div>
    </div>
  );
}

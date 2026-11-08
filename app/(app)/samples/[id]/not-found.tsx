import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SampleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Sample not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This sample record does not exist. It may have been removed or the link
          may be incorrect.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/samples">
          <ArrowLeft className="h-4 w-4" />
          Back to samples
        </Link>
      </Button>
    </div>
  );
}

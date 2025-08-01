import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <Layout title="Page Not Found">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="text-6xl">💸</div>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          This page hasn't been implemented yet. Check back later or navigate to
          an existing page.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
}

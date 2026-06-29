import { useEffect } from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cancel = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get("flow");

    if (flow === "checkout") {
      const timer = setTimeout(() => {
        window.location.href = "https://escovia-club.com/space/pro?payment=cancel";
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl text-foreground mb-4">Payment canceled</h1>
        <p className="text-muted-foreground mb-2">No charge was made.</p>
        <p className="text-sm text-muted-foreground mb-8">You can return to the site and try again at any time.</p>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link to="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
};

export default Cancel;

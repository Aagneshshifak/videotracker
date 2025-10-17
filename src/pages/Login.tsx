import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { GraduationCap, Lock, User, ExternalLink, AlertCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await signIn(username.toLowerCase(), password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl bg-card border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Student Progress Tracker</h1>
          <p className="text-muted-foreground mt-2 text-center">
            Track your learning journey
          </p>
        </div>

        {/* Fix: Declare isInIframe before using */}
        {typeof window !== "undefined" && window.self !== window.top && (
          <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm">
              <strong className="font-semibold">Important:</strong> For login to work properly, please open this app in a new tab.
              <Button
                onClick={openInNewTab}
                variant="outline"
                size="sm"
                className="mt-2 w-full border-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

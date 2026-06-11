"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FloatingPaths } from "@/components/floating-paths";
import {
  ArrowLeftIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
} from "@/components/ui/phosphor-icons";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const ROLE_HOME: Record<string, string> = {
  superadmin: "/dashboard",
  admin_poverty: "/dashboard/poverty",
  admin_lands_roads: "/dashboard/land",
  admin_gas_stations: "/dashboard/gas-station",
};

const DEMO_CREDENTIALS = [
  {
    label: "Super Admin",
    username: "superadmin",
    password: "Super@1234",
    routes: "All routes",
  },
  {
    label: "Admin Poverty Map",
    username: "admin_poverty",
    password: "Poverty@1234",
    routes: "/dashboard/poverty only",
  },
  {
    label: "Admin Lahan & Jalan",
    username: "admin_lands",
    password: "Lands@1234",
    routes: "/dashboard/land only",
  },
  {
    label: "Admin SPBU",
    username: "admin_gas",
    password: "Gas@1234",
    routes: "/dashboard/gas-station only",
  },
];

export function AuthPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      login(data.token, data.user);

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");

      router.replace(
        redirectTo ?? ROLE_HOME[data.user.role] ?? "/dashboard",
      );
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />

        <Logo className="relative z-10 mr-auto h-10 w-auto" />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Aplikasi ini berguna dalam membantu mengelola data spasial
              dengan lebih efisien.&rdquo;
            </p>

            <footer className="font-mono font-semibold text-sm">
              ~ Pangkywara
            </footer>
          </blockquote>
        </div>

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center px-8">
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 inline-flex h-6 items-center justify-center gap-2 rounded-md px-3 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali
        </Link>

        {/* Top Shades */}
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>

        <div className="mx-auto space-y-4 sm:w-sm">
          <Logo className="h-4.5 w-auto lg:hidden" />

          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">Login</h1>

            <p className="text-base text-muted-foreground">
              Masuk ke akun Anda untuk mengakses dashboard.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <InputGroup>
              <InputGroupInput
                placeholder="Username or email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />

              <InputGroupAddon align="inline-start">
                <AtSignIcon />
              </InputGroupAddon>
            </InputGroup>

            <InputGroup>
              <InputGroupInput
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <InputGroupAddon align="inline-start">
                <KeyRoundIcon />
              </InputGroupAddon>

              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in…" : "Login Sekarang"}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-border/50 flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">Demo Credentials (Quick Login)</h2>
              <p className="text-[11px] text-muted-foreground">Click a role to auto-fill the login form:</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.username}
                  type="button"
                  onClick={() => {
                    setIdentifier(cred.username);
                    setPassword(cred.password);
                  }}
                  className="flex flex-col items-start gap-0.5 p-2.5 rounded-lg border border-border bg-card/50 text-left transition-all hover:bg-muted/80 hover:border-primary/40 group cursor-pointer"
                >
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {cred.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate w-full">
                    U: {cred.username} | P: {cred.password}
                  </span>
                  <span className="text-[9.5px] font-medium text-primary bg-primary/10 px-1 rounded-sm mt-0.5">
                    {cred.routes}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
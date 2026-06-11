import { NextRequest, NextResponse } from "next/server";

// Paths each role is allowed to access under /dashboard
const ROLE_PATHS: Record<string, string[]> = {
  superadmin: [
    "/dashboard",
    "/dashboard/poverty",
    "/dashboard/land",
    "/dashboard/gas-station",
  ],
  admin_poverty: ["/dashboard/poverty"],
  admin_lands_roads: ["/dashboard/land"],
  admin_gas_stations: ["/dashboard/gas-station"],
};

// Decode JWT payload without verifying signature — safe for routing only.
// The backend verifies the signature on every API call.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);

  if (!payload || !payload.role || typeof payload.role !== "string") {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role;
  const allowedPaths = ROLE_PATHS[role] ?? [];

  const isAllowed = allowedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isAllowed) {
    // Redirect to the role's primary dashboard page
    const primaryPath = allowedPaths[0] ?? "/auth/login";
    return NextResponse.redirect(new URL(primaryPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

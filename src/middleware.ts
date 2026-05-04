import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRegisterRoute = nextUrl.pathname.startsWith("/api/register");
  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");
  const isPublicRoute = ["/login", "/register"].includes(nextUrl.pathname);

  // 1. Allow API Auth routes (NextAuth internal)
  if (isApiAuthRoute) return NextResponse.next();

  // 2. Handle Authentication logic
  if (isPublicRoute || isApiRegisterRoute) {
    if (isLoggedIn) {
      const onboardingCompleted = req.auth?.user?.onboardingCompleted;
      const target = onboardingCompleted ? "/dashboard" : "/onboarding/banks";
      return NextResponse.redirect(new URL(target, nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 4. Onboarding check
  const onboardingCompleted = req.auth?.user?.onboardingCompleted;
  
  if (!onboardingCompleted && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding/banks", nextUrl));
  }

  if (onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|banks|.*\\..*).*)"],
};

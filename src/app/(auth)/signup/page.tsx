import { AuthForm } from "@/components/app/AuthForm";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { redirectIfAuthenticated } from "@/lib/auth/redirects";

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] sm:py-16">
      <div className="mb-10 flex flex-col items-center gap-4">
        <BrandLogo href="/" />
        <p className="text-sm text-muted-foreground">
          Start tracking your student budget
        </p>
      </div>
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

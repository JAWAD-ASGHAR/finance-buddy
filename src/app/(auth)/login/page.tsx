import { AuthForm } from "@/components/app/AuthForm";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { redirectIfAuthenticated } from "@/lib/auth/redirects";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  await redirectIfAuthenticated(next ?? "/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <BrandLogo href="/" />
        <p className="text-sm text-muted-foreground">
          Sign in to your private budget
        </p>
      </div>
      <div className="w-full max-w-md">
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}

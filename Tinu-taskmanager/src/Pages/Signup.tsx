import { SignupForm } from "@/components/Auth/signup-form";
export default function SignupPage() {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-5xl bg-neutral-200/80 dark:bg-neutral-800/80">
          <SignupForm />
        </div>
      </div>
    </>
  );
}

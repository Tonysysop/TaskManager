import { SignupForm } from "@/components/Auth/signup-form";
export default function SignupPage() {
  return (
      <div className="flex min-h-svh flex-col items-center justify-center  p-6 ">
        <div className="w-full max-w-sm md:max-w-4xl ">
          <SignupForm />
        </div>
      </div>
    
  );
}

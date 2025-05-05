import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import tinumind from "@/assets/TinuMind.png";
import show_icon from "@/assets/show.png";
import hide_icon from "@/assets/hide.png";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "@aws-amplify/auth";
import GoogleIcon from "@/assets/Google.svg";
import MetaIcon from "@/assets/Meta.svg";
import appleIcon from "@/assets/Apple.svg";
import { PasswordReset } from "./PasswordReset";
import { SlideShow } from "./Slideshow-signup";
import TaskImage from "@/assets/TaskImage.webp";
import PomoImage from "@/assets/PomoImage.webp";
import TaskImage2 from "@/assets/TaskImage2.webp";
import HabitImage from "@/assets/HabitImage.webp";

// <-- 1. Import the CarouselApi type

// ... other imports like Card, etc.

// Define the validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginSlides = [
    { image: TaskImage, text: "Create Reminders and repetitions for task" },
    { image: PomoImage, text: "Improve focus with Pomo" },
    { image: HabitImage, text: "Check-in to cultivate good habits" },
    { image: TaskImage2, text: "Visualize and track your progress" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });
  const passwordValue = watch("password");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const { isSignedIn } = await signIn({
        username: data.email,
        password: data.password,
      });

      // If signIn is successful, Amplify will emit the 'signedIn' event.
      // The Hub listener in AuthProvider will catch it and update the state.
      // This component only needs to navigate.
      if (isSignedIn) {
        console.log("Login successful, navigating...");
        // 👇 setAuthenticated(true) call is REMOVED
        navigate("/tinumind"); // Redirect to home or dashboard
      } else {
        // Handle cases where signIn succeeds but user isn't fully signed in yet (e.g., MFA)
        // console.log('Sign in successful, but requires next step:', nextStep);
        // Handle nextStep based on Amplify documentation (e.g., navigate to MFA page)
      }
    } catch (error: any) {
      console.error("Login error:", error); // Log the full error
      // Use more specific error handling if desired (see previous suggestions)
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- Simplified handler for "Forgot Password?" link ---
  const handleForgotPasswordClick = () => {
    setShowResetDialog(true); // Just open the dialog
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your TinuMind Inc account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs -mt-1 ml-2">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    onClick={handleForgotPasswordClick}
                    className="ml-auto text-sm underline-offset-2 hover:underline hover:text-indigo-500 hover:text-bold cursor-pointer"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    {...register("password")}
                  />
                  <img
                    src={passwordVisible ? show_icon : hide_icon}
                    alt="Toggle Visibility"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      passwordVisible ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/3 right-2 transform -translate-y-1/4 cursor-pointer w-[18px] h-[18px]"
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs -mt-1 ml-2">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>
              <Button
                disabled={!passwordValue || loading}
                type="submit"
                className={`w-full ${
                  passwordValue || loading
                    ? ""
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" className="w-full">
                  <img className="h-6 w-6" src={appleIcon} alt="" />
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <img
                    className="h-6 w-6 filter grayscale transition-all duration-100 hover:grayscale-0 hover:filter-none"
                    src={GoogleIcon}
                    alt=""
                  />
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <img
                    className="h-6 w-6 filter grayscale transition-all duration-100 hover:grayscale-0 hover:filter-none"
                    src={MetaIcon}
                    alt=""
                  />
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="underline underline-offset-4 hover:text-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:flex w-full h-full">
            <div className="w-full h-full">
              <SlideShow slidesData={loginSlides} />
            </div>

            {/* <img
              src={tinumind}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
            /> */}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
        <PasswordReset
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
        />
      </div>
    </div>
  );
}

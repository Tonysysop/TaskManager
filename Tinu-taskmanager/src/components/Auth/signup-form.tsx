import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import show_icon from "@/assets/show.png";
import hide_icon from "@/assets/hide.png";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import GoogleIcon from "@/assets/Google.svg";
import MetaIcon from "@/assets/Meta.svg";
import appleIcon from "@/assets/Apple.svg";
import { signUp } from "@aws-amplify/auth";
import { VerifyCodeDialog } from "./Verify-code";
import { toast } from "sonner";
import { SlideShow } from "./Slideshow-signup";
import TaskImage from "@/assets/TaskImage.webp";
import PomoImage from "@/assets/PomoImage.webp";
import TaskImage2 from "@/assets/TaskImage2.webp";
import HabitImage from "@/assets/HabitImage.webp";

// Define the validation schema
const formSchema = z
  .object({
    name: z.string().min(5, {
      message: "Name must be at least 5 characters.",
    }),
    email: z.string().email({
      message: "Invalid email address",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "",
    }),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "",
    path: ["confirmPassword"],
  });

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const signUpSlides = [
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

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const { isSignUpComplete } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.name,
          },
          autoSignIn: true,
        },
      });

      localStorage.setItem("signupEmail", data.email);
      setShowVerifyDialog(true); // show popup
      console.log("Sign up complete:", isSignUpComplete);
      toast("Signup Successful✅", {
        duration: 4000,
        description: "Verification email sent. Please check your inbox.",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast("Signup failed❌ ", {
        duration: 4000,
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 flex flex-col">
        <CardContent className="grid p-0 md:grid-cols-2 flex-1 h-full">
          <form className="p-6 " onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Join TinuMind Inc Today</h1>
                <p className="text-muted-foreground text-balance">
                  Sign up to enjoy the best of TinuMind .
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  className="border-zinc-300 dark:border-none"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs -mt-1 ml-2">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="border-zinc-300 dark:border-none"
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
                </div>
                <div className="relative">
                  <Input
                    className="border-zinc-300 dark:border-none"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <img
                    src={showPassword ? show_icon : hide_icon}
                    alt="Toggle Visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/3 right-2 transform -translate-y-1/4 cursor-pointer w-[18px] h-[18px]"
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs -mt-1 ml-2">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Comfirm Password */}
                <div className="flex items-center">
                  <Label htmlFor="Confirmpassword">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Input
                    className="border-zinc-300 dark:border-none"
                    id="comfirmpassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <img
                    src={showConfirmPassword ? show_icon : hide_icon}
                    alt="Toggle Visibility"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/3 right-2 transform -translate-y-1/4 cursor-pointer w-[18px] h-[18px]"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                  {confirmPassword && (
                    <p
                      className={`mt-1 text-sm ${
                        passwordsMatch ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch
                        ? "✅ Passwords match"
                        : "❌ Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                disabled={!confirmPassword || isSubmitting}
                className={`w-full ${
                  confirmPassword || isSubmitting
                    ? ""
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 place-items-center">
                <Button variant="outline" type="button" className="w-1/2">
                  <img className="h-6 w-6" src={appleIcon} alt="" />
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button" className="w-1/2 cursor-pointer">
                  <img
                    className="h-6 w-6 filter grayscale transition-all duration-100 hover:grayscale-0 hover:filter-none"
                    src={GoogleIcon}
                    alt=""
                  />
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button" className="w-1/2">
                  <img
                    className="h-6 w-6 filter grayscale transition-all duration-100 hover:grayscale-0 hover:filter-none"
                    src={MetaIcon}
                    alt=""
                  />
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Already a user?{" "}
                <Link
                  to="/login"
                  className="underline underline-offset-4 hover:text-indigo-500"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
          <SlideShow slidesData={signUpSlides} className="w-full h-full " />
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      {showVerifyDialog && <VerifyCodeDialog />}
    </div>
  );
}

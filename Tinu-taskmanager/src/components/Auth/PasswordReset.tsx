import { useState, useEffect, useMemo } from "react";
import show_icon from "@/assets/show.png";
import hide_icon from "@/assets/hide.png";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  //DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Step-specific schemas
const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
const codeSchema = emailSchema.extend({
  verificationCode: z
    .string()
    .min(6, "Verification code must be 6 characters")
    .max(6, "Verification code must be 6 characters"),
});
const passwordSchema = codeSchema
  .extend({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, ""),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "",
    path: ["confirmNewPassword"],
  });

type Step = "email" | "code" | "password";

const getSchemaByStep = (step: Step) => {
  switch (step) {
    case "email":
      return emailSchema;
    case "code":
      return codeSchema;
    case "password":
      return passwordSchema;
  }
};

type FormData =
  | z.infer<typeof emailSchema>
  | z.infer<typeof codeSchema>
  | z.infer<typeof passwordSchema>;

export function PasswordReset({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [username, setUsername] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmNewPassword, setshowConfirmNewPassword] = useState(false);

  const schema = useMemo(() => getSchemaByStep(step), [step]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      verificationCode: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;

  const newPassword = watch("newPassword");
  const confirmNewPassword = watch("confirmNewPassword");
  const passwordsMatch =
    newPassword && confirmNewPassword && newPassword === confirmNewPassword;


  const handleSendCode = async () => {
    const emailValid = await trigger("email");
    if (!emailValid) return;

    const email = getValues("email");
    setSendingCode(true);

    try {
      const { nextStep } = await resetPassword({ username: email });

      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        toast.info("Code Sent", {
          description: `Check your email (${email}) for a verification code.`,
        });
        setUsername(email);
        setStep("code");
      } else if (nextStep.resetPasswordStep === "DONE") {
        toast.success("Password already reset");
        onOpenChange(false);
      } else {
        toast.error("Unexpected step. Try again.");
      }
    } catch (error: any) {
      toast.error("Failed to send code", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeValid = await trigger("verificationCode");
    if (!codeValid) return;

    setVerifyingCode(true);
    setTimeout(() => {
      setStep("password");
      setVerifyingCode(false);
    }, 500);
  };

  const handleResetPassword = async (data: FormData) => {
    try {
      if (
        step !== "password" ||
        !("verificationCode" in data) ||
        !("newPassword" in data)
      ) {
        throw new Error("Invalid form state");
      }

      await confirmResetPassword({
        username,
        confirmationCode: data.verificationCode,
        newPassword: data.newPassword,
      });

      toast.success("Password reset successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Reset failed", {
        description: error.message || "Something went wrong.",
      });
    }
  };

  useEffect(() => {
    if (!open) {
      setStep("email");
      setUsername("");
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            {step === "email" &&
              "Enter your email to receive a verification code."}
            {step === "code" && "Enter the code sent to your email."}
            {step === "password" && "Enter your new password."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleResetPassword)}
            className="space-y-4"
          >
            {(step === "email" || step === "code") && (
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="jane@example.com"
                        disabled={step !== "email"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === "code" && (
              <FormField
                control={control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === "password" && (
              <>
                <FormField
                  control={control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            {...field}
                          />
                          <img
                            src={showPassword ? show_icon : hide_icon}
                            alt="Toggle Visibility"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer w-[18px] h-[18px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmNewPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <img
                              src={showConfirmNewPassword ? show_icon : hide_icon}
                              alt="Toggle Visibility"
                              onClick={() => setshowConfirmNewPassword((prev) => !prev)}
                              aria-label={
                                showConfirmNewPassword ? "Hide password" : "Show password"
                              }
                              className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer w-[18px] h-[18px]"
                            />
                            {confirmNewPassword && (
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === "email" && (
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
              >
                {sendingCode ? "Sending..." : "Send Code"}
              </Button>
            )}

            {step === "code" && (
              <Button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifyingCode}
                
              >
                {verifyingCode ? "Verifying..." : "Verify Code"}
              </Button>
            )}

            {step === "password" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default PasswordReset;

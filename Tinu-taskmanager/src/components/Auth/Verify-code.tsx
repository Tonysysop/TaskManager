import { useNavigate } from "react-router-dom";
import { confirmSignUp } from "aws-amplify/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  verificationCode: z.string()
    .min(6, {message: "Verification code must be 6 characters"})
    .max(6, {message: "Verification code must be 6 characters"}),
});


export function VerifyCodeDialog() {
  const navigate = useNavigate();
  const email = localStorage.getItem("signupEmail") || "";


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode:"onChange",
    reValidateMode:"onChange",
    defaultValues: {
      verificationCode: "",
    },
  });

  

  const {
    handleSubmit,
    control,
    formState: {isSubmitting},
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: values.verificationCode,
      });
      console.log("Confirmation result:", result);
      toast("Success! ✅ ",{
        description: "Account verified successfully!",
        duration:5000
        });
      localStorage.removeItem("signupEmail");
      navigate("/login");
    } catch (error: any) {
      console.error("Error confirming code:", error);
      toast("Error ❌  ",{
        description: error.message,
        duration:5000
        });
    }
  };

  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Verify Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
          <DialogDescription>
            Please enter the 6-digit code sent to your email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code" {...field} />
                  </FormControl>
                  <FormDescription>
                    <FormMessage />
                    This is the code sent to your email during sign up.
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

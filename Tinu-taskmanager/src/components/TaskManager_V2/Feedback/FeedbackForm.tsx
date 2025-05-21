import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, MessageSquare, Star, Send, User, Mail } from "lucide-react";
import { toast } from "sonner";
import SuccessAnimation from "@/components/TaskManager_V2/Feedback/SuccessAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/Context/AuthContext";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from "uuid";


const API_BASE = import.meta.env.VITE_API_URL;

// --- Helper UI ---
function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-xs text-red-600 mt-1">
          {field.state.meta.errors.map((err) => err.message).join(", ")}
        </em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

// --- Schema ---
const formSchema = z.object({
  feedback: z.string().min(5, "Feedback must be at least 5 characters"),
  feedbackType: z.enum(["suggestion", "bug", "feature"]),
  visibilityType: z.enum(["public", "private"]),
});

type FeedbackType = "suggestion" | "bug" | "feature";
type VisibilityType = "public" | "private";

const defaultFeedbackFormData = {
  feedback: "",
  feedbackType: "" as FeedbackType | "",
  visibilityType: "" as VisibilityType | "",
};

const feedbackTypes = [
  {
    type: "suggestion" as FeedbackType,
    icon: MessageSquare,
    label: "Suggestion",
    description: "Share ideas to improve the product",
  },
  {
    type: "bug" as FeedbackType,
    icon: Bug,
    label: "Bug",
    description: "Report issues or unexpected behavior",
  },
  {
    type: "feature" as FeedbackType,
    icon: Star,
    label: "Feature",
    description: "Suggest a new feature you'd like to see",
  },
];

// --- Main Component ---
const FeedbackForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | "">("");
  const { user, idToken } = useAuth();
  const isMobile = useIsMobile();

  const queryClient = useQueryClient();
  // Mutation for submitting feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async (formData: typeof defaultFeedbackFormData) => {
      const payload = {
        feedbackId: uuidv4(), // ✅ Add this
        feedback: formData.feedback,
        type: formData.feedbackType,
        visibility: formData.visibilityType,
        name: user?.name,
        email: user?.email,
        userId: user?.sub
        
      };

      const response = await axios.post(`${API_BASE}/feedback`, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', user?.sub] });
      toast.success("Feedback submitted successfully!");
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please check your connection.");
      } else if (error.response) {
        toast.error(error.response.data?.error || "Submission failed");
      } else {
        toast.error("Request failed to send");
      }
    }
  });

  const form = useForm({
    defaultValues: defaultFeedbackFormData,
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await submitFeedbackMutation.mutateAsync(value);
    },
  });

  if (isSubmitted) {
    return (
      <SuccessAnimation onAnimationComplete={() => {
        setIsSubmitted(false);
        form.reset(); // Reset form fields
        setSelectedType(""); // Reset selected type
      }} />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="w-full space-y-6 animate-fade-in"
    >
      {/* Feedback Type Selection */}
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-medium mb-4">
          What type of feedback do you have?
        </h2>
        <form.Field name="feedbackType">
          {(field) => (
            <div className="grid grid-cols-3 gap-4">
              {feedbackTypes.map(({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    field.handleChange(type);
                  }}
                  className={`feedback-type-button flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedType === type
                      ? "active"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <div
                    className={`mb-2 p-3 rounded-full ${
                      selectedType === type
                        ? "bg-primary/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">{label}</h3>
                  {!isMobile && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      {/* Dropdown Form */}
      {form.state.values.feedbackType && (
        <div className="glass-card rounded-3xl p-6 animate-scale-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your feedback</h2>
            <form.Field name="visibilityType">
              {(field) => (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Visibility:
                  </span>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as VisibilityType)
                    }
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  value={user?.name}
                  className="pl-9 bg-white/50 dark:bg-slate-800/50 text-muted-foreground"
                  disabled
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  value={user?.email}
                  className="pl-9 bg-white/50 dark:bg-slate-800/50 text-muted-foreground"
                  disabled
                />
              </div>
            </div>

            <form.Field name="feedback">
              {(field) => (
                <>
                  <Textarea
                    placeholder="Share your detailed feedback here..."
                    className="min-h-[120px] bg-white/50 dark:bg-slate-800/50 resize-none"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="px-6 group cursor-pointer"
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-rotate-center"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Submit Feedback</span>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default FeedbackForm;
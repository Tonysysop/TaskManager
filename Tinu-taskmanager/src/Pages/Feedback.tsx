import { useState } from "react";
import Header from "@/components/TaskManager_V2/Feedback/Header";
import FeedbackForm from "@/components/TaskManager_V2/Feedback/FeedbackForm";
import FeedbackList from "@/components/TaskManager_V2/Feedback/FeedbackList";
import { Button } from "@/components/ui/button";

const FeedbackPage = () => {
  const [showList, setShowList] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 relative">
      {/* Floating Button on top-right of the screen */}
      <Button
        variant="outline"
        onClick={() => setShowList(!showList)}
        className="absolute top-4 right-4 sm:right-20 z-50"
      >
        {showList ? "Back to Form" : "View Feedback"}
      </Button>

      {/* Main Content - Removed max-w-2xl constraint for table view */}
      <div
        className={`w-full mx-auto space-y-6 ${showList ? "" : "max-w-2xl"}`}
      >
        <div className="text-center">
          <Header />
        </div>

        {showList ? (
          <div
            className="shadow-lg max-w-5xl w-full mx-auto mt-30 rounded-2xl p-6 md:p-8 bg-card border border-border"


          >
            <FeedbackList />
          </div>
        ) : (
          <FeedbackForm />
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;

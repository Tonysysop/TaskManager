
import { MessageSquare } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full opacity-90 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-1">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Feedback Portal
        </h1>
      </div>
      <p className="text-center text-muted-foreground max-w-md mx-auto mb-8">
        Help us improve by sharing your thoughts, reporting issues, or suggesting new features.
      </p>
    </div>
  );
};

export default Header;

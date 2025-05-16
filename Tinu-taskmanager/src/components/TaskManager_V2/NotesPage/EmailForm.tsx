import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EmailForm = () => {
	const [isAnimating, setIsAnimating] = React.useState(false);

	const handleClick = () => {
		setIsAnimating(true);

		// Simulate API call
		setTimeout(() => {
			toast.success("Great! We'll notify you when we launch.");
			setIsAnimating(false);
		}, 1000);
	};

	return (
		<div className="w-full max-w-md mx-auto space-y-4">
			<div className="flex justify-center">
				<Button
					onClick={handleClick}
					className={`bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25 dark:shadow-blue-400/20 transition-all duration-300 transform ${
						isAnimating ? "scale-95 bg-blue-700" : "hover:scale-105"
					}`}
				>
					{isAnimating ? "Processing..." : "Notify Me"}
				</Button>
			</div>
			<p className="text-center text-xs text-gray-500 dark:text-gray-400">
				We'll notify you when we launch. No spam, promise.
			</p>
		</div>
	);
};

export default EmailForm;

import { useEffect } from "react";
import NotesIllustration from "@/components/TaskManager_V2/NotesPage/NotesIllustration";
import CountdownTimer from "@/components/TaskManager_V2/NotesPage/CountdownTimer";
import EmailForm from "@/components/TaskManager_V2/NotesPage/EmailForm";

const Index = () => {
	// Add fade-in animation effect when the component mounts
	useEffect(() => {
		const animateElements = document.querySelectorAll(".animate-fade-in");
		animateElements.forEach((element, index) => {
			const htmlElement = element as HTMLElement;
			htmlElement.style.animationDelay = `${index * 0.2}s`;
			htmlElement.style.opacity = "1";
		});
	}, []);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F9] dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
			<div className="w-full max-w-3xl mx-auto text-center space-y-8">
				<div className="animate-fade-in opacity-0 transition-all duration-700">
					<h1 className="text-4xl md:text-5xl font-light text-[#333333] dark:text-white mb-2">
						Your Notes,{" "}
						<span className="text-blue-600 dark:text-blue-400 font-normal">
							Reimagined
						</span>
					</h1>
					<p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
						A better way to capture, organize, and access your thoughts.
					</p>
				</div>

				<div className="animate-fade-in opacity-0 transition-all duration-700">
					<NotesIllustration />
				</div>

				<div className="animate-fade-in opacity-0 transition-all duration-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
					<p className="text-gray-700 dark:text-gray-300 mb-2">Launching in</p>
					<CountdownTimer />
				</div>

				<div className="animate-fade-in opacity-0 transition-all duration-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
					<h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">
						You will be the first to Know when Tinumind Notes Launches
					</h2>
					<EmailForm />
				</div>

				<footer className="animate-fade-in opacity-0 transition-all duration-700 pt-16">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						© 2025 TinuMind. All rights reserved.
					</p>
				</footer>
			</div>
		</div>
	);
};

export default Index;

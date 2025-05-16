
import notepic from "@/assets/Learning-cuate.png"








const NotesIllustration = () => {
	return (
		<div className="w-full max-w-md mx-auto mb-10 relative">
			<div className="rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105">
				<img
					src={notepic}
					alt="Notes App Illustration"
					className="w-full h-auto object-cover rounded-xl"
				/>
				<div className="absolute inset-0 bg-gradient-to- from-black/50 to-transparent rounded-xl"></div>
				<div className="absolute bottom-1 left-4 right-4 ">
					<h3 className="text-lg font-semibold">Your thoughts, organized</h3>
					<p className="text-sm opacity-80">Capture ideas instantly</p>
				</div>
			</div>
		</div>
	);
};

export default NotesIllustration;

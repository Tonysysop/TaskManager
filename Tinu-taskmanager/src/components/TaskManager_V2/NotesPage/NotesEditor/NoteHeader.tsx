import React from "react";
import { ArrowLeft, Save, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteHeaderProps {
	onBack: () => void;
	onSave: () => void;
	onDiscard?: () => void;
	isEditing?: boolean;
	lastSaved?: Date;
	hasUnsavedChanges?: boolean;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({
	onBack,
	onSave,
	onDiscard,
	isEditing = false,
	lastSaved,
	hasUnsavedChanges = false,
}) => {
	const formatLastSaved = (date: Date | string) => {
		const d = typeof date === "string" ? new Date(date) : date;
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;

		return d.toLocaleDateString();
	};

	return (
		<div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
			<div className="max-w-4xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={onBack}
							className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>

						<div className="flex flex-col">
							<h1 className="text-lg font-semibold text-gray-900">
								{isEditing ? "Edit Note" : "New Note"}
							</h1>
							{lastSaved && (
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Clock className="w-3 h-3" />
									<span>Last saved {formatLastSaved(lastSaved)}</span>
									{hasUnsavedChanges && (
										<span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{onDiscard && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onDiscard}
								className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
							>
								<X className="w-4 h-4 mr-2" />
								Discard
							</Button>
						)}

						<Button
							onClick={onSave}
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 px-6"
						>
							<Save className="w-4 h-4 mr-2" />
							{isEditing ? "Update Note" : "Save Note"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NoteHeader;

// import { ArrowLeft, Save } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface NoteHeaderProps {
// 	onBack: () => void;
// 	onSave: () => void;
// }

// const NoteHeader = ({ onBack, onSave }: NoteHeaderProps) => {
// 	return (
// 		<div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
// 			<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
// 				<Button
// 					variant="ghost"
// 					onClick={onBack}
// 					className="flex items-center gap-2 hover:bg-gray-100"
// 				>
// 					<ArrowLeft className="w-4 h-4" />
// 					Back
// 				</Button>

// 				<Button
// 					onClick={onSave}
// 					className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2"
// 				>
// 					<Save className="w-4 h-4" />
// 					Save Note
// 				</Button>
// 			</div>
// 		</div>
// 	);
// };

// export default NoteHeader;

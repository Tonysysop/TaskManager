import React from "react";
import { Note } from "@/types/NoteAttributes";
import NoteCard from "./NoteCard";
import { useAuth } from "@/Context/AuthContext";
import { useToggleChecklistItem } from "@/hooks/useNotes"; // or wherever you defined it


interface NotesGridProps {
	notes: Note[];
	onEditNote: (note: Note) => void;
	onTogglePin: (noteId: string) => void;
	onToggleArchive: (noteId: string) => void;
	onDeleteNote: (noteId: string) => void;
	onRestoreNote: (noteId: string) => void;
	onPermanentDelete: (noteId: string) => void;
}

const NotesGrid: React.FC<NotesGridProps> = ({
	notes,
	onEditNote,
	onTogglePin,
	onToggleArchive,
	onDeleteNote,
	onRestoreNote,
	onPermanentDelete,
}) => {
	const { user, idToken } = useAuth();
	const { mutate: toggleChecklistItem } = useToggleChecklistItem();

	

const handleToggleChecklist = (
	noteId: string,
	checklistItemId: string,
	completed: boolean
) => {
	if (!user?.sub || !idToken) return;
	const note = notes.find((n) => n.id === noteId);
	if (!note) return;

	toggleChecklistItem({
		note,
		itemId: checklistItemId,
		checked: completed,
		idToken,
		userId: user.sub,
	});
};

	if (notes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800">
				<div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
					<svg
						className="w-12 h-12 text-gray-400 dark:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
					No notes found
				</h3>
				<p className="text-gray-600 dark:text-gray-400 max-w-md">
					Create your first note to get started organizing your thoughts and
					ideas.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
			{notes.map((note) => (
				<NoteCard
					key={note.id}
					note={note}
					onEditNote={onEditNote}
					onTogglePin={onTogglePin}
					onToggleArchive={onToggleArchive}
					onDeleteNote={onDeleteNote}
					onRestoreNote={onRestoreNote}
					onPermanentDelete={onPermanentDelete}
					userId={user?.sub || undefined}
					idToken={idToken || undefined}
					onToggleChecklist={handleToggleChecklist}
				/>
			))}
		</div>
	);
};

export default NotesGrid;

// import { Note } from "@/types/NoteAttributes";
// import NoteCard from "./NoteCard";

// interface NotesGridProps {
// 	notes: Note[];
// 	onEditNote: (note: Note) => void;
// 	onTogglePin: (noteId: string) => void;
// 	onToggleArchive: (noteId: string) => void;
// 	onDeleteNote: (noteId: string) => void;
// 	onRestoreNote: (noteId: string) => void;
// 	onPermanentDelete: (noteId: string) => void;
// }

// const NotesGrid = ({
// 	notes,
// 	onEditNote,
// 	onTogglePin,
// 	onToggleArchive,
// 	onDeleteNote,
// 	onRestoreNote,
// 	onPermanentDelete,
// }: NotesGridProps) => {
// 	return (
// 		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
// 			{notes.map((note) => (
// 				<NoteCard
// 					key={note.id}
// 					note={note}
// 					onEditNote={onEditNote}
// 					onTogglePin={onTogglePin}
// 					onToggleArchive={onToggleArchive}
// 					onDeleteNote={onDeleteNote}
// 					onRestoreNote={onRestoreNote}
// 					onPermanentDelete={onPermanentDelete}
// 				/>
// 			))}
// 		</div>
// 	);
// };

// export default NotesGrid;

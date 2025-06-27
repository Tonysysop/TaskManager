import { toast } from "sonner";
import { Note } from "@/types/NoteAttributes";
import { useNotes } from "@/Context/NotesContext";
import ListView from "./ListView";
import NotesGrid from "./NotesGrid";

interface NotesViewerProps {
	onBack: () => void;
	onEditNote: (note: Note) => void;
	onCreateNote: () => void;
}

const NotesViewer = ({
	// onBack,
	onEditNote,
	// onCreateNote,
}: NotesViewerProps) => {
	const {
		filteredNotes,
		togglePinNote,
		toggleArchiveNote,
		deleteNote,
		filters,
		restoreNote,
		permanentlyDeleteNote,
	} = useNotes();

	const handleTogglePin = (noteId: string) => {
		togglePinNote(noteId);
		toast("Note Updated", { description: "Note pin status has been updated." });
	};

	const handleToggleArchive = (noteId: string) => {
		toggleArchiveNote(noteId);
		toast("Note Updated", {
			description: "Note archive status has been updated.",
		});
	};

	const handleDeleteNote = (noteId: string) => {
		deleteNote(noteId);
		toast("Note Moved to Trash", {
			description: "The note has been moved to trash.",
		});
	};

	const handleRestoreNote = (noteId: string) => {
		restoreNote(noteId);
		toast("Note Restored", {
			description: "The note has been restored.",
		});
	};

	const handlePermanentDelete = (noteId: string) => {
		permanentlyDeleteNote(noteId);
		toast("Note Deleted", {
			description: "The Note has been deleted",
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-6xl mx-auto px-6 py-4"></div>
			</div>

			<div className="max-w-6xl mx-auto p-6">
				{filteredNotes.length === 0 ? null : (
					<>
						{filters.viewMode === "list" ? (
							<ListView
								notes={filteredNotes}
								onEditNote={onEditNote}
								onTogglePin={handleTogglePin}
								onToggleArchive={handleToggleArchive}
								onDeleteNote={handleDeleteNote}
								onRestoreNote={handleRestoreNote}
								onPermanentDelete={handlePermanentDelete}
							/>
						) : (
							<NotesGrid
								notes={filteredNotes}
								onEditNote={onEditNote}
								onTogglePin={handleTogglePin}
								onToggleArchive={handleToggleArchive}
								onDeleteNote={handleDeleteNote}
								onRestoreNote={handleRestoreNote}
								onPermanentDelete={handlePermanentDelete}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default NotesViewer;

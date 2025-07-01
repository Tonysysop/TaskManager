import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { useNotes } from "@/Context/NotesContext";
import NotesGrid from "@/components/TaskManager_V2/NotesPage/NotesGrid";
import SearchAndFilter from "@/components/TaskManager_V2/NotesPage/SearchAndFilter";
import NoteEditor from "@/components/TaskManager_V2/NotesPage/NotesEditor/NoteEditor";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/NoteAttributes";
import { NotesProvider } from "@/Context/NotesContext";
import Spinner1 from "@/components/spinner";

import ListView from "@/components/TaskManager_V2/NotesPage/ListView";

function App() {
	const {
		togglePinNote,
		toggleArchiveNote,
		deleteNote,
		restoreNote,
		permanentlyDeleteNote,
		filteredNotes,
		filters,
		isLoading,
	} = useNotes();

	const [currentView, setCurrentView] = useState<"list" | "editor">("list");
	const [editingNote, setEditingNote] = useState<Note | null>(null);

	const handleEditNote = (note: Note) => {
		setEditingNote(note);
		setCurrentView("editor");
	};

	const handleNewNote = () => {
		setEditingNote(null);
		setCurrentView("editor");
	};

	const handleBackToList = () => {
		setCurrentView("list");
		setEditingNote(null);
	};

	// Show editor view
	if (currentView === "editor") {
		return (
			<NoteEditor
				onBack={handleBackToList}
				editingNote={editingNote}
				onNoteCreated={handleBackToList}
			/>
		);
	}

	// Show main list view
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900/90 dark:to-black transition-colors duration-300">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
								<FileText className="w-7 h-7 text-white" />
							</div>
							<div>
								<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
									My Notes
								</h1>
								<p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
									Organize your thoughts and ideas beautifully
								</p>
							</div>
						</div>
						<Button
							onClick={handleNewNote}
							className="shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 px-6 py-3 dark:shadow-blue-500/20 dark:hover:shadow-blue-500/30"
						>
							<Plus className="w-5 h-5 mr-2" />
							New Note
						</Button>
					</div>

					{/* Unified Search and Filter */}
					<SearchAndFilter />
				</div>

				{/* Notes Grid */}
				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<Spinner1 />
					</div>
				) : filters.viewMode === "list" ? (
					<ListView
						notes={filteredNotes}
						onEditNote={handleEditNote}
						onTogglePin={togglePinNote}
						onToggleArchive={toggleArchiveNote}
						onDeleteNote={deleteNote}
						onRestoreNote={restoreNote}
						onPermanentDelete={permanentlyDeleteNote}
					/>
				) : (
					<NotesGrid
						notes={filteredNotes}
						onEditNote={handleEditNote}
						onTogglePin={togglePinNote}
						onToggleArchive={toggleArchiveNote}
						onDeleteNote={deleteNote}
						onRestoreNote={restoreNote}
						onPermanentDelete={permanentlyDeleteNote}
					/>
				)}
			</div>
		</div>
	);
}

export default function NotesWithProvider() {
	return (
		<NotesProvider>
			<App />
		</NotesProvider>
	);
}

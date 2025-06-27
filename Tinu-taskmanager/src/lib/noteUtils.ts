// import { Note, NoteState } from "@/types/NoteAttributes";

// const NOTES_STORAGE_KEY = "smart_notes";
// const NOTES_STATE_KEY = "smart_notes_state";

// export const generateId = (): string => {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2);
// };

// // State management utilities
// export const getNotesState = (): NoteState => {
//   try {
//     const stateJson = localStorage.getItem(NOTES_STATE_KEY);
//     if (!stateJson) {
//       return {
//         notes: getAllNotes(),
//         history: [],
//         historyIndex: -1,
//         searchQuery: "",
//         selectedTags: [],
//         sortBy: 'updatedAt',
//         sortOrder: 'desc',
//         showArchived: false,
//         showDeleted: false,
//         viewMode: 'grid',
//       };
//     }

//     const state = JSON.parse(stateJson);
//     return {
//       ...state,
//       viewMode: state.viewMode || 'grid',
//       notes: state.notes.map((note: any) => ({
//         ...note,
//         createdAt: new Date(note.createdAt),
//         updatedAt: new Date(note.updatedAt),
//         deletedAt: note.deletedAt ? new Date(note.deletedAt) : undefined,
//       })),
//     };
//   } catch (error) {
//     console.error("Error loading notes state:", error);
//     return {
//       notes: getAllNotes(),
//       history: [],
//       historyIndex: -1,
//       searchQuery: "",
//       selectedTags: [],
//       sortBy: 'updatedAt',
//       sortOrder: 'desc',
//       showArchived: false,
//       showDeleted: false,
//       viewMode: 'grid',
//     };
//   }
// };

// export const saveNotesState = (state: NoteState): void => {
//   localStorage.setItem(NOTES_STATE_KEY, JSON.stringify(state));
//   localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(state.notes));
// };

// // History management for undo/redo
// export const addToHistory = (state: NoteState, newNotes: Note[]): NoteState => {
//   const newHistory = state.history.slice(0, state.historyIndex + 1);
//   newHistory.push([...state.notes]);

//   // Keep only last 50 states
//   if (newHistory.length > 50) {
//     newHistory.shift();
//   }

//   return {
//     ...state,
//     notes: newNotes,
//     history: newHistory,
//     historyIndex: newHistory.length - 1,
//   };
// };

// export const undo = (state: NoteState): NoteState => {
//   if (state.historyIndex > 0) {
//     const previousNotes = state.history[state.historyIndex - 1];
//     return {
//       ...state,
//       notes: [...previousNotes],
//       historyIndex: state.historyIndex - 1,
//     };
//   }
//   return state;
// };

// export const redo = (state: NoteState): NoteState => {
//   if (state.historyIndex < state.history.length - 1) {
//     const nextNotes = state.history[state.historyIndex + 1];
//     return {
//       ...state,
//       notes: [...nextNotes],
//       historyIndex: state.historyIndex + 1,
//     };
//   }
//   return state;
// };

// // Legacy support - maintain backward compatibility
// export const getAllNotes = (): Note[] => {
//   try {
//     const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
//     if (!notesJson) return [];

//     const notes = JSON.parse(notesJson);
//     return notes.map((note: any) => ({
//       ...note,
//       tags: note.tags || [],
//       isPinned: note.isPinned || false,
//       isArchived: note.isArchived || false,
//       isDeleted: note.isDeleted || false,
//       deletedAt: note.deletedAt ? new Date(note.deletedAt) : undefined,
//       createdAt: new Date(note.createdAt),
//       updatedAt: new Date(note.updatedAt),
//     }));
//   } catch (error) {
//     console.error("Error loading notes:", error);
//     return [];
//   }
// };

// export const saveNote = (note: Note): void => {
//   const existingNotes = getAllNotes();
//   const noteIndex = existingNotes.findIndex(n => n.id === note.id);

//   if (noteIndex >= 0) {
//     existingNotes[noteIndex] = note;
//   } else {
//     existingNotes.push(note);
//   }

//   localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
// };

// export const deleteNote = (noteId: string): void => {
//   const existingNotes = getAllNotes();
//   const note = existingNotes.find(n => n.id === noteId);

//   if (note) {
//     note.isDeleted = true;
//     note.deletedAt = new Date();
//     localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
//   }
// };

// export const permanentlyDeleteNote = (noteId: string): void => {
//   const existingNotes = getAllNotes();
//   const filteredNotes = existingNotes.filter(note => note.id !== noteId);
//   localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
// };

// export const restoreNote = (noteId: string): void => {
//   const existingNotes = getAllNotes();
//   const note = existingNotes.find(n => n.id === noteId);

//   if (note) {
//     note.isDeleted = false;
//     note.deletedAt = undefined;
//     localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
//   }
// };

// export const togglePinNote = (noteId: string): void => {
//   const existingNotes = getAllNotes();
//   const note = existingNotes.find(n => n.id === noteId);

//   if (note) {
//     note.isPinned = !note.isPinned;
//     note.updatedAt = new Date();
//     localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
//   }
// };

// export const toggleArchiveNote = (noteId: string): void => {
//   const existingNotes = getAllNotes();
//   const note = existingNotes.find(n => n.id === noteId);

//   if (note) {
//     note.isArchived = !note.isArchived;
//     note.updatedAt = new Date();
//     localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
//   }
// };

// export const getNoteById = (noteId: string): Note | null => {
//   const notes = getAllNotes();
//   return notes.find(note => note.id === noteId) || null;
// };

// // Search and filter utilities
// export const searchNotes = (notes: Note[], query: string): Note[] => {
//   if (!query.trim()) return notes;

//   const searchTerm = query.toLowerCase();
//   return notes.filter(note =>
//     note.title.toLowerCase().includes(searchTerm) ||
//     note.content.toLowerCase().includes(searchTerm) ||
//     note.tags.some(tag => tag.name.toLowerCase().includes(searchTerm)) ||
//     note.checklist.some(item => item.text.toLowerCase().includes(searchTerm))
//   );
// };

// export const filterNotesByTags = (notes: Note[], selectedTags: string[]): Note[] => {
//   if (selectedTags.length === 0) return notes;

//   return notes.filter(note =>
//     selectedTags.every(tag => note.tags.includes(tag))
//   );
// };

// export const sortNotes = (notes: Note[], sortBy: 'updatedAt' | 'createdAt' | 'title', sortOrder: 'asc' | 'desc'): Note[] => {
//   const sorted = [...notes].sort((a, b) => {
//     // Pinned notes always come first
//     if (a.isPinned && !b.isPinned) return -1;
//     if (!a.isPinned && b.isPinned) return 1;

//     let comparison = 0;

//     switch (sortBy) {
//       case 'title':
//         comparison = a.title.localeCompare(b.title);
//         break;
//       case 'createdAt':
//         comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//         break;
//       case 'updatedAt':
//       default:
//         comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
//         break;
//     }

//     return sortOrder === 'asc' ? comparison : -comparison;
//   });

//   return sorted;
// };

// export const getAllTags = (notes: Note[]): string[] => {
//   const allTags = notes.flatMap(note => note.tags);
//   return [...new Set(allTags)].sort();
// };

// export const getFilteredNotes = (state: NoteState): Note[] => {
//   let filtered = state.notes.filter(note => {
//     if (state.showDeleted) return note.isDeleted;
//     if (state.showArchived) return note.isArchived && !note.isDeleted;
//     return !note.isArchived && !note.isDeleted;
//   });

//   filtered = searchNotes(filtered, state.searchQuery);
//   filtered = filterNotesByTags(filtered, state.selectedTags);
//   filtered = sortNotes(filtered, state.sortBy, state.sortOrder);

//   return filtered;
// };

// src/utils/noteUtils.ts
import { Note } from "@/types/NoteAttributes";

// Note: All functions that directly interacted with localStorage (e.g., getAllNotes, saveNote, getNotesState, saveNotesState)
// and the history management functions (undo, redo) have been removed.
// Their responsibilities are now handled by the API layer and TanStack Query hooks.
// The functions below are pure utilities for filtering and sorting the data fetched from the server.

// --- Search and Filter Utilities ---

/**
 * Filters an array of notes based on a search query.
 * @param notes The array of notes to search through.
 * @param query The search term.
 * @returns A new array of notes that match the query.
 */
export const searchNotes = (notes: Note[], query: string): Note[] => {
	if (!query.trim()) {
		return notes;
	}

	const searchTerm = query.toLowerCase();
	return notes.filter(
		(note) =>
			note.title.toLowerCase().includes(searchTerm) ||
			note.content.toLowerCase().includes(searchTerm) ||
			note.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm)) ||
			(note.checklist &&
				note.checklist.some((item) =>
					item.text.toLowerCase().includes(searchTerm)
				))
	);
};

/**
 * Filters an array of notes to include only those that contain all specified tags.
 * @param notes The array of notes to filter.
 * @param selectedTags An array of tags that must be present on the note.
 * @returns A new array of notes that match the tag criteria.
 */
export const filterNotesByTags = (
	notes: Note[],
	selectedTags: string[]
): Note[] => {
	if (selectedTags.length === 0) {
		return notes;
	}

	return notes.filter((note) =>
		selectedTags.every((tag) => note.tags.some((t) => t.name === tag))
	);
};

// --- Sorting and Data Extraction Utilities ---

/**
 * Sorts an array of notes by a specified field and order. Pinned notes are always sorted first.
 * @param notes The array of notes to sort.
 * @param sortBy The field to sort by ('updatedAt', 'createdAt', 'title').
 * @param sortOrder The order to sort in ('asc', 'desc').
 * @returns A new, sorted array of notes.
 */
export const sortNotes = (
	notes: Note[],
	sortBy: "updatedAt" | "createdAt" | "title",
	sortOrder: "asc" | "desc"
): Note[] => {
	const sorted = [...notes].sort((a, b) => {
		// Pinned notes always come first, regardless of sort criteria
		if (a.isPinned && !b.isPinned) return -1;
		if (!a.isPinned && b.isPinned) return 1;

		let comparison = 0;
		switch (sortBy) {
			case "title":
				comparison = a.title.localeCompare(b.title);
				break;
			case "createdAt":
				comparison =
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				break;
			case "updatedAt":
			default:
				comparison =
					new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
				break;
		}
		return sortOrder === "asc" ? comparison : -comparison;
	});
	return sorted;
};

/**
 * Extracts all unique tags from an array of notes.
 * @param notes The array of notes.
 * @returns A sorted array of unique tag strings.
 */
export const getAllTags = (notes: Note[]): string[] => {
	const allTags = notes.flatMap((note) => note.tags.map((tag) => tag.name));
	return [...new Set(allTags)].sort();
};

// --- Composite Filtering ---

/**
 * Interface for the filter options used by getFilteredNotes.
 * This replaces the monolithic `NoteState`.
 */
export interface FilterOptions {
	searchQuery: string;
	selectedTags: string[];
	sortBy: "updatedAt" | "createdAt" | "title";
	sortOrder: "asc" | "desc";
	showArchived: boolean;
	showDeleted: boolean;
}

/**
 * Applies a full set of filters and sorting to an array of notes.
 * This is the main function to be used in components to display the correct list of notes.
 * @param notes The original array of notes (likely from `useGetNotes`).
 * @param options An object containing all filter and sort criteria.
 * @returns The final, filtered, and sorted array of notes to be rendered.
 */
export const getFilteredNotes = (
	notes: Note[],
	options: FilterOptions
): Note[] => {
	const {
		searchQuery,
		selectedTags,
		sortBy,
		sortOrder,
		showArchived,
		showDeleted,
	} = options;

	// Note: Filtering for archived/deleted is best handled by the API, but can be done on the client as a fallback.
	// e.g., your API call could be `GET /api/notes?status=archived`
	let filtered = notes.filter((note) => {
		if (showDeleted) return note.isDeleted;
		if (showArchived) return note.isArchived && !note.isDeleted;
		return !note.isArchived && !note.isDeleted;
	});

	// Apply the other filters in sequence
	filtered = searchNotes(filtered, searchQuery);
	filtered = filterNotesByTags(filtered, selectedTags);
	filtered = sortNotes(filtered, sortBy, sortOrder);

	return filtered;
};

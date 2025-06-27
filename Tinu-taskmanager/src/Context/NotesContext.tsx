// src/context/NotesContext.tsx
import React, { createContext, useContext, useReducer, useMemo } from "react";
import { Note } from "@/types/NoteAttributes";
import { getFilteredNotes, FilterOptions } from "@/lib/noteUtils";
import {
	useGetNotes,
	useCreateNote,
	useUpdateNote,
	useSoftDeleteNote,
	useTogglePinNote,
	useToggleArchiveNote,
	useRestoreNote,
	usePermanentlyDeleteNote,
	// Add other mutation hooks like restore here if you create them
} from "@/hooks/useNotes";
import { useAuth } from "@/Context/AuthContext";

// 1. Define the state for UI filters only. The `notes` array is no longer here.
interface FilterState {
	searchQuery: string;
	selectedTags: string[];
	sortBy: "updatedAt" | "createdAt" | "title";
	sortOrder: "asc" | "desc";
	showArchived: boolean;
	showDeleted: boolean;
	viewMode: "grid" | "list";
}

// 2. Define actions for the new, smaller reducer.
type FilterAction =
	| { type: "SET_SEARCH"; payload: string }
	| { type: "SET_SELECTED_TAGS"; payload: string[] }
	| {
			type: "SET_SORT";
			payload: {
				sortBy: FilterState["sortBy"];
				sortOrder: FilterState["sortOrder"];
			};
	  }
	| { type: "SET_SHOW_ARCHIVED"; payload: boolean }
	| { type: "SET_SHOW_DELETED"; payload: boolean }
	| { type: "SET_VIEW_MODE"; payload: "grid" | "list" };

// 3. Define the shape of our new Context, which provides data, loading states, and functions.
interface NotesContextType {
	// Data from TanStack Query
	notes: Note[];
	filteredNotes: Note[];
	isLoading: boolean;
	isError: boolean;

	// UI Filter State
	filters: FilterState;

	// Functions to update data (these will call the mutations)
	createNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
	updateNote: (note: Note) => void;
	deleteNote: (noteId: string) => void;
	togglePinNote: (noteId: string) => void;
	toggleArchiveNote: (noteId: string) => void;
	restoreNote: (noteId: string) => void;
	permanentlyDeleteNote: (noteId: string) => void;

	// Functions to update filters
	setSearchQuery: (query: string) => void;
	setSelectedTags: (tags: string[]) => void;
	setSort: (
		sortBy: FilterState["sortBy"],
		sortOrder: FilterState["sortOrder"]
	) => void;
	setViewMode: (mode: "grid" | "list") => void;
	setShowArchived: (val: boolean) => void;
	setShowDeleted: (val: boolean) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// 4. The reducer now only manages the filter state.
const filterReducer = (
	state: FilterState,
	action: FilterAction
): FilterState => {
	switch (action.type) {
		case "SET_SEARCH":
			return { ...state, searchQuery: action.payload };
		case "SET_SELECTED_TAGS":
			return { ...state, selectedTags: action.payload };
		case "SET_SORT":
			return {
				...state,
				sortBy: action.payload.sortBy,
				sortOrder: action.payload.sortOrder,
			};
		case "SET_SHOW_ARCHIVED":
			return { ...state, showArchived: action.payload };
		case "SET_SHOW_DELETED":
			return { ...state, showDeleted: action.payload };
		case "SET_VIEW_MODE":
			return { ...state, viewMode: action.payload };
		default:
			return state;
	}
};

const initialFilterState: FilterState = {
	searchQuery: "",
	selectedTags: [],
	sortBy: "updatedAt",
	sortOrder: "desc",
	showArchived: false,
	showDeleted: false,
	viewMode: "grid",
};

// 5. The Provider is now the central controller.
export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

	// --- Server State Management (using TanStack Query hooks) ---
	const { idToken, user } = useAuth();

	const shouldFetch = !!idToken && !!user?.sub;

	const {
		data: notes = [],
		isLoading,
		isError,
	} = shouldFetch
		? useGetNotes(idToken, user.sub)
		: { data: [], isLoading: false, isError: false };
	const createNoteMutation = useCreateNote();
	const updateNoteMutation = useUpdateNote();
	const deleteNoteMutation = useSoftDeleteNote();
	const togglePinMutation = useTogglePinNote();
	const toggleArchiveMutation = useToggleArchiveNote();
	const restoreNoteMutation = useRestoreNote();
	const permanentlyDeleteNoteMutation = usePermanentlyDeleteNote();
	const setShowArchived = (val: boolean) =>
		dispatch({ type: "SET_SHOW_ARCHIVED", payload: val });

	const setShowDeleted = (val: boolean) =>
		dispatch({ type: "SET_SHOW_DELETED", payload: val });

	// --- Derived State (calculating filtered notes) ---
	const filteredNotes = useMemo(() => {
		const filterOptions: FilterOptions = {
			...filters,
		};
		return getFilteredNotes(notes, filterOptions);
	}, [notes, filters]);

	// --- Action Functions (providing a clean API to components) ---
	const createNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
		if (!idToken || !user?.sub) return;
		createNoteMutation.mutate({ newNote: note, idToken, userId: user.sub });
	};
	const updateNote = (note: Note) => {
		if (!idToken || !user?.sub) return;
		updateNoteMutation.mutate({ updatedNote: note, idToken, userId: user.sub });
	};
	const deleteNote = (noteId: string) => {
		if (!idToken || !user?.sub) return;
		deleteNoteMutation.mutate({ id: noteId, idToken, userId: user.sub });
	};
	const togglePinNote = (noteId: string) => {
		if (!idToken || !user?.sub) return;
		const note = notes.find((n) => n.id === noteId);
		if (!note) return;
		const updatedNote = { ...note, isPinned: !note.isPinned };
		delete (updatedNote as any)._id;
		togglePinMutation.mutate({
			note: updatedNote,
			idToken,
			userId: user.sub,
		});
	};
	const toggleArchiveNote = (noteId: string) => {
		if (!idToken || !user?.sub) return;
		const note = notes.find((n) => n.id === noteId);
		if (!note) return;
		const updatedNote = { ...note, isArchived: !note.isArchived };
		delete (updatedNote as any)._id;
		toggleArchiveMutation.mutate({
			note: updatedNote,
			idToken,
			userId: user.sub,
		});
	};
	const restoreNote = (noteId: string) => {
		if (!idToken || !user?.sub) return;
		restoreNoteMutation.mutate({ id: noteId, idToken, userId: user.sub });
	};
	const permanentlyDeleteNote = (noteId: string) => {
		if (!idToken || !user?.sub) return;
		permanentlyDeleteNoteMutation.mutate({
			id: noteId,
			idToken,
			userId: user.sub,
		});
	};

	const setSearchQuery = (query: string) =>
		dispatch({ type: "SET_SEARCH", payload: query });
	const setSelectedTags = (tags: string[]) =>
		dispatch({ type: "SET_SELECTED_TAGS", payload: tags });
	const setSort = (
		sortBy: FilterState["sortBy"],
		sortOrder: FilterState["sortOrder"]
	) => {
		dispatch({ type: "SET_SORT", payload: { sortBy, sortOrder } });
	};
	const setViewMode = (mode: "grid" | "list") =>
		dispatch({ type: "SET_VIEW_MODE", payload: mode });

	// --- Context Value ---
	const value: NotesContextType = {
		notes,
		filteredNotes,
		isLoading,
		isError,
		filters,
		createNote,
		updateNote,
		deleteNote,
		togglePinNote,
		toggleArchiveNote,
		restoreNote,
		permanentlyDeleteNote,
		setSearchQuery,
		setSelectedTags,
		setSort,
		setViewMode,
		setShowArchived,
		setShowDeleted,
	};

	return (
		<NotesContext.Provider value={value}>{children}</NotesContext.Provider>
	);
};

// 6. The consumer hook remains the same but provides the new context type.
export const useNotes = (): NotesContextType => {
	const context = useContext(NotesContext);
	if (context === undefined) {
		throw new Error("useNotes must be used within a NotesProvider");
	}
	return context;
};

// import React, { createContext, useContext, useReducer, useEffect } from "react";
// import { Note, NoteState } from "@/types/NoteAttributes";
// import {
// 	getNotesState,
// 	saveNotesState,
// 	addToHistory,
// 	undo,
// 	redo,
// 	getFilteredNotes,
// } from "@/lib/noteUtils";

// type NotesAction =
// 	| { type: "SET_NOTES"; payload: Note[] }
// 	| { type: "ADD_NOTE"; payload: Note }
// 	| { type: "UPDATE_NOTE"; payload: Note }
// 	| { type: "DELETE_NOTE"; payload: string }
// 	| { type: "RESTORE_NOTE"; payload: string }
// 	| { type: "TOGGLE_PIN"; payload: string }
// 	| { type: "TOGGLE_ARCHIVE"; payload: string }
// 	| { type: "SET_SEARCH"; payload: string }
// 	| { type: "SET_SELECTED_TAGS"; payload: string[] }
// 	| {
// 			type: "SET_SORT";
// 			payload: {
// 				sortBy: "updatedAt" | "createdAt" | "title";
// 				sortOrder: "asc" | "desc";
// 			};
// 	  }
// 	| { type: "SET_SHOW_ARCHIVED"; payload: boolean }
// 	| { type: "SET_SHOW_DELETED"; payload: boolean }
// 	| { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
// 	| { type: "UNDO" }
// 	| { type: "REDO" };

// interface NotesContextType {
// 	state: NoteState;
// 	filteredNotes: Note[];
// 	dispatch: React.Dispatch<NotesAction>;
// 	canUndo: boolean;
// 	canRedo: boolean;
// }

// const NotesContext = createContext<NotesContextType | undefined>(undefined);

// const notesReducer = (state: NoteState, action: NotesAction): NoteState => {
// 	switch (action.type) {
// 		case "SET_NOTES":
// 			return addToHistory(state, action.payload);

// 		case "ADD_NOTE":
// 			return addToHistory(state, [...state.notes, action.payload]);

// 		case "UPDATE_NOTE": {
// 			const updatedNotes = state.notes.map((note) =>
// 				note.id === action.payload.id ? action.payload : note
// 			);
// 			return addToHistory(state, updatedNotes);
// 		}

// 		case "DELETE_NOTE": {
// 			const updatedNotes = state.notes.map((note) =>
// 				note.id === action.payload
// 					? { ...note, isDeleted: true, deletedAt: new Date() }
// 					: note
// 			);
// 			return addToHistory(state, updatedNotes);
// 		}

// 		case "RESTORE_NOTE": {
// 			const updatedNotes = state.notes.map((note) =>
// 				note.id === action.payload
// 					? { ...note, isDeleted: false, deletedAt: undefined }
// 					: note
// 			);
// 			return addToHistory(state, updatedNotes);
// 		}

// 		case "TOGGLE_PIN": {
// 			const updatedNotes = state.notes.map((note) =>
// 				note.id === action.payload
// 					? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
// 					: note
// 			);
// 			return addToHistory(state, updatedNotes);
// 		}

// 		case "TOGGLE_ARCHIVE": {
// 			const updatedNotes = state.notes.map((note) =>
// 				note.id === action.payload
// 					? { ...note, isArchived: !note.isArchived, updatedAt: new Date() }
// 					: note
// 			);
// 			return addToHistory(state, updatedNotes);
// 		}

// 		case "SET_SEARCH":
// 			return { ...state, searchQuery: action.payload };

// 		case "SET_SELECTED_TAGS":
// 			return { ...state, selectedTags: action.payload };

// 		case "SET_SORT":
// 			return {
// 				...state,
// 				sortBy: action.payload.sortBy,
// 				sortOrder: action.payload.sortOrder,
// 			};

// 		case "SET_SHOW_ARCHIVED":
// 			return { ...state, showArchived: action.payload };

// 		case "SET_SHOW_DELETED":
// 			return { ...state, showDeleted: action.payload };

// 		case "SET_VIEW_MODE":
// 			return { ...state, viewMode: action.payload };

// 		case "UNDO":
// 			return undo(state);

// 		case "REDO":
// 			return redo(state);

// 		default:
// 			return state;
// 	}
// };

// export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
// 	children,
// }) => {
// 	const [state, dispatch] = useReducer(notesReducer, getNotesState());

// 	// Save state to localStorage whenever it changes
// 	useEffect(() => {
// 		saveNotesState(state);
// 	}, [state]);

// 	const filteredNotes = getFilteredNotes(state);
// 	const canUndo = state.historyIndex > 0;
// 	const canRedo = state.historyIndex < state.history.length - 1;

// 	return (
// 		<NotesContext.Provider
// 			value={{
// 				state,
// 				filteredNotes,
// 				dispatch,
// 				canUndo,
// 				canRedo,
// 			}}
// 		>
// 			{children}
// 		</NotesContext.Provider>
// 	);
// };

// export const useNotes = () => {
// 	const context = useContext(NotesContext);
// 	if (context === undefined) {
// 		throw new Error("useNotes must be used within a NotesProvider");
// 	}
// 	return context;
// };

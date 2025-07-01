// src/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notesApi from "@/api/notes-api";
import { Note } from "@/types/NoteAttributes";

// The query key is used by TanStack Query to manage caching
const NOTES_QUERY_KEY = ["notes"];

/**
 * Hook to fetch all notes.
 * Components using this will automatically re-render when data changes.
 */
export const useGetNotes = (idToken: string, userId: string) => {
	return useQuery({
		queryKey: [...NOTES_QUERY_KEY, idToken, userId],
		queryFn: () => notesApi.fetchNotes({ idToken, userId }),
	});
};

/**
 * Hook to create a new note.
 * It invalidates the notes query on success to refetch and show the new note.
 */
export const useCreateNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.createNote,
		onSuccess: () => {
			// Invalidate and refetch the notes list to include the new one
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

/**
 * Hook to update a note with optimistic updates.
 * The UI updates instantly, and rolls back if the server call fails.
 */
export const useUpdateNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.updateNoteApi,
		// Start of optimistic update logic
		onMutate: async (variables: {
			updatedNote: Note;
			idToken: string;
			userId: string;
		}) => {
			// Cancel any outgoing refetches to prevent them from overwriting our optimistic update
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });

			// Snapshot the previous value
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);

			// Optimistically update to the new value
			if (previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.updatedNote.id ? variables.updatedNote : note
					)
				);
			}

			// Return a context object with the snapshotted value
			return { previousNotes };
		},
		// If the mutation fails, use the context returned from onMutate to roll back
		onError: (_err, _newNote, context) => {
			if (context?.previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					context.previousNotes
				);
			}
		},
		// Always refetch after error or success to ensure server-client state consistency
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

/**
 * Hook to delete a note with optimistic updates.
 */
export const useSoftDeleteNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.softDeleteNoteApi,
		onMutate: async (variables: {
			id: string;
			idToken: string;
			userId: string;
		}) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);
			if (previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.id ? { ...note, isDeleted: true } : note
					)
				);
			}
			return { previousNotes };
		},
		onError: (_err, _variables, context) => {
			context?.previousNotes &&
				queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

/**
 * Hook to toggle pin a note with optimistic updates.
 * The UI updates instantly, and rolls back if the server call fails.
 */
export const useTogglePinNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.togglePinNote,
		onMutate: async (variables: {
			note: Note;
			idToken: string;
			userId: string;
		}) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);
			if (previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.note.id ? variables.note : note
					)
				);
			}
			return { previousNotes };
		},
		onError: (_err, _variables, context) => {
			context?.previousNotes &&
				queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

export const useToggleArchiveNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.toggleArchiveNote,
		onMutate: async (variables: {
			note: Note;
			idToken: string;
			userId: string;
		}) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);
			if (previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.note.id ? variables.note : note
					)
				);
			}
			return { previousNotes };
		},
		onError: (_err, _variables, context) => {
			context?.previousNotes &&
				queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

export const useRestoreNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.restoreNoteApi,
		onMutate: async (variables: {
			id: string;
			idToken: string;
			userId: string;
		}) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);
			if (previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.id
							? { ...note, isDeleted: false, deletedAt: undefined }
							: note
					)
				);
			}
			return { previousNotes };
		},
		onError: (_err, _variables, context) => {
			context?.previousNotes &&
				queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

export const usePermanentlyDeleteNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: notesApi.permanentlyDeleteNoteApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

/**
 * Hook to toggle a checklist item's completed state with optimistic updates.
 * The UI updates instantly, and rolls back if the server call fails.
 */
export const useToggleChecklistItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (variables: {
			note: Note;
			itemId: string;
			checked: boolean;
			idToken: string;
			userId: string;
		}) => {
			const { note, itemId, checked, idToken, userId } = variables;
			const updatedChecklist = note.checklist.map((item) =>
				item.id === itemId ? { ...item, completed: checked } : item
			);
			const updatedNote = { ...note, checklist: updatedChecklist };
			return notesApi.updateNoteApi({ updatedNote, idToken, userId });
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
			const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY);
			if (previousNotes) {
				const updatedChecklist = variables.note.checklist.map((item) =>
					item.id === variables.itemId
						? { ...item, completed: variables.checked }
						: item
				);
				const updatedNote = { ...variables.note, checklist: updatedChecklist };
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					previousNotes.map((note) =>
						note.id === variables.note.id ? updatedNote : note
					)
				);
			}
			return { previousNotes };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousNotes) {
				queryClient.setQueryData<Note[]>(
					NOTES_QUERY_KEY,
					context.previousNotes
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
		},
	});
};

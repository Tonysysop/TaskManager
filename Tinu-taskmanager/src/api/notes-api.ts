// src/api/notes.ts
import axios from "axios";
import { Note } from "@/types/NoteAttributes";

const API_BASE = import.meta.env.VITE_API_URL;

const createAxiosInstance = (idToken: string) =>
	axios.create({
		baseURL: API_BASE,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${idToken}`,
		},
	});

export const fetchNotes = async ({
	idToken,
	userId,
}: {
	idToken: string;
	userId: string;
}): Promise<Note[]> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const response = await axiosInstance.get<Note[]>(`/notes?userId=${userId}`);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "fetch notes");
	}
};

export const fetchNoteById = async ({
	id,
	idToken,
	userId,
}: {
	id: string;
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const response = await axiosInstance.get<Note>(
			`/notes/${id}?userId=${userId}`
		);
		return response.data;
	} catch (error) {
		handleAxiosError(error, `fetch note ${id}`);
	}
};

export const createNote = async ({
	newNote,
	idToken,
	userId,
}: {
	newNote: Omit<Note, "id" | "createdAt" | "updatedAt" | "deletedAt">;
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const response = await axiosInstance.post<Note>(`/notes?userId=${userId}`, {
			...newNote,
		});
		return response.data;
	} catch (error) {
		handleAxiosError(error, "create note");
	}
};

export const updateNoteApi = async ({
	updatedNote,
	idToken,
	userId,
}: {
	updatedNote: Note;
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const { _id, ...payload } = updatedNote as any;
		console.log(
			"PATCH /notes/" + updatedNote.id + "?userId=" + userId,
			payload
		);
		const response = await axiosInstance.patch<Note>(
			`/notes?userId=${userId}`,
			payload
		);
		return response.data;
	} catch (error) {
		handleAxiosError(error, `update note ${updatedNote.id}`);
	}
};

export const softDeleteNoteApi = async ({
	id,
	idToken,
	userId,
}: {
	id: string;
	idToken: string;
	userId: string;
}): Promise<void> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const payload = { id, isDeleted: true };
		await axiosInstance.patch(`/notes?userId=${userId}`, payload);
	} catch (error) {
		handleAxiosError(error, `soft delete note ${id}`);
	}
};

export const togglePinNote = async ({
	note,
	idToken,
	userId,
}: {
	note: Note;
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const payload = { ...note, id: note.id };
		console.log("PATCH /notes/" + note.id + "?userId=" + userId, payload);
		const response = await axiosInstance.patch<Note>(
			`/notes?userId=${userId}`,
			payload
		);
		return response.data;
	} catch (error) {
		handleAxiosError(error, `toggle pin for note ${note.id}`);
	}
};

export const toggleArchiveNote = async ({
	note,
	idToken,
	userId,
}: {
	note: Note;
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const payload = { ...note, id: note.id };
		const response = await axiosInstance.patch<Note>(
			`/notes?userId=${userId}`,
			payload
		);
		return response.data;
	} catch (error) {
		handleAxiosError(error, `toggle archive for note ${note.id}`);
	}
};

export const restoreNoteApi = async ({
	id,
	idToken,
	userId,
}: {
	id: string;
	idToken: string;
	userId: string;
}): Promise<void> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const payload = { id, isDeleted: false, deletedAt: undefined };
		await axiosInstance.patch(`/notes?userId=${userId}`, payload);
	} catch (error) {
		handleAxiosError(error, `restore note ${id}`);
	}
};

export const permanentlyDeleteNoteApi = async ({
	id,
	idToken,
	userId,
}: {
	id: string;
	idToken: string;
	userId: string;
}): Promise<void> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		await axiosInstance.delete(`/notes?userId=${userId}`, {
			data: { id },
		});
	} catch (error) {
		handleAxiosError(error, `permanently delete note ${id}`);
	}
};


export const updateChecklistApi = async ({
	noteId,
	checklist,
	idToken,
	userId,
}: {
	noteId: string;
	checklist: { id: string; text: string; checked: boolean }[];
	idToken: string;
	userId: string;
}): Promise<Note> => {
	try {
		const axiosInstance = createAxiosInstance(idToken);
		const payload = { id: noteId, checklist };
		const response = await axiosInstance.patch<Note>(
			`/notes?userId=${userId}`,
			payload
		);
		return response.data;
	} catch (error) {
		handleAxiosError(error, `update checklist for note ${noteId}`);
	}
};



// Centralized error handler
function handleAxiosError(error: unknown, context: string): never {
	if (axios.isAxiosError(error) && error.response) {
		console.error(`Error ${context}:`, error.response.data);
		throw new Error(
			`Failed to ${context}: ${error.response.statusText || "Unknown error"}`
		);
	}
	console.error(`Unknown error ${context}:`, error);
	throw new Error(`Failed to ${context}`);
}

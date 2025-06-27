export interface ChecklistItem {
	id: string;
	text: string;
	completed: boolean;
}

export interface Tag {
	name: string;
	color: string;
	
}

export interface Note {
	userId: string;
	name: string,
	email: string
	id: string;
	title: string;
	content: string;
	checklist: ChecklistItem[];
	createdAt: Date;
	updatedAt: Date;
	tags: Tag[];
	isPinned: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	deletedAt?: Date;
}

export interface NoteState {
	notes: Note[];
	history: Note[][];
	historyIndex: number;
	searchQuery: string;
	selectedTags: string[];
	sortBy: "updatedAt" | "createdAt" | "title";
	sortOrder: "asc" | "desc";
	showArchived: boolean;
	showDeleted: boolean;
	viewMode: "grid" | "list";
}

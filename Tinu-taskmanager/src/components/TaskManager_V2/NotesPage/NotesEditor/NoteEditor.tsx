import React, { useEffect, useState, useCallback } from "react";
import { Save, FileText, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Note, ChecklistItem } from "@/types/NoteAttributes";
import { useNotes } from "@/Context/NotesContext";
import NoteHeader from "./NoteHeader";
import FormattingToolbar from "./FormattingToolbar";
import ChecklistManager from "./ChecklistManager";
import { TagSelector } from "@/components/TaskManager_V2/TagSelector";
import { useAuth } from "@/Context/AuthContext";
import { useTags } from "@/Context/TagContext";
import { v4 as uuid } from "uuid";

interface NoteEditorProps {
	onBack: () => void;
	editingNote?: Note | null;
	onNoteCreated?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
	onBack,
	editingNote,
	onNoteCreated,
}) => {
	const { createNote, updateNote } = useNotes();
	const { user } = useAuth();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | undefined>();

	const { tags: allAvailableTags } = useTags();

	// Initialize form with editing note data
	useEffect(() => {
		if (editingNote) {
			setTitle(editingNote.title);
			setContent(editingNote.content);
			setChecklist(editingNote.checklist || []);
			setSelectedTags(editingNote.tags.map((tag) => tag.name));
			setLastSaved(editingNote.updatedAt);
		} else {
			setTitle("");
			setContent("");
			setChecklist([]);
			setSelectedTags([]);
			setLastSaved(undefined);
		}
		setHasUnsavedChanges(false);
	}, [editingNote]);

	const handleSave = useCallback(
		(isAutoSave = false) => {
			if (!title.trim()) {
				if (!isAutoSave) {
					// Show error for manual save
					return;
				}
				return;
			}

			const noteData: Omit<Note, "_id" | "createdAt" | "updatedAt"> = {
				userId: user?.sub || "",
				name: user?.name || "",
				email: user?.email || "",
				title: title.trim(),
				content: content.trim(),
				id: editingNote?.id || uuid(),
				checklist,
				tags: selectedTags.map((tagName) => {
					const existingTag = allAvailableTags.find(
						(tag) => tag.name === tagName
					);
					return existingTag || { name: tagName, color: "blue" };
				}),
				isPinned: editingNote?.isPinned || false,
				isArchived: editingNote?.isArchived || false,
				isDeleted: editingNote?.isDeleted || false,
			};

			if (editingNote) {
				updateNote({ ...editingNote, ...noteData, updatedAt: new Date() });
			} else {
				createNote(noteData);
			}

			setHasUnsavedChanges(false);
			setLastSaved(new Date());

			if (!isAutoSave) {
				if (onNoteCreated) {
					onNoteCreated();
				} else {
					onBack();
				}
			}
		},
		[
			title,
			content,
			checklist,
			selectedTags,
			editingNote,
			allAvailableTags,
			createNote,
			updateNote,
			onNoteCreated,
			onBack,
			user,
		]
	);

	const handleDiscard = () => {
		if (hasUnsavedChanges) {
			const confirmed = window.confirm(
				"You have unsaved changes. Are you sure you want to discard them?"
			);
			if (!confirmed) return;
		}
		onBack();
	};

	const handleTagSelect = (tagName: string) => {
		if (selectedTags.includes(tagName)) {
			setSelectedTags(selectedTags.filter((t) => t !== tagName));
		} else {
			setSelectedTags([...selectedTags, tagName]);
		}
	};

	const handleRemoveTag = (tagName: string) => {
		setSelectedTags(selectedTags.filter((t) => t !== tagName));
	};

	const insertFormatting = (format: string) => {
		const textarea = document.getElementById(
			"note-content"
		) as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		let formattedText = "";
		switch (format) {
			case "bold":
				formattedText = `**${selectedText || "bold text"}**`;
				break;
			case "italic":
				formattedText = `*${selectedText || "italic text"}*`;
				break;
			case "underline":
				formattedText = `<u>${selectedText || "underlined text"}</u>`;
				break;
			case "h1":
				formattedText = `# ${selectedText || "Heading 1"}`;
				break;
			case "h2":
				formattedText = `## ${selectedText || "Heading 2"}`;
				break;
			case "bullet-list":
				formattedText = `- ${selectedText || "List item"}`;
				break;
			case "numbered-list":
				formattedText = `1. ${selectedText || "List item"}`;
				break;
			case "quote":
				formattedText = `> ${selectedText || "Quote"}`;
				break;
			case "code":
				formattedText = `\`${selectedText || "code"}\``;
				break;
			case "link":
				formattedText = `[${selectedText || "link text"}](url)`;
				break;
			default:
				formattedText = selectedText;
		}

		const newContent =
			content.substring(0, start) + formattedText + content.substring(end);
		setContent(newContent);

		// Restore focus and selection
		setTimeout(() => {
			textarea.focus();
			const newCursorPos = start + formattedText.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
			<NoteHeader
				onBack={onBack}
				onSave={() => handleSave(false)}
				onDiscard={handleDiscard}
				isEditing={!!editingNote}
				lastSaved={lastSaved}
				hasUnsavedChanges={hasUnsavedChanges}
			/>

			<div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
				{/* Title Section */}
				<div className="space-y-2">
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter note title..."
						className="text-3xl font-bold border-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 px-0 py-2 text-gray-900 dark:text-white"
					/>
					{!title.trim() && hasUnsavedChanges && (
						<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
							<AlertCircle className="w-4 h-4" />
							<span>Title is required to save the note</span>
						</div>
					)}
				</div>

				{/* Tags Section */}
				<TagSelector
					tagPopoverOpen={tagPopoverOpen}
					setTagPopoverOpen={setTagPopoverOpen}
					tags={allAvailableTags}
					watchedTags={selectedTags}
					handleTagSelect={handleTagSelect}
					handleRemoveTag={handleRemoveTag}
				/>

				{/* Formatting Toolbar */}
				<FormattingToolbar onInsertFormatting={insertFormatting} />

				{/* Content Section */}
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
						<FileText className="w-4 h-4" />
						<span>Content</span>
					</div>
					<Textarea
						id="note-content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Start writing your note... Use the formatting toolbar above to style your text."
						className="min-h-[200px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 resize-none text-base leading-relaxed p-6 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 dark:text-white dark:placeholder-gray-400"
					/>
				</div>

				{/* Checklist Section */}
				<ChecklistManager
					checklist={checklist}
					onUpdateChecklist={setChecklist}
				/>

				{/* Save Status */}
				{hasUnsavedChanges && (
					<div className="fixed bottom-6 right-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-lg">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
							<span className="text-sm text-gray-700 dark:text-gray-300">Unsaved changes</span>
							<Button
								size="sm"
								onClick={() => handleSave(false)}
								className="ml-2"
								disabled={!title.trim()}
							>
								<Save className="w-3 h-3 mr-1" />
								Save Now
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default NoteEditor;

// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useForm, FormProvider } from "react-hook-form";
// import { toast } from "sonner";
// import { Note, ChecklistItem } from "@/types/NoteAttributes";
// import { v4 as uuid } from "uuid";
// import { useNotes } from "@/Context/NotesContext";
// import { useTags } from "@/Context/TagContext";
// import NoteHeader from "./NoteHeader";
// import FormattingToolbar from "./FormattingToolbar";
// import ChecklistManager from "./ChecklistManager";
// import { TagSelector } from "../TagSelector";
// import { useAuth } from "@/Context/AuthContext";

// interface NoteEditorProps {
// 	onBack: () => void;
// 	editingNote?: Note | null;
// 	onNoteCreated?: () => void;
// }

// type NoteFormValues = {
// 	title: string;
// 	content: string;
// 	checklist: ChecklistItem[];
// 	tag: string[];
// };

// const NoteEditor = ({
// 	onBack,
// 	editingNote,
// 	onNoteCreated,
// }: NoteEditorProps) => {
// 	const form = useForm<NoteFormValues>({
// 		defaultValues: {
// 			title: "",
// 			content: "",
// 			checklist: [],
// 			tag: [],
// 		},
// 	});

// 	const { tags: allAvailableTags } = useTags();
// 	const { createNote, updateNote } = useNotes();
// 	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
// 	const { user } = useAuth();

// 	const { register, watch, setValue, getValues, handleSubmit, reset } = form;

// 	const watchedTags = watch("tag");
// 	const watchedChecklist = watch("checklist");

// 	useEffect(() => {
// 		if (editingNote) {
// 			reset({
// 				title: editingNote.title,
// 				content: editingNote.content,
// 				checklist: editingNote.checklist || [],
// 				tag: editingNote.tags.map((tag) => tag.name),
// 			});
// 		} else {
// 			reset();
// 		}
// 	}, [editingNote, reset]);

// 	const onSubmit = (data: NoteFormValues) => {
// 		if (!data.title.trim()) {
// 			toast("Title Required", {
// 				description: "Please add a title to your note.",
// 			});
// 			return;
// 		}

// 		if (!user?.sub) {
// 			toast("User not authenticated", {
// 				description: "Cannot save note without user ID.",
// 			});
// 			return;
// 		}

// 		const selectedTags = allAvailableTags.filter((tag) =>
// 			data.tag.includes(tag.name)
// 		);

// 		const note: Note = {
// 			id: editingNote?.id || uuid(),
// 			title: data.title.trim(),
// 			content: data.content.trim(),
// 			checklist: data.checklist,
// 			tags: selectedTags,
// 			createdAt: editingNote?.createdAt || new Date(),
// 			updatedAt: new Date(),
// 			isPinned: editingNote?.isPinned || false,
// 			isArchived: editingNote?.isArchived || false,
// 			isDeleted: editingNote?.isDeleted || false,
// 			deletedAt: editingNote?.deletedAt,
// 			userId: user.sub,
// 			name: user?.name,
// 			email: user?.email,
// 		};

// 		if (editingNote) {
// 			updateNote(note);
// 		} else {
// 			createNote(note);
// 		}

// 		toast("Note Saved", {
// 			description: "Your note has been saved successfully!",
// 		});

// 		if (onNoteCreated) {
// 			onNoteCreated();
// 		} else {
// 			onBack();
// 		}
// 	};

// 	const handleTagSelect = (tagName: string) => {
// 		const current = watchedTags || [];
// 		if (current.includes(tagName)) {
// 			setValue(
// 				"tag",
// 				current.filter((t) => t !== tagName)
// 			);
// 		} else {
// 			setValue("tag", [...current, tagName]);
// 		}
// 	};

// 	const handleRemoveTag = (tagName: string) => {
// 		const current = watchedTags || [];
// 		setValue(
// 			"tag",
// 			current.filter((t) => t !== tagName)
// 		);
// 	};

// 	const insertFormatting = (format: string) => {
// 		const textarea = document.getElementById(
// 			"note-content"
// 		) as HTMLTextAreaElement;
// 		if (!textarea) return;

// 		const start = textarea.selectionStart;
// 		const end = textarea.selectionEnd;
// 		const content = getValues("content");
// 		const selectedText = content.substring(start, end);

// 		let formattedText = "";
// 		switch (format) {
// 			case "bold":
// 				formattedText = `**${selectedText || "bold text"}**`;
// 				break;
// 			case "italic":
// 				formattedText = `*${selectedText || "italic text"}*`;
// 				break;
// 			case "heading":
// 				formattedText = `# ${selectedText || "Heading"}`;
// 				break;
// 			case "list":
// 				formattedText = `- ${selectedText || "List item"}`;
// 				break;
// 		}

// 		const newContent =
// 			content.substring(0, start) + formattedText + content.substring(end);
// 		setValue("content", newContent);
// 	};

// 	return (
// 		<FormProvider {...form}>
// 			<form onSubmit={handleSubmit(onSubmit)}>
// 				<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
// 					<NoteHeader onBack={onBack} onSave={handleSubmit(onSubmit)} />

// 					<div className="max-w-4xl mx-auto p-6 space-y-6">
// 						{/* Title */}
// 						<Input
// 							placeholder="Note title..."
// 							{...register("title")}
// 							className="text-2xl font-bold border-none bg-transparent placeholder:text-gray-400 focus:ring-0 px-0"
// 						/>

// 						{/* TagSelor */}
// 						<TagSelector
// 							tagPopoverOpen={tagPopoverOpen}
// 							setTagPopoverOpen={setTagPopoverOpen}
// 							tags={allAvailableTags}
// 							watchedTags={watchedTags}
// 							handleTagSelect={handleTagSelect}
// 							handleRemoveTag={handleRemoveTag}
// 							errorMessage={undefined}
// 						/>

// 						{/* Toolbar */}
// 						<FormattingToolbar onInsertFormatting={insertFormatting} />

// 						{/* Content */}
// 						<Textarea
// 							id="note-content"
// 							placeholder="Start writing your note..."
// 							{...register("content")}
// 							className="min-h-[300px] bg-white/70 backdrop-blur-sm border-gray-200 resize-none text-lg leading-relaxed"
// 						/>

// 						{/* Checklist */}
// 						<ChecklistManager
// 							checklist={watchedChecklist}
// 							onUpdateChecklist={(newList) => setValue("checklist", newList)}
// 						/>
// 					</div>
// 				</div>
// 			</form>
// 		</FormProvider>
// 	);
// };

// export default NoteEditor;

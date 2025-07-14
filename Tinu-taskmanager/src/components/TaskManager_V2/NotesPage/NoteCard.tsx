import React, { useState } from "react";
import {
	Pin,
	Archive,
	Trash2,
	CheckSquare,
	RotateCcw,
	Edit3,
	Clock,
	Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/NoteAttributes";
import TaskTag from "@/components/TaskManager_V2/TaskTag";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

interface NoteCardProps {
	note: Note;
	onEditNote: (note: Note) => void;
	onTogglePin: (noteId: string) => void;
	onToggleArchive: (noteId: string) => void;
	onDeleteNote: (noteId: string) => void;
	onRestoreNote: (noteId: string) => void;
	onPermanentDelete: (noteId: string) => void;
	userId?: string;
	idToken?: string;
	onToggleChecklist?: (
		noteId: string,
		checklistItemId: string,
		completed: boolean
	) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
	note,
	onEditNote,
	onTogglePin,
	onToggleArchive,
	onDeleteNote,
	onRestoreNote,
	onPermanentDelete,
	onToggleChecklist,
}) => {
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	};

	return (
		<Card
			className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 ${
				note.isPinned
					? "ring-2 ring-yellow-400/50 dark:ring-yellow-600/50 shadow-lg"
					: ""
			} ${note.isDeleted ? "opacity-75 grayscale" : ""} ${
				note.isArchived ? "opacity-90" : ""
			}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex items-center gap-2 flex-1 mr-2">
						{note.isPinned && (
							<Pin className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current flex-shrink-0" />
						)}
						<span className="break-words">{note.title}</span>
					</CardTitle>
					<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
						{!note.isDeleted && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onTogglePin(note.id)}
											className={`p-2 h-auto rounded-lg transition-all duration-200 ${
												note.isPinned
													? "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/20"
													: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
											}`}
										>
											<Pin
												className={`w-4 h-4 ${
													note.isPinned ? "fill-current" : ""
												}`}
											/>
										</Button>
									</TooltipTrigger>
									<TooltipContent>Pin note</TooltipContent>
								</Tooltip>
								<Dialog
									open={isViewModalOpen}
									onOpenChange={setIsViewModalOpen}
								>
									<Tooltip>
										<TooltipTrigger asChild>
											<DialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="p-2 h-auto rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
												>
													<Eye className="w-4 h-4" />
												</Button>
											</DialogTrigger>
										</TooltipTrigger>
										<TooltipContent>View note</TooltipContent>
									</Tooltip>
									<DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
										<DialogHeader>
											<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
												{note.title}
											</DialogTitle>
											<DialogDescription className="text-gray-500 dark:text-gray-400">
												Last updated: {formatDate(note.updatedAt)}
											</DialogDescription>
										</DialogHeader>
										<div className="py-4 space-y-4">
											<div className="prose prose-sm dark:prose-invert max-w-none">
												<p>{note.content}</p>
											</div>
											{note.checklist.length > 0 && (
												<div>
													<h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
														Checklist
													</h4>
													<ul className="space-y-2">
														{note.checklist.map((item) => (
															<li
																key={item.id}
																className="flex items-center gap-2"
															>
																<CheckSquare
																	className={`w-4 h-4 ${
																		item.completed
																			? "text-green-500"
																			: "text-gray-400"
																	}`}
																/>
																<span
																	className={`${
																		item.completed
																			? "line-through text-gray-500"
																			: "text-gray-700 dark:text-gray-300"
																	}`}
																>
																	{item.text}
																</span>
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onEditNote(note)}
											className="p-2 h-auto rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
										>
											<Edit3 className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Edit note</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onToggleArchive(note.id)}
											className={`p-2 h-auto rounded-lg  transition-all duration-200 ${
												note.isArchived
													? "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 bg-green-50/50 dark:bg-green-900/20"
													: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
											}`}
										>
											<Archive className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Archive note</TooltipContent>
								</Tooltip>

							    <Tooltip>
									<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onDeleteNote(note.id)}
									className="p-2 h-auto rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
								>
											<Trash2 className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Delete note</TooltipContent>
								</Tooltip>
							</>
						)}
						{note.isDeleted && (
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onRestoreNote(note.id)}
									className="p-2 h-auto rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-all duration-200"
								>
									<RotateCcw className="w-4 h-4" />
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="p-2 h-auto rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Delete Note Permanently?
											</AlertDialogTitle>
											<AlertDialogDescription>
												This note will be permanently deleted and cannot be
												recovered. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												className="bg-destructive hover:bg-destructive/90 cursor-pointer"
												onClick={() => onPermanentDelete(note.id)}
											>
												Delete Forever
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						<Clock className="w-3 h-3" />
						<span className="text-xs">{formatDate(note.updatedAt)}</span>
					</div>
					<div className="flex gap-2">
						{note.isArchived && (
							<Badge
								variant="secondary"
								className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
							>
								<Archive className="w-3 h-3 mr-1" />
								Archived
							</Badge>
						)}
						{note.isDeleted && (
							<Badge variant="destructive" className="text-xs">
								<Trash2 className="w-3 h-3 mr-1" />
								Deleted
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{note.content && (
					<div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
						<p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
							{truncateText(note.content, 120)}
						</p>
					</div>
				)}

				{note.checklist.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
							<span className="font-medium">
								{note.checklist.filter((item) => item.completed).length} of{" "}
								{note.checklist.length} completed
							</span>
							<div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
								<div
									className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2 rounded-full transition-all duration-300"
									style={{
										width: `${
											(note.checklist.filter((item) => item.completed).length /
												note.checklist.length) *
											100
										}%`,
									}}
								/>
							</div>
						</div>
						<div className="space-y-2">
							{note.checklist.slice(0, 3).map((item) => (
								<div key={item.id} className="flex items-center gap-3 text-sm">
									<div
										className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
											item.completed
												? "bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600"
												: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
										}`}
										onClick={(e) => {
											e.stopPropagation();
											if (!note.isDeleted && onToggleChecklist) {
												onToggleChecklist(note.id, item.id, !item.completed);
											}
										}}
										style={{
											cursor: note.isDeleted ? "not-allowed" : "pointer",
										}}
									>
										{item.completed && (
											<CheckSquare className="w-3 h-3 text-white" />
										)}
									</div>
									<span
										className={`transition-all duration-200 ${
											item.completed
												? "line-through text-gray-500 dark:text-gray-400"
												: "text-gray-700 dark:text-gray-300"
										}`}
									>
										{truncateText(item.text, 40)}
									</span>
								</div>
							))}
							{note.checklist.length > 3 && (
								<div className="text-xs text-gray-500 dark:text-gray-400 ml-7 font-medium">
									+{note.checklist.length - 3} more items
								</div>
							)}
						</div>
					</div>
				)}

				{note.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{note.tags.map((tag) => (
							<TaskTag key={tag.name} tag={tag} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default NoteCard;

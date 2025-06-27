import React from "react";
import {
	Pin,
	Archive,
	Trash2,
	CheckSquare,
	RotateCcw,
	MoreHorizontal,
	Edit3,
	Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Note } from "@/types/NoteAttributes";
import TaskTag from "@/components/TaskManager_V2/TaskTag";

interface ListViewProps {
	notes: Note[];
	onEditNote: (note: Note) => void;
	onTogglePin: (noteId: string) => void;
	onToggleArchive: (noteId: string) => void;
	onDeleteNote: (noteId: string) => void;
	onRestoreNote: (noteId: string) => void;
	onPermanentDelete: (noteId: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
	notes,
	onEditNote,
	onTogglePin,
	onToggleArchive,
	onDeleteNote,
	onRestoreNote,
	onPermanentDelete,
}) => {
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatFullDateTime = (date: Date) => {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// const truncateText = (text: string, maxLength: number) => {
	// 	if (text.length <= maxLength) return text;
	// 	return text.substring(0, maxLength) + "...";
	// };

	if (notes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
				<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
					<svg
						className="w-12 h-12 text-gray-400"
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
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					No notes found
				</h3>
				<p className="text-gray-600 max-w-md">
					Create your first note or adjust your filters to see notes in this
					view.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
						<TableHead className="w-8 pl-6"></TableHead>
						<TableHead className="w-[250px] font-semibold text-gray-700">
							Title
						</TableHead>
						<TableHead className="w-[300px] font-semibold text-gray-700">
							Content
						</TableHead>
						<TableHead className="w-[180px] font-semibold text-gray-700">
							Tags
						</TableHead>
						<TableHead className="w-[120px] font-semibold text-gray-700">
							Progress
						</TableHead>
						<TableHead className="w-[140px] font-semibold text-gray-700">
							Modified
						</TableHead>
						<TableHead className="w-[120px] font-semibold text-gray-700">
							Status
						</TableHead>
						<TableHead className="w-[60px] text-right font-semibold text-gray-700 pr-6">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{notes.map((note) => (
						<TableRow
							key={note.id}
							className="group hover:bg-blue-50/30 transition-all duration-200"
						>
							<TableCell className="pl-6">
								{note.isPinned && (
									<Pin className="w-4 h-4 text-yellow-500 fill-current" />
								)}
							</TableCell>

							<TableCell className="font-medium">
								<button
									onClick={() => onEditNote(note)}
									className="text-left hover:text-blue-600 transition-colors duration-200 w-full text-gray-900 group-hover:text-blue-700"
									title={note.title}
								>
									<div className="max-w-[220px] truncate font-semibold">
										{note.title}
									</div>
								</button>
							</TableCell>

							<TableCell className="text-gray-600 text-sm">
								<div
									className="max-w-[280px] truncate leading-relaxed"
									title={note.content}
								>
									{note.content || (
										<span className="text-gray-400 italic">No content</span>
									)}
								</div>
							</TableCell>

							<TableCell>
								<div className="flex flex-wrap gap-1 max-w-[160px]">
									{note.tags.slice(0, 2).map((tag) => (
										<TaskTag key={tag.name} tag={tag} />
									))}
									{note.tags.length > 2 && (
										<Badge variant="secondary" className="text-xs px-2 py-0.5">
											+{note.tags.length - 2}
										</Badge>
									)}
								</div>
							</TableCell>

							<TableCell>
								{note.checklist.length > 0 ? (
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<CheckSquare className="w-4 h-4 text-blue-600" />
											<span className="font-medium">
												{note.checklist.filter((item) => item.completed).length}
												/{note.checklist.length}
											</span>
										</div>
										<div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
											<div
												className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
												style={{
													width: `${
														(note.checklist.filter((item) => item.completed)
															.length /
															note.checklist.length) *
														100
													}%`,
												}}
											/>
										</div>
									</div>
								) : (
									<span className="text-gray-400 text-sm">—</span>
								)}
							</TableCell>

							<TableCell
								className="text-sm text-gray-500"
								title={formatFullDateTime(note.updatedAt)}
							>
								<div className="flex items-center gap-2">
									<Clock className="w-3 h-3" />
									<span>{formatDate(note.updatedAt)}</span>
								</div>
							</TableCell>

							<TableCell>
								<div className="flex gap-1">
									{note.isArchived && (
										<Badge variant="secondary" className="text-xs">
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
							</TableCell>

							<TableCell className="text-right pr-6">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100"
										>
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										{note.isDeleted ? (
											<>
												<DropdownMenuItem
													onClick={() => onRestoreNote(note.id)}
													className="text-green-600 hover:text-green-700 hover:bg-green-50"
												>
													<RotateCcw className="mr-2 h-4 w-4" />
													<span>Restore Note</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
															onClick={(e) => e.preventDefault()}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															<span>Delete Forever</span>
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Note Permanently?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This note will be permanently deleted and cannot
																be recovered. This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => onPermanentDelete(note.id)}
															>
																Delete Forever
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</>
										) : (
											<>
												<DropdownMenuItem
													onClick={() => onEditNote(note)}
													className="hover:bg-blue-50 hover:text-blue-700"
												>
													<Edit3 className="mr-2 h-4 w-4" />
													<span>Edit Note</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => onTogglePin(note.id)}
													className={`${
														note.isPinned
															? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
															: "hover:bg-yellow-50 hover:text-yellow-700"
													}`}
												>
													<Pin className="mr-2 h-4 w-4" />
													<span>
														{note.isPinned ? "Unpin Note" : "Pin Note"}
													</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => onToggleArchive(note.id)}
													className={`${
														note.isArchived
															? "text-green-600 hover:text-green-700 hover:bg-green-50"
															: "hover:bg-green-50 hover:text-green-700"
													}`}
												>
													<Archive className="mr-2 h-4 w-4" />
													<span>
														{note.isArchived ? "Unarchive" : "Archive"}
													</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => onDeleteNote(note.id)}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													<span>Move to Trash</span>
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default ListView;

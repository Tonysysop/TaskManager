import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination"; // Assuming this hook exists and works
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
	Bug,
	MessageSquare,
	Star,
	Search,
	Filter,
	MoreHorizontal,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/Context/AuthContext"; // Assuming this context provides user and idToken
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and useQueryClient
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import CustomToast from "../Alerts/Custom-toast";
import { cn } from "@/lib/utils";

interface FeedbackItem {
	feedbackId: string;
	name: string;
	email: string;
	feedback: string;
	feedbackType: string;
	visibility: "public" | "private";
	createdAt: string;
	userId: string;
	treated: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL;

const FeedbackList = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const paginationItemsToDisplay = 5;
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");

	const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
		null
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// State for the confirmation dialog
	const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
	const [feedbackIdToDelete, setFeedbackIdToDelete] = useState<string | null>(
		null
	);

	const { user, idToken } = useAuth();

	const queryClient = useQueryClient();

	const isAdmin = user?.groups?.includes("Tinumind-admin");

	// API Call: DELETE feedback
	const deleteFeedback = async (
		feedbackId: string,
		userId: string,
		userGroup: string | undefined,
		token: string | null | undefined
	): Promise<{ message: string }> => {
		if (!feedbackId || !userId || !token) {
			throw new Error("Missing required parameters for deletion");
		}

		const response = await fetch(`${API_BASE}/feedback`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ feedbackId, userId, userGroup }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to delete feedback: ${response.status} - ${errorText}`
			);
		}

		return response.json();
	};

	// React Query Mutation for DELETE feedback
	const { mutate: mutateDeleteFeedback } = useMutation({
		mutationFn: ({
			feedbackId,
			userId,
			userGroup,
			token,
		}: {
			feedbackId: string;
			userId: string;
			userGroup: string | undefined;
			token: string | null | undefined;
		}) => deleteFeedback(feedbackId, userId, userGroup, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["feedback", user?.sub] }); // Invalidate to refetch the list

			CustomToast({
				variant: "success",
				description: data.message,
				duration: 3000,
			});
		},
		onError: (error) => {
			console.error("Failed to delete feedback:", error);
			CustomToast({
				variant: "error",
				description: `Failed to delete Feedback: ${error.message}`,
				duration: 3000,
			});
		},
	});

	// API Call: PATCH feedback - updating 'treated' flag (only admin allowed)
	const updateFeedback = async (
		feedbackId: string,
		treated: boolean,
		userGroup: string | undefined,
		token: string | null | undefined
	): Promise<{ message: string; treated: boolean }> => {
		if (!feedbackId || typeof treated !== "boolean" || !token) {
			throw new Error("Missing required parameters for update");
		}

		const response = await fetch(`${API_BASE}/feedback`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ feedbackId, treated, userGroup }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to update feedback: ${response.status} - ${errorText}`
			);
		}

		return response.json();
	};

	// React Query Mutation for PATCH feedback
	const { mutate: mutateUpdateFeedback } = useMutation({
		mutationFn: ({
			feedbackId,
			treated,
			userGroup,
			token,
		}: {
			feedbackId: string;
			treated: boolean;
			userGroup: string | undefined;
			token: string | null | undefined;
		}) => updateFeedback(feedbackId, treated, userGroup, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["feedback", user?.sub] }); // Invalidate to refetch the list
			CustomToast({
				variant: "success",
				description: data.message,
				duration: 6000,
			});

			// You could also do an optimistic update here if you want faster UI feedback
		},
		onError: (error) => {
			console.error("Failed to update feedback:", error);

			CustomToast({
				variant: "error",
				description: `Failed to update Feedback: ${error.message}`,
				duration: 6000,
			});
		},
	});

	const getFeedback = async (
		userId: string | undefined,
		token: string | null | undefined,
		group?: string
	): Promise<FeedbackItem[]> => {
		if (!userId || !token) throw new Error("User not authenticated");

		const response = await fetch(
			`${API_BASE}/feedback?userId=${encodeURIComponent(
				userId
			)}&userGroup=${group}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to fetch feedback: ${response.status} - ${errorText}`
			);
		}

		return response.json();
	};

	const {
		data: feedbackItems,
		isPending,
		isError,
	} = useQuery<FeedbackItem[]>({
		// Explicitly type the data
		queryKey: ["feedback", user?.sub],
		queryFn: () =>
			getFeedback(
				user?.sub || undefined,
				idToken || undefined,
				user?.groups?.[0]
			),
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		refetchOnReconnect: true,
		enabled: !!user?.sub && !!idToken, // Only fetch if user and token are available
	});

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "suggestion":
				return <MessageSquare className="h-4 w-4 text-blue-500" />;
			case "bug":
				return <Bug className="h-4 w-4 text-red-500" />;
			case "feature":
				return <Star className="h-4 w-4 text-amber-500" />;
			default:
				return null;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const viewFeedbackDetails = (feedback: FeedbackItem) => {
		setSelectedFeedback(feedback);
		setIsDialogOpen(true);
	};

	// Filter the feedback items by search term and type
	const filteredFeedback = (feedbackItems || []).filter(
		(item: FeedbackItem) => {
			const matchesType =
				filterType === "all" ||
				item.feedbackType.toLowerCase() === filterType.toLowerCase();

			// Refined search logic:
			// Check for exact matches for specific keywords, otherwise
			// perform a broader text search.
			const lowerCaseSearchTerm = searchTerm.toLowerCase();
			const isExactSearchMatch = [
				"private",
				"public",
				"bug",
				"suggestion",
				"feature",
			].includes(lowerCaseSearchTerm);

			const matchesSearch =
				searchTerm === "" ||
				(isExactSearchMatch
					? item.visibility.toLowerCase() === lowerCaseSearchTerm ||
					  item.feedbackType.toLowerCase() === lowerCaseSearchTerm
					: item.feedback.toLowerCase().includes(lowerCaseSearchTerm) ||
					  item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
					  item.email.toLowerCase().includes(lowerCaseSearchTerm) ||
					  item.visibility.toLowerCase().includes(lowerCaseSearchTerm) ||
					  item.feedbackType.toLowerCase().includes(lowerCaseSearchTerm));

			return matchesType && matchesSearch;
		}
	);

	const totalItems = filteredFeedback.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const paginatedFeedback = filteredFeedback.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const { pages } = usePagination({
		currentPage,
		totalPages,
		paginationItemsToDisplay,
	});

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterType]);

	// Handler for toggling the treated status
	const handleToggleTreated = (item: FeedbackItem) => {
		if (!isAdmin) {
			CustomToast({
				variant: "error",
				description: "Permission Denied",
				duration: 3000,
			});
			return;
		}

		mutateUpdateFeedback({
			feedbackId: item.feedbackId,
			treated: !item.treated, // Toggle the current treated status
			userGroup: user?.groups?.[0],
			token: idToken,
		});
	};

	// Handler for deleting feedback
	// Handler for triggering the confirmation dialog
	const handleDeleteFeedback = (feedbackId: string) => {
		if (!isAdmin) {
			CustomToast({
				variant: "warning",
				description: "Permission Denied",
				duration: 3000,
			});
			return;
		}

		setFeedbackIdToDelete(feedbackId);
		setShowConfirmDeleteDialog(true);
	};

	// Function to call when confirmation is received from AlertDialog
	const confirmDelete = () => {
		if (feedbackIdToDelete) {
			mutateDeleteFeedback({
				feedbackId: feedbackIdToDelete, // Pass the ID from state
				userId: user?.sub || "",
				userGroup: user?.groups?.[0],
				token: idToken,
			});
			setFeedbackIdToDelete(null); // Clear the ID
			setShowConfirmDeleteDialog(false); // Close dialog
		}
	};

	if (isPending) {
		return <div className="text-center py-8">Loading feedback...</div>;
	}

	if (isError) {
		return (
			<div className="text-center py-8">
				<h3 className="text-xl text-red-600">Error loading feedback</h3>
				<p className="text-red-500 mt-2">Please try again later</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
				<div className="relative w-full md:w-auto flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search feedback..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center gap-2 w-full md:w-auto">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<Select value={filterType} onValueChange={setFilterType}>
						<SelectTrigger className="w-full md:w-[180px] cursor-pointer">
							<SelectValue placeholder="Filter by type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem className="cursor-pointer" value="all">
								All types
							</SelectItem>
							<SelectItem className="cursor-pointer" value="suggestion">
								Suggestion
							</SelectItem>
							<SelectItem className="cursor-pointer" value="bug">
								Bug
							</SelectItem>
							<SelectItem className="cursor-pointer" value="feature">
								Feature
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-border">
				<Table>
					<TableCaption>Feedback submissions.</TableCaption>
					<TableHeader>
						<TableRow className="bg-muted/50 dark:bg-muted/20">
							<TableCell className="text-center">Treated</TableCell>
							<TableHead className="w-[100px ]">Type</TableHead>
							<TableHead className="text-center">Visibility</TableHead>
							<TableHead>Feedback</TableHead>
							<TableHead className="text-center">Name</TableHead>
							<TableHead className="text-center">Email</TableHead>
							<TableHead className="text-center">Date</TableHead>
							<TableHead className="w-[80px] text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredFeedback.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="text-center py-8">
									{" "}
									{/* Adjusted colspan */}
									<div>
										<h3 className="text-lg font-medium text-foreground">
											No feedback found
										</h3>
										<p className="text-muted-foreground text-sm mt-2">
											Try adjusting your search or filter criteria.
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							paginatedFeedback.map((item: FeedbackItem) => {
								return (
									<TableRow
										key={item.feedbackId}
										className={item.treated ? "text-gray-600 line-through" : ""}
									>
										<TableCell className="text-center">
											<Checkbox
												checked={item.treated} // Use item.treated directly
												onCheckedChange={() => handleToggleTreated(item)}
												disabled={!isAdmin} // Disable if not admin
												className="rounded border border-border bg-gray-300 dark:bg-gray-700 text-primary hover:ring-ring focus:ring-ring cursor-pointer"
												style={
													{
														"--primary": "var(--color-emerald-500)",
													} as React.CSSProperties
												}
											/>
										</TableCell>

										<TableCell>
											<div className="flex items-center gap-1">
												{getTypeIcon(item.feedbackType)}
												<Badge
													variant="outline"
													className={cn(
														"capitalize",
														item.treated &&
															"text-gray-600 line-through "
													)}
												>
													{item.feedbackType}
												</Badge>
											</div>
										</TableCell>
										<TableCell className="font-medium text-center capitalize">
											{" "}
											{/* Added capitalize */}
											{item.visibility}
										</TableCell>
										<TableCell className="font-medium max-w-[100px] truncate">
											{item.feedback}
										</TableCell>
										<TableCell className="text-center">{item.name}</TableCell>
										<TableCell className="max-w-[100px] truncate text-center">
											{item.email}
										</TableCell>
										<TableCell className="text-center">
											{formatDate(item.createdAt)}
										</TableCell>
										<TableCell className="text-center">
											<DropdownMenu>
												<DropdownMenuTrigger className="cursor-pointer" asChild>
													<Button variant="ghost" className="h-8 w-8 p-0 ">
														<span className="sr-only">Open menu</span>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														className="cursor-pointer"
														onClick={() => {
															setTimeout(() => viewFeedbackDetails(item), 0);
														}}
													>
														View
													</DropdownMenuItem>
													{isAdmin && (
														<DropdownMenuItem
															className="text-red-500 cursor-pointer"
															onClick={() =>
																setTimeout(() =>
																	handleDeleteFeedback(item.feedbackId)
																)
															}
														>
															Delete
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>

				{totalPages > 1 && (
					<Pagination className="flex justify-end ">
						<PaginationContent className="">
							<PaginationItem>
								<PaginationPrevious
									onClick={() =>
										setCurrentPage((prev) => Math.max(prev - 1, 1))
									}
									className={
										currentPage === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>

							{pages.map((page) => (
								<PaginationItem key={page}>
									{typeof page === "string" ? (
										<PaginationEllipsis />
									) : (
										<PaginationLink
											className="cursor-pointer"
											isActive={page === currentPage}
											onClick={() => setCurrentPage(page)}
										>
											{page}
										</PaginationLink>
									)}
								</PaginationItem>
							))}

							<PaginationItem>
								<PaginationNext
									onClick={() =>
										setCurrentPage((prev) => Math.min(prev + 1, totalPages))
									}
									className={
										currentPage === totalPages
											? "pointer-events-none opacity-50"
											: "cursor-pointer"
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent
					className="
					flex flex-col 
				
					w-full
					max-w-lg
					sm:max-w-[700px]
				
					min-h-[200px] 
					sm:min-h-[300px]
					md:min-h-[400px]
				
					max-h-[80vh]   /* Ensures it never overflows screen on large monitors */
				
					p-4
					sm:p-6
					lg:p-8
				"
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{selectedFeedback && getTypeIcon(selectedFeedback.feedbackType)}
							<span className="capitalize">
								{selectedFeedback?.feedbackType} Feedback
							</span>
						</DialogTitle>
						<DialogDescription className="pt-2">
							Submitted on{" "}
							{selectedFeedback && formatDate(selectedFeedback.createdAt)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 overflow-y-auto custom-scrollbar">
						<div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md">
							<h4 className="text-sm font-medium text-gray-500 mb-1">From</h4>
							<p className="font-medium">{selectedFeedback?.name}</p>
							<p className="text-muted-foreground">{selectedFeedback?.email}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2 ">
								Feedback
							</h4>
							<p className="whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-4 rounded-md">
								{selectedFeedback?.feedback}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<Badge
								variant={
									selectedFeedback?.visibility === "public"
										? "default"
										: "outline"
								}
								className="capitalize"
							>
								{selectedFeedback?.visibility === "public"
									? "Public"
									: "Private"}{" "}
								Feedback
							</Badge>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			{/* Custom Confirmation Dialog */}
			<AlertDialog
				open={showConfirmDeleteDialog}
				onOpenChange={setShowConfirmDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete this
							feedback entry from our records.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="cursor-pointer"
							onClick={() => {
								setFeedbackIdToDelete(null); // Clear ID if canceled
								setShowConfirmDeleteDialog(false); // Close dialog
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-red-500 cursor-pointer"
							onClick={confirmDelete}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default FeedbackList;

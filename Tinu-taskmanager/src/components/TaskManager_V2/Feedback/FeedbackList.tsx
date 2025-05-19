import { useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bug, MessageSquare, Star, Search, Filter, Eye } from "lucide-react";
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
import { useAuth } from "@/Context/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface FeedbackItem {
	_id: string;
	name: string;
	email: string;
	feedback: string;
	feedbackType: string;
	visibility: "public" | "private";
	createdAt: string;
	userId: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const FeedbackList = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
		null
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { user, idToken } = useAuth();

	const getFeedback = async (): Promise<FeedbackItem[]> => {
		if (!user?.sub || !idToken) throw new Error("User not authenticated");

		const response = await fetch(
			`${API_BASE}/feedback?userId=${encodeURIComponent(user.sub)}`,
			{
				headers: {
					Authorization: `Bearer ${idToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		if (!response.ok) throw new Error("Failed to fetch feedback");
		return response.json();
	};

	const {
		data: feedbackItems,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["feedback", user?.sub],
		queryFn: getFeedback,
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true, // Refetch when window regains focus
		refetchOnMount: true, // Refetch when component mounts
		refetchOnReconnect: true, // Refetch when network reconnects
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
			const matchesSearch =
				searchTerm === "" ||
				item.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.email.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesType =
				filterType === "all" || item.feedbackType === filterType;

			return matchesSearch && matchesType;
		}
	);

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
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Filter by type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							<SelectItem value="suggestion">Suggestion</SelectItem>
							<SelectItem value="bug">Bug</SelectItem>
							<SelectItem value="feature">Feature</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-border">
				<Table>
					<TableCaption>A list of public feedback submissions.</TableCaption>
					<TableHeader>
						<TableRow className="bg-muted/50 dark:bg-muted/20">
							<TableHead className="w-[100px]">Type</TableHead>
							<TableHead>Feedback</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead className="text-right">Date</TableHead>
							<TableHead className="w-[80px] text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredFeedback.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8">
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
							filteredFeedback.map((item: FeedbackItem) => (
								<TableRow
									key={item._id}
									className="hover:bg-muted/50 dark:hover:bg-muted/20"
								>
									<TableCell>
										<div className="flex items-center gap-2">
											{getTypeIcon(item.feedbackType)}
											<Badge variant="outline" className="capitalize">
												{item.feedbackType}
											</Badge>
										</div>
									</TableCell>
									<TableCell className="font-medium max-w-[250px] truncate">
										{item.feedback}
									</TableCell>
									<TableCell>{item.name}</TableCell>
									<TableCell className="max-w-[150px] truncate">
										{item.email}
									</TableCell>
									<TableCell className="text-right">
										{formatDate(item.createdAt)}
									</TableCell>
									<TableCell className="text-center">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 rounded-full"
											onClick={() => viewFeedbackDetails(item)}
										>
											<Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
											<span className="sr-only">View details</span>
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md w-[90%] max-w-2xl">
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
					<div className="space-y-4">
						<div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md">
							<h4 className="text-sm font-medium text-gray-500 mb-1">From</h4>
							<p className="font-medium">{selectedFeedback?.name}</p>
							<p className="text-muted-foreground">{selectedFeedback?.email}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">
								Feedback
							</h4>
							<p className="whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-4 rounded-md">
								{selectedFeedback?.feedback}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<Badge
								variant={selectedFeedback?.visibility ? "default" : "outline"}
							>
								{selectedFeedback?.visibility ? "Public" : "Private"} Feedback
							</Badge>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FeedbackList;

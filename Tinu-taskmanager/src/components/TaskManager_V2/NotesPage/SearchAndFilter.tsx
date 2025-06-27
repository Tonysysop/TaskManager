import React, { useState } from "react";
import {
	Search,
	Filter,
	X,
	Tag,
	SortAsc,
	SortDesc,
	Archive,
	Trash2,
	Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { getAllTags } from "@/lib/noteUtils";
import { useNotes } from "@/Context/NotesContext";
import ViewToggle from "./ViewToggle";

const SearchAndFilter: React.FC = () => {
	const {
		filters,
		setSearchQuery,
		setSelectedTags,
		setSort,
		notes,
		setShowArchived,
		setShowDeleted,
	} = useNotes();
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const availableTags = getAllTags(notes);

	// Compute counts locally
	const counts = {
		all: notes.length,
		pinned: notes.filter((n) => n.isPinned && !n.isArchived && !n.isDeleted)
			.length,
		archived: notes.filter((n) => n.isArchived && !n.isDeleted).length,
		deleted: notes.filter((n) => n.isDeleted).length,
	};

	// Determine active filter
	const activeFilter = filters.showDeleted
		? "deleted"
		: filters.showArchived
		? "archived"
		: "all";

	const handleStatusFilter = (
		id: "all" | "pinned" | "archived" | "deleted"
	) => {
		switch (id) {
			case "all":
				setShowArchived(false);
				setShowDeleted(false);
				break;
			case "archived":
				setShowArchived(true);
				setShowDeleted(false);
				break;
			case "deleted":
				setShowArchived(false);
				setShowDeleted(true);
				break;
			default:
				setShowArchived(false);
				setShowDeleted(false);
		}
	};

	const handleTagToggle = (tagName: string) => {
		const newSelectedTags = filters.selectedTags.includes(tagName)
			? filters.selectedTags.filter((t) => t !== tagName)
			: [...filters.selectedTags, tagName];
		setSelectedTags(newSelectedTags);
	};

	const handleSortChange = (newSortBy: "updatedAt" | "createdAt" | "title") => {
		const newOrder =
			newSortBy === filters.sortBy && filters.sortOrder === "desc"
				? "asc"
				: "desc";
		setSort(newSortBy, newOrder);
	};

	const clearAllFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
		setShowArchived(false);
		setShowDeleted(false);
	};

	const hasActiveFilters =
		filters.searchQuery ||
		filters.selectedTags.length > 0 ||
		activeFilter !== "all";
	const activeFiltersCount =
		(filters.searchQuery ? 1 : 0) +
		filters.selectedTags.length +
		(activeFilter !== "all" ? 1 : 0);

	const statusFilters = [
		{ id: "all", label: "All Notes", icon: Search, count: counts.all },
		{ id: "pinned", label: "Pinned", icon: Pin, count: counts.pinned },
		{
			id: "archived",
			label: "Archived",
			icon: Archive,
			count: counts.archived,
		},
		{ id: "deleted", label: "Deleted", icon: Trash2, count: counts.deleted },
	] as const;

	const sortOptions = [
		{ value: "updatedAt", label: "Last Modified" },
		{ value: "createdAt", label: "Date Created" },
		{ value: "title", label: "Title" },
	] as const;

	return (
		<div className="space-y-4 mb-8">
			{/* Main Search Bar */}
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-gray-400" />
				</div>
				<Input
					type="text"
					placeholder="Search notes, content, or tags..."
					value={filters.searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-12 pr-4 py-4 text-base bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
				/>
				{filters.searchQuery && (
					<button
						onClick={() => setSearchQuery("")}
						className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				)}
			</div>

			{/* Filter Controls */}
			<div className="flex flex-wrap gap-2 items-center">
				{/* Status Filter Tabs */}
				<div className="flex flex-wrap gap-2">
					{statusFilters.map(({ id, label, icon: Icon, count }) => (
						<button
							key={id}
							onClick={() => handleStatusFilter(id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
								activeFilter === id
									? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
									: "bg-white/80 text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 backdrop-blur-sm"
							}`}
						>
							<Icon className="w-4 h-4" />
							<span className="hidden sm:inline">{label}</span>
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-medium ${
									activeFilter === id
										? "bg-white/20 text-white"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								{count}
							</span>
						</button>
					))}
				</div>

				{/* Advanced Filters */}
				<div className="flex items-center gap-2 ml-auto">
					<Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="secondary"
								className={`bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 ${
									hasActiveFilters
										? "border-blue-500 text-blue-600 bg-blue-50/50"
										: ""
								}`}
							>
								<Filter className="w-4 h-4 mr-2" />
								<span className="hidden sm:inline">Filters</span>
								{hasActiveFilters && (
									<Badge
										variant="default"
										className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white"
									>
										{activeFiltersCount}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="p-6">
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold text-gray-900 text-lg">
										Advanced Filters
									</h4>
									{hasActiveFilters && (
										<Button
											variant="ghost"
											size="sm"
											onClick={clearAllFilters}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<X className="w-4 h-4 mr-1" />
											Clear All
										</Button>
									)}
								</div>

								{availableTags.length > 0 && (
									<div>
										<label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
											<Tag className="w-4 h-4 mr-2" />
											Filter by Tags
										</label>
										<div className="flex flex-wrap gap-2">
											{availableTags.map((tagName) => {
												const isSelected =
													filters.selectedTags.includes(tagName);

												return (
													<button
														key={tagName}
														onClick={() => handleTagToggle(tagName)}
														className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 ${
															isSelected
																? "bg-blue-600 text-white border-blue-600 shadow-md"
																: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
														}`}
													>
														{tagName}
													</button>
												);
											})}
										</div>
									</div>
								)}
							</div>
						</PopoverContent>
					</Popover>

					{/* Sort Controls */}
					<Select
						value={filters.sortBy}
						onValueChange={(value: "updatedAt" | "createdAt" | "title") =>
							handleSortChange(value)
						}
					>
						<SelectTrigger className="w-[160px] bg-white/80 backdrop-blur-sm border-gray-200 hover:border-gray-300">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
							{sortOptions.map(({ value, label }) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						variant="secondary"
						size="sm"
						onClick={() => handleSortChange(filters.sortBy)}
						className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 p-2"
						title={`Sort ${
							filters.sortOrder === "desc" ? "Ascending" : "Descending"
						}`}
					>
						{filters.sortOrder === "desc" ? (
							<SortDesc className="w-4 h-4" />
						) : (
							<SortAsc className="w-4 h-4" />
						)}
					</Button>
					<ViewToggle />
				</div>
			</div>

			{/* Active Filters Display */}
			{(filters.selectedTags.length > 0 || filters.searchQuery) && (
				<div className="flex flex-wrap gap-2 items-center">
					<span className="text-sm text-gray-600 font-medium">
						Active filters:
					</span>

					{filters.searchQuery && (
						<Badge
							variant="secondary"
							className="text-sm bg-blue-50 text-blue-700 border border-blue-200"
						>
							Search: "{filters.searchQuery}"
							<button
								onClick={() => setSearchQuery("")}
								className="ml-2 hover:text-blue-900 transition-colors"
							>
								<X className="w-3 h-3" />
							</button>
						</Badge>
					)}

					{filters.selectedTags.map((tagName) => (
						<Badge
							key={tagName}
							variant="secondary"
							className="text-sm bg-purple-50 text-purple-700 border border-purple-200"
						>
							<Tag className="w-3 h-3 mr-1" />
							{tagName}
							<button
								onClick={() => handleTagToggle(tagName)}
								className="ml-2 hover:text-purple-900 transition-colors"
							>
								<X className="w-3 h-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
};

export default SearchAndFilter;

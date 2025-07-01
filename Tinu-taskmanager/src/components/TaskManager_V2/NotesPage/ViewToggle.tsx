import { Grid3X3, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNotes } from "@/Context/NotesContext";

const ViewToggle = () => {
	const { filters, setViewMode } = useNotes();

	const handleViewChange = (value: string) => {
		if (value && (value === "grid" || value === "list")) {
			setViewMode(value);
		}
	};

	return (
		<ToggleGroup
			type="single"
			value={filters.viewMode || "grid"}
			onValueChange={handleViewChange}
			className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-lg p-1"
		>
			<ToggleGroupItem
				value="grid"
				aria-label="Grid view"
				className="data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900/50 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-300 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
			>
				<Grid3X3 className="w-4 h-4" />
			</ToggleGroupItem>
			<ToggleGroupItem
				value="list"
				aria-label="List view"
				className="data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900/50 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-300 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
			>
				<List className="w-4 h-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
};

export default ViewToggle;

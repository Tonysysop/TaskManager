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
			className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-1"
		>
			<ToggleGroupItem
				value="grid"
				aria-label="Grid view"
				className="data-[state=on]:bg-blue-100"
			>
				<Grid3X3 className="w-4 h-4" />
			</ToggleGroupItem>
			<ToggleGroupItem
				value="list"
				aria-label="List view"
				className="data-[state=on]:bg-blue-100"
			>
				<List className="w-4 h-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
};

export default ViewToggle;

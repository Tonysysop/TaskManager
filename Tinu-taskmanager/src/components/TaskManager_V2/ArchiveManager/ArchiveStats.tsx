
import { Badge } from "@/components/ui/badge";

interface ArchiveStatsProps {
	eligibleCount: number;
	archivedCount: number;
	title: string;
}

const ArchiveStats = ({
	eligibleCount,
	archivedCount,
	title,
}: ArchiveStatsProps) => {
	return (
		<div className="flex items-center gap-2">
			<h3 className="font-semibold text-sm">{title}</h3>
			<Badge
				variant={title === "Soon to be Archived" ? "secondary" : "outline"}
				className="text-xs"
			>
				{title === "Soon to be Archived" ? eligibleCount : archivedCount}
			</Badge>
		</div>
	);
};

export default ArchiveStats;

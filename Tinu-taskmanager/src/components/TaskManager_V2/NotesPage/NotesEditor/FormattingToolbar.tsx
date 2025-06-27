import React from "react";
import {
	Bold,
	Italic,
	Underline,
	Heading1,
	Heading2,
	List,
	ListOrdered,
	Quote,
	Code,
	Link,
	// SeparatorVertical as Separator,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormattingToolbarProps {
	onInsertFormatting: (format: string, value?: string) => void;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
	onInsertFormatting,
}) => {
	const formatButtons = [
		{ icon: Bold, label: "Bold", format: "bold", shortcut: "Ctrl+B" },
		{ icon: Italic, label: "Italic", format: "italic", shortcut: "Ctrl+I" },
		{
			icon: Underline,
			label: "Underline",
			format: "underline",
			shortcut: "Ctrl+U",
		},
	];

	const headingButtons = [
		{ icon: Heading1, label: "Heading 1", format: "h1", shortcut: "" },
		{ icon: Heading2, label: "Heading 2", format: "h2", shortcut: "" },
	];

	const listButtons = [
		{ icon: List, label: "Bullet List", format: "bullet-list", shortcut: "" },
		{
			icon: ListOrdered,
			label: "Numbered List",
			format: "numbered-list",
			shortcut: "",
		},
	];

	const otherButtons = [
		{ icon: Quote, label: "Quote", format: "quote", shortcut: "" },
		{ icon: Code, label: "Code", format: "code", shortcut: "" },
		{ icon: Link, label: "Link", format: "link", shortcut: "" },
	];

	const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

	const renderButtonGroup = (
		buttons: typeof formatButtons,
		groupKey: string
	) => (
		<div key={groupKey} className="flex items-center gap-1">
			{buttons.map(({ icon: Icon, label, format, shortcut }) => (
				<Button
					key={format}
					variant="ghost"
					size="sm"
					onClick={() => onInsertFormatting(format)}
					className="p-2 h-8 w-8 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
					title={shortcut ? `${label} (${shortcut})` : label}
				>
					<Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
				</Button>
			))}
		</div>
	);

	return (
		<div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
			<div className="flex items-center gap-2 flex-wrap">
				{renderButtonGroup(formatButtons, "format")}
				<ToolbarSeparator />
				{renderButtonGroup(headingButtons, "heading")}
				<ToolbarSeparator />
				{renderButtonGroup(listButtons, "list")}
				<ToolbarSeparator />
				{renderButtonGroup(otherButtons, "other")}
			</div>
		</div>
	);
};

export default FormattingToolbar;

// import { Bold, Italic, List, Type } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface FormattingToolbarProps {
// 	onInsertFormatting: (format: string) => void;
// }

// const FormattingToolbar = ({ onInsertFormatting }: FormattingToolbarProps) => {
// 	return (
// 		<div className="flex flex-wrap gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200">
// 			<Button
// 				type="button"
// 				variant="outline"
// 				size="sm"
// 				onClick={() => onInsertFormatting("bold")}
// 				className="flex items-center gap-1"
// 			>
// 				<Bold className="w-4 h-4" />
// 				Bold
// 			</Button>
// 			<Button
// 				type="button"
// 				variant="outline"
// 				size="sm"
// 				onClick={() => onInsertFormatting("italic")}
// 				className="flex items-center gap-1"
// 			>
// 				<Italic className="w-4 h-4" />
// 				Italic
// 			</Button>
// 			<Button
// 				type="button"
// 				variant="outline"
// 				size="sm"
// 				onClick={() => onInsertFormatting("heading")}
// 				className="flex items-center gap-1"
// 			>
// 				<Type className="w-4 h-4" />
// 				Heading
// 			</Button>
// 			<Button
// 				type="button"
// 				variant="outline"
// 				size="sm"
// 				onClick={() => onInsertFormatting("list")}
// 				className="flex items-center gap-1"
// 			>
// 				<List className="w-4 h-4" />
// 				List
// 			</Button>
// 		</div>
// 	);
// };

// export default FormattingToolbar;

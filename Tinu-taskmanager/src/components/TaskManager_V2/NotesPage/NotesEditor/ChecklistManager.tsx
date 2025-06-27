import React, { useState } from "react";
import { Plus, Check, X, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChecklistItem } from "@/types/NoteAttributes";

interface ChecklistManagerProps {
	checklist: ChecklistItem[];
	onUpdateChecklist: (checklist: ChecklistItem[]) => void;
}

const ChecklistManager: React.FC<ChecklistManagerProps> = ({
	checklist,
	onUpdateChecklist,
}) => {
	const [newItemText, setNewItemText] = useState("");
	const [isAddingItem, setIsAddingItem] = useState(false);

	const addItem = () => {
		if (!newItemText.trim()) return;

		const newItem: ChecklistItem = {
			id: Date.now().toString(),
			text: newItemText.trim(),
			completed: false,
		};

		onUpdateChecklist([...checklist, newItem]);
		setNewItemText("");
		setIsAddingItem(false);
	};

	const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
		onUpdateChecklist(
			checklist.map((item) => (item.id === id ? { ...item, ...updates } : item))
		);
	};

	const removeItem = (id: string) => {
		onUpdateChecklist(checklist.filter((item) => item.id !== id));
	};

	const toggleCompleted = (id: string) => {
		const item = checklist.find((item) => item.id === id);
		if (item) {
			updateItem(id, { completed: !item.completed });
		}
	};

	const completedCount = checklist.filter((item) => item.completed).length;
	const totalCount = checklist.length;

	return (
		<div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold text-gray-900">Checklist</h3>
					{totalCount > 0 && (
						<div className="flex items-center gap-2">
							<div className="text-sm text-gray-600">
								{completedCount} of {totalCount} completed
							</div>
							<div className="w-24 bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
									style={{
										width:
											totalCount > 0
												? `${(completedCount / totalCount) * 100}%`
												: "0%",
									}}
								/>
							</div>
						</div>
					)}
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsAddingItem(true)}
					className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Item
				</Button>
			</div>

			<div className="space-y-3">
				{checklist.map((item) => (
					<div
						key={item.id}
						className="group flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-all duration-200"
					>
						<div className="cursor-grab text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
							<GripVertical className="w-4 h-4" />
						</div>

						<button
							onClick={() => toggleCompleted(item.id)}
							className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
								item.completed
									? "bg-green-500 border-green-500 text-white"
									: "border-gray-300 hover:border-green-400"
							}`}
						>
							{item.completed && <Check className="w-3 h-3" />}
						</button>

						<Input
							value={item.text}
							onChange={(e) => updateItem(item.id, { text: e.target.value })}
							className={`flex-1 border-none bg-transparent focus:ring-0 ${
								item.completed ? "line-through text-gray-500" : ""
							}`}
							placeholder="Enter checklist item..."
						/>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeItem(item.id)}
							className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				))}

				{isAddingItem && (
					<div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
						<div className="w-4 h-4" />
						<div className="w-5 h-5 rounded border-2 border-gray-300" />
						<Input
							value={newItemText}
							onChange={(e) => setNewItemText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") addItem();
								if (e.key === "Escape") {
									setIsAddingItem(false);
									setNewItemText("");
								}
							}}
							className="flex-1 border-none bg-transparent focus:ring-0"
							placeholder="Enter new checklist item..."
							autoFocus
						/>
						<div className="flex gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={addItem}
								className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50"
							>
								<Check className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setIsAddingItem(false);
									setNewItemText("");
								}}
								className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}

				{checklist.length === 0 && !isAddingItem && (
					<div className="text-center py-8 text-gray-500">
						<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
							<Plus className="w-6 h-6 text-gray-400" />
						</div>
						<p className="text-sm">No checklist items yet</p>
						<p className="text-xs text-gray-400 mt-1">
							Click "Add Item" to create your first checklist item
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ChecklistManager;

// import { useState } from "react";
// import { ListChecks, Plus, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ChecklistItem } from "@/types/NoteAttributes";
// import { v4 as uuid } from "uuid";

// interface ChecklistManagerProps {
// 	checklist: ChecklistItem[];
// 	onUpdateChecklist: (checklist: ChecklistItem[]) => void;
// }

// const ChecklistManager = ({
// 	checklist,
// 	onUpdateChecklist,
// }: ChecklistManagerProps) => {
// 	const [newChecklistItem, setNewChecklistItem] = useState("");

// 	const addChecklistItem = () => {
// 		if (newChecklistItem.trim()) {
// 			const newItem: ChecklistItem = {
// 				id: uuid(),
// 				text: newChecklistItem.trim(),
// 				completed: false,
// 			};
// 			onUpdateChecklist([...checklist, newItem]);
// 			setNewChecklistItem("");
// 		}
// 	};

// 	const updateChecklistItem = (id: string, completed: boolean) => {
// 		onUpdateChecklist(
// 			checklist.map((item) => (item.id === id ? { ...item, completed } : item))
// 		);
// 	};

// 	const removeChecklistItem = (id: string) => {
// 		onUpdateChecklist(checklist.filter((item) => item.id !== id));
// 	};

// 	return (
// 		<div className="space-y-4">
// 			<div className="flex items-center gap-2">
// 				<ListChecks className="w-5 h-5 text-gray-600" />
// 				<h3 className="text-lg font-semibold text-gray-800">Checklist</h3>
// 			</div>

// 			{/* Add New Checklist Item */}
// 			<div className="flex gap-2">
// 				<Input
// 					placeholder="Add a checklist item..."
// 					value={newChecklistItem}
// 					onChange={(e) => setNewChecklistItem(e.target.value)}
// 					onKeyDown={(e) => {
// 						if (e.key === "Enter") {
// 							e.preventDefault();
// 							addChecklistItem();
// 						}
// 					}}
// 					className="bg-white/70 backdrop-blur-sm border-gray-200"
// 				/>
// 				<Button
// 					type="button"
// 					onClick={addChecklistItem}
// 					size="sm"
// 					className="bg-green-500 hover:bg-green-600 text-white"
// 				>
// 					<Plus className="w-4 h-4" />
// 				</Button>
// 			</div>

// 			{/* Checklist Items */}
// 			<div className="space-y-2">
// 				{checklist.map((item) => (
// 					<div
// 						key={item.id}
// 						className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200"
// 					>
// 						<Checkbox
// 							checked={item.completed}
// 							onCheckedChange={(checked) =>
// 								updateChecklistItem(item.id, checked as boolean)
// 							}
// 						/>
// 						<span
// 							className={`flex-1 ${
// 								item.completed ? "line-through text-gray-500" : "text-gray-800"
// 							}`}
// 						>
// 							{item.text}
// 						</span>
// 						<Button
// 							variant="ghost"
// 							size="sm"
// 							onClick={() => removeChecklistItem(item.id)}
// 							className="text-red-500 hover:text-red-700 hover:bg-red-50"
// 						>
// 							<X className="w-4 h-4" />
// 						</Button>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// };

// export default ChecklistManager;

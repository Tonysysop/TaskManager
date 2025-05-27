// NavUser.tsx
"use client";

import { BadgeCheck, Bell, ChevronsUpDown, Key, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@aws-amplify/auth";
import { PasswordChange } from "../Auth/PasswordChange"; // Ensure this path is correct
import { useState } from "react"; // Import useState

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}) {
	const { isMobile } = useSidebar();
	const [isPasswordChangeDialogOpen, setIsPasswordChangeDialogOpen] =
		useState(false); // State to control dialog

	const handleSignOut = async () => {
		console.log("Attempting global sign out...");
		try {
			await signOut({ global: true });
			console.log("Sign out redirect initiated (or failed to redirect).");
		} catch (error) {
			console.error("Error during signOut call itself: ", error);
		}
	};

	return (
		<>
			{" "}
			{/* Use a React Fragment to wrap the multiple top-level elements */}
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user.avatar || "https://github.com/shadcn.png"}
										alt={user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{user.name.charAt(0).toUpperCase()}
										{user.name.split(" ")[1]?.charAt(0).toUpperCase() || ""}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user.avatar || "https://github.com/shadcn.png"}
											alt={user.name}
										/>
										<AvatarFallback className="rounded-lg">
											{user.name.charAt(0).toUpperCase()}
											{user.name.split(" ")[1]?.charAt(0).toUpperCase() || ""}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<BadgeCheck className="mr-2 w-4" />
										Account
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										{/* THIS IS THE FIX: Directly trigger the dialog state */}
										<DropdownMenuItem
											onSelect={() => {
												setIsPasswordChangeDialogOpen(true);
												// Optionally, close the dropdown menu after selecting the item
												// You might need to pass a prop from DropdownMenu or use a ref to close it
												// For now, let's assume it closes naturally or you handle it
											}}
										>
											<Key className="mr-2 h-4 w-4" />
											Change Password
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuSub>

								<DropdownMenuItem>
									<Bell className="mr-2 h-4 w-4" />
									Notifications
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={handleSignOut}>
								<LogOut className="mr-2 h-4 w-4" />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
			{/* Render the PasswordChange component here, outside the DropdownMenu structure */}
			<PasswordChange
				open={isPasswordChangeDialogOpen}
				onOpenChange={setIsPasswordChangeDialogOpen}
			/>
		</>
	);
}

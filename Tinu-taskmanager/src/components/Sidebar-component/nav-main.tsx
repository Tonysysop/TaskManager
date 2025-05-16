import { useLocation, Link } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
	items,
	label = "Platform",
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
	label?: string;
}) {
	const location = useLocation();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive =
          item.url === "/tinumind"
            ? location.pathname.toLowerCase() === item.url.toLowerCase()
            : location.pathname.toLowerCase().startsWith(item.url.toLowerCase());
					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem
								className={cn("transition-colors", isActive && "bg-sidebar-accent rounded text-sidebar-primary-foreground ")}
							>
								<CollapsibleTrigger asChild>
									<Link to={item.url}>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
										</SidebarMenuButton>
									</Link>
								</CollapsibleTrigger>

								{item.items && (
									<CollapsibleContent>
										{item.items.map((subItem) => {
											const isSubActive = location.pathname.startsWith(
												subItem.url
											);
											return (
												<SidebarMenuSub
													key={subItem.title}
													className={cn(
														"transition-colors",
														isSubActive && "bg-muted/40"
													)}
												>
													<SidebarMenuSubButton>
														<span>{subItem.title}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSub>
											);
										})}
									</CollapsibleContent>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}

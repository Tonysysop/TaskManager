import { ReactNode } from "react";
import { AppSidebar } from "@/components/Sidebar-component/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  currentPage: string;
}

export default function SidebarLayout({
  children,
  breadcrumb = [],
  currentPage,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <BreadcrumbItem key={index} className="hidden md:block">
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
                {breadcrumb.length > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

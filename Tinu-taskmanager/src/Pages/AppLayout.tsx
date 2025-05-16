// AppLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import SidebarLayout from "@/components/Layout/SidebarLayout";

const fullPathLabels: Record<string, string> = {
  "/tinumind": "Dashboard", 
  "/tinumind/tasks": "Tasks",
  "/tinumind/notes": "Notes", 
  "/tinumind/pomodoro": "Pomodoro",
};


const segmentLabels: Record<string, string> = {
  tinumind: "TinuMind", // Label for the 'tinumind' part of the path
  tasks: "Tasks",
  notes: "Notes",
  pomodoro: "Pomodoro",
  settings: "Settings",
};

// --- Component Logic ---
export default function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname; // Use the exact pathname, e.g., "/tinumind/tasks"

  const pathSegments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings
  const breadcrumbItems = pathSegments
    .slice(0, -1) // Get all segments except the last
    .map((segment, index) => {
      // Construct the URL for this part of the breadcrumb
      const href = "/" + pathSegments.slice(0, index + 1).join('/');
      // Get the label for this segment, fallback to capitalized segment name
      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    });

  // Determine the label for the *current* page (the last segment)
  // Use the full path mapping first, fallback to segment mapping, then a default
  const currentPageLabel =
    fullPathLabels[pathname] ||
    segmentLabels[pathSegments[pathSegments.length - 1]] ||
    "Page"; // Default fallback

  return (
    <SidebarLayout
      breadcrumb={breadcrumbItems} // Pass the dynamically generated items
      currentPage={currentPageLabel} // Pass the determined current page label
    >
      <Outlet /> {/* Renders the actual page component (DashboardPage, TasksPage, etc.) */}
    </SidebarLayout>
  );
}
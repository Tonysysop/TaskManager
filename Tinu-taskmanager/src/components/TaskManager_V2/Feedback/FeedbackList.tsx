import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Bug, MessageSquare, Star, Search, Filter, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

interface FeedbackItem {
  _id: string;
  name: string;
  email: string;
  feedback: string;
  feedbackType: string;
  visibility: "public" | "private";
  createdAt: string;
  userId: string;
  treated: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL;

const FeedbackList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const paginationItemsToDisplay = 5;
  const [treatedFeedbackIds, setTreatedFeedbackIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { user, idToken } = useAuth();

  const getFeedback = async (
    userId: string | undefined,
    token: string | null | undefined,
    group?: string
  ): Promise<FeedbackItem[]> => {
    if (!userId || !token) throw new Error("User not authenticated");

    const response = await fetch(
      `${API_BASE}/feedback?userId=${encodeURIComponent(
        userId
      )}&userGroup=${group}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch feedback: ${response.status} - ${errorText}`
      );
    }

    return response.json(); // or: return (await response.json()) as FeedbackItem[];
  };

  const {
    data: feedbackItems,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["feedback", user?.sub],
    queryFn: () =>
      getFeedback(
        user?.sub || undefined,
        idToken || undefined,
        user?.groups?.[0]
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
    enabled: !!user?.sub && !!idToken,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "feature":
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const viewFeedbackDetails = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);

    // Mark as viewed
  };

  // Filter the feedback items by search term and type
  const filteredFeedback = (feedbackItems || []).filter(
    (item: FeedbackItem) => {
      const matchesType =
        filterType === "all" ||
        item.feedbackType.toLowerCase() === filterType.toLowerCase();

      const isExactSearchMatch =
        searchTerm === "private" ||
        searchTerm === "public" ||
        searchTerm === "bug" ||
        searchTerm === "suggestion";

      const matchesSearch =
        searchTerm === "" ||
        (isExactSearchMatch
          ? item.visibility.toLowerCase() === searchTerm.toLowerCase() ||
            item.feedbackType.toLowerCase() === searchTerm.toLowerCase()
          : item.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.visibility.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.feedbackType.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesType && matchesSearch;
    }
  );

  const totalItems = filteredFeedback.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { pages } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const toggleTreated = (id: string) => {
    setTreatedFeedbackIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  if (isPending) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl text-red-600">Error loading feedback</h3>
        <p className="text-red-500 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableCaption>Feedback submissions.</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-muted/20">
              <TableCell className="text-center">Treated</TableCell>
              <TableHead className="w-[100px ]">Type</TableHead>
              <TableHead className="text-center">Visibilty</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>

              <TableHead className="text-center">Date</TableHead>
              <TableHead className="w-[80px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      No feedback found
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFeedback.map((item: FeedbackItem) => {
                return (
                  <TableRow
                    key={item._id}
                    className={
                      treatedFeedbackIds.includes(item._id)
                        ? "text-gray-600 line-through"
                        : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={treatedFeedbackIds.includes(item._id)}
                        onCheckedChange={() => toggleTreated(item._id)}
                        className="rounded border border-border bg-gray-300 dark:bg-gray-700 text-primary hover:ring-ring focus:ring-ring"
                        style={
                          {
                            "--primary": "var(--color-emerald-500)",
                          } as React.CSSProperties
                        }
                      />

                      {item.treated}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.feedbackType)}
                        <Badge variant="outline" className="capitalize">
                          {item.feedbackType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {item.visibility}
                    </TableCell>
                    <TableCell className="font-medium max-w-[100px] truncate">
                      {item.feedback}
                    </TableCell>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="max-w-[100px] truncate text-center">
                      {item.email}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => viewFeedbackDetails(item)}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination className="flex justify-end ">
            <PaginationContent className="">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {pages.map((page) => (
                <PaginationItem key={page}>
                  {typeof page === "string" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90%] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && getTypeIcon(selectedFeedback.feedbackType)}
              <span className="capitalize">
                {selectedFeedback?.feedbackType} Feedback
              </span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Submitted on{" "}
              {selectedFeedback && formatDate(selectedFeedback.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md">
              <h4 className="text-sm font-medium text-gray-500 mb-1">From</h4>
              <p className="font-medium">{selectedFeedback?.name}</p>
              <p className="text-muted-foreground">{selectedFeedback?.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Feedback
              </h4>
              <p className="whitespace-pre-wrap bg-muted/50 dark:bg-muted/20 p-4 rounded-md">
                {selectedFeedback?.feedback}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={selectedFeedback?.visibility ? "default" : "outline"}
              >
                {selectedFeedback?.visibility ? "Public" : "Private"} Feedback
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackList;

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import axios from "axios";
import { useAuth } from "@/Context/AuthContext";
import Spinner1 from "@/components/spinner";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const API_BASE = import.meta.env.VITE_API_URL;

// 1. Define the fetch function (can be outside the component or in a separate api.js file)
const fetchTaskStats = async (userId: string, idToken: string) => {
  // The 'enabled' option in useQuery will primarily handle this,
  // but an early return or error throw here is also fine as a safeguard.
  if (!userId || !idToken) {
    return Promise.reject(
      new Error("User ID or token is missing for fetch operation.")
    );
  }

  const { data } = await axios.get(`${API_BASE}/count`, {
    params: { userId },
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return data; // Return the raw data from the API
};

const chartConfigDefinition: ChartConfig = {
  // Explicitly typed for clarity
  count: {
    label: "status",
  },
  Late: {
    label: "Late",
    color: "hsl(var(--chart-1))",
  },
  In_Progress: {
    label: "In_Progress",
    color: "hsl(var(--chart-2))",
  },
  Planned: {
    label: "Planned",
    color: "hsl(var(--chart-3))",
  },
  Completed: {
    label: "Completed",
    color: "hsl(var(--chart-4))",
  },
};

const legendOrder: (keyof Omit<typeof chartConfigDefinition, "count">)[] = [
  "In_Progress",
  "Planned",
  "Completed",
  "Late",
];

const initialChartData = [
  { status: "Late", count: 0, fill: "var(--color-Late)" },
  { status: "In_Progress", count: 0, fill: "var(--color-In_Progress)" },
  { status: "Planned", count: 0, fill: "var(--color-Planned)" },
  { status: "Completed", count: 0, fill: "var(--color-Completed)" },
];

export function DonutChart() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const { idToken, user } = useAuth();
  const userId = user?.sub;

  const {
    data: chartData, // Renamed from 'data' for clarity, will hold the transformed data
    isLoading,
    isError,
    // isFetching, // You can use isFetching to show a more subtle loading indicator for background refetches
  } = useQuery({
    queryKey: ["taskStats", userId, idToken],
    queryFn: () => fetchTaskStats(userId as string, idToken as string),
    enabled: !!user?.sub && !!idToken,
    select: (apiData) => {
      // Transform the raw API data into the structure your chart expects
      // This also handles cases where some data points might be missing from the API response
      if (!apiData) return initialChartData; // Fallback if apiData is unexpectedly null/undefined
      return [
        {
          status: "Late",
          count: apiData.late || 0,
          fill: "var(--color-Late)",
        },
        {
          status: "In_Progress",
          count: apiData.InProgress || 0,
          fill: "var(--color-In_Progress)",
        },
        {
          status: "Planned",
          count: apiData.Planned || 0,
          fill: "var(--color-Planned)",
        },
        {
          status: "Completed",
          count: apiData.Completed || 0,
          fill: "var(--color-Completed)",
        },
      ];
    },
    placeholderData: initialChartData, // Show this data structure immediately while fetching. isLoading will be true.
    // Or, use initialData if you want the query to be considered 'successful' with this data from the start:
    //initialData: initialChartData,
    // TanStack Query options (uncomment and configure as needed):
    staleTime: 5 * 60 * 1000, // 5 minutes: data is "fresh" for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes: keep unused data in memory
    refetchOnWindowFocus: true, // update chart when user returns to the tab
    refetchInterval: false, // no polling needed for single-user
  });

  let chartContent: React.ReactNode = null;

  if (isError) {
    chartContent = (
      <div className="flex flex-col justify-center items-center h-full text-red-500 text-center">
        <p>Error loading chart data.</p>
        {/* Consider logging `error.message` to console or a monitoring service */}
        {/* <p className="text-xs">{error?.message}</p> */}
      </div>
    );
  } else if (isLoading) {
    chartContent = (
      <div className="flex justify-center items-center h-full">
        <Spinner1 />
      </div>
    );
  } else if (chartData && chartData.some((d) => d.count > 0)) {
    // Check if there's actual data to display
    chartContent = (
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
          activeIndex={0}
          activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 10} />
          )}
        />
      </PieChart>
    );
  } else {
    // Handles case where data is loaded but all counts are 0, or initial placeholder state with no activity
    chartContent = (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No task data to display.</p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Kanban Board Overview</CardTitle>
        <CardDescription> {formattedDate} </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex flex-col">
        {" "}
        {/* Added flex flex-col for content layout */}
        {chartContent && (
          <ChartContainer
            config={chartConfigDefinition}
            className="mx-auto aspect-square max-h-[250px] w-full"
          >
            {chartContent}
          </ChartContainer>
        )}
        {/* Legend - Render based on chartData (could be placeholder initially) */}
        {chartData && chartData.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm mt-4">
            {" "}
            {/* Improved layout for legend */}
            {legendOrder.map((statusKey) => {
              const dataEntry = chartData.find((d) => d.status === statusKey);
              // Type assertion for configEntry might be needed if TS can't infer well from chartConfigDefinition
              const configEntry = chartConfigDefinition[statusKey] as {
                label: string;
                color: string;
              };
              const countValue = dataEntry ? dataEntry.count : 0;

              return (
                <div key={statusKey} className="flex items-center">
                  <span
                    className="mr-1.5 h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: configEntry.color }}
                  />
                  <span className="text-muted-foreground">
                    {configEntry.label}:
                  </span>
                  <span className="font-semibold ml-1">{countValue}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-auto pt-4">
        {" "}
        {/* Added mt-auto to push footer down */}
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing Task Summary for {user?.name || "Current User"}
        </div>
      </CardFooter>
    </Card>
  );
}

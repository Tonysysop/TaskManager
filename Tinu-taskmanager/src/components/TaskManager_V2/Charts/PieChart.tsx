import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import Spinner1 from "@/components/spinner";

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

const chartConfig = {
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
} satisfies ChartConfig;

const legendOrder: (keyof Omit<typeof chartConfig, "count">)[] = [
	"In_Progress",
	"Planned",
	"Completed",
	"Late",
];

export function DonutChart() {
	const [chartData, setChartData] = useState([
		{ status: "Late", count: 0, fill: "var(--color-Late)" },
		{ status: "In_Progress", count: 0, fill: "var(--color-In_Progress)" },
		{ status: "Planned", count: 0, fill: "var(--color-Planned)" },
		{ status: "Completed", count: 0, fill: "var(--color-Completed)" },
	]);
	const [loading, setLoading] = useState(true);

	const date = new Date();
	const formattedDate = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const { idToken, user } = useAuth();

	useEffect(() => {
		if (!user?.sub || !idToken) return;
		// Make the Axios call to fetch data from the API Gateway
		const fetchTaskStats = async () => {
			try {
				const response = await axios.get(`${API_BASE}/count`, {
					params: { userId: user.sub },
					headers: { Authorization: `Bearer ${idToken}` },
				});

				if (response.data) {
					setChartData([
						{
							status: "Late",
							count: response.data.late,
							fill: "var(--color-Late)",
						},
						{
							status: "In_Progress",
							count: response.data.InProgress,
							fill: "var(--color-In_Progress)",
						},
						{
							status: "Planned",
							count: response.data.Planned,
							fill: "var(--color-Planned)",
						},
						{
							status: "Completed",
							count: response.data.Completed,
							fill: "var(--color-Completed)",
						},
					]);
				}
			} catch (error) {
				console.error("Error fetching task stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTaskStats();
	}, [user?.sub, idToken]);

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Kanban Board Overview</CardTitle>
				<CardDescription> {formattedDate} </CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px]"
				>
					{loading ? (
						<div>
              <Spinner1 />
						</div> // Display loading state while fetching data
					) : (
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
								activeShape={({
									outerRadius = 0,
									...props
								}: PieSectorDataItem) => (
									<Sector {...props} outerRadius={outerRadius + 10} />
								)}
							/>
						</PieChart>
					)}
				</ChartContainer>
				{/* Legend */}
				<div className="flex flex-col gap-2 text-sm mt-4">
					{legendOrder.map((statusKey) => {
						const dataEntry = chartData.find((d) => d.status === statusKey);
						const configEntry = chartConfig[statusKey] as {
							label: string;
							color: string;
						};

						const countValue = dataEntry ? dataEntry.count : 0;

						return (
							<div key={statusKey} className="flex items-center gap-">
								<span
									className="mr-2 h-3 w-3 rounded-full"
									style={{ backgroundColor: configEntry.color }}
								/>
								<span className="text-muted-foreground">
									{configEntry.label}:
								</span>
								<span className="font-semibold">{countValue}</span>
							</div>
						);
					})}
				</div>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 font-medium leading-none">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">
					Showing Task Summary for {user?.name}
				</div>
			</CardFooter>
		</Card>
	);
}

// import { TrendingUp } from "lucide-react"
// import {  Pie, PieChart, Sector } from "recharts"
// import { PieSectorDataItem } from "recharts/types/polar/Pie"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// const chartData = [
//   { status: "Late", count: 275, fill: "var(--color-Late)" },
//   { status: "In_Progress", count: 200, fill: "var(--color-In_Progress)" },
//   { status: "Not_Started", count: 187, fill: "var(--color-Not_Started)" },
//   { status: "Completed", count: 173, fill: "var(--color-Completed)" },
// ]

// const chartConfig = {
//   count: {
//     label: "status",
//   },
//   Late: {
//     label: "Late",
//     color: "hsl(var(--chart-1))",
//   },
//   In_Progress: {
//     label: "In_Progress",
//     color: "hsl(var(--chart-2))",
//   },
//   Not_Started: {
//     label: "Not_Started",
//     color: "hsl(var(--chart-3))",
//   },
//   Completed: {
//     label: "Completed",
//     color: "hsl(var(--chart-4))",
//   },

// } satisfies ChartConfig

// export function DonutChart() {
//   const date = new Date()
//   const formattedDate = date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Kanban Board Overview</CardTitle>
//         <CardDescription> {formattedDate} </CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Pie
//               data={chartData}
//               dataKey="count"
//               nameKey="status"
//               innerRadius={60}
//               strokeWidth={5}
//               activeIndex={0}
//               activeShape={({
//                 outerRadius = 0,
//                 ...props
//               }: PieSectorDataItem) => (
//                 <Sector {...props} outerRadius={outerRadius + 10} />
//               )}
//             />
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">
//           Showing total visitors for the last 6 months
//         </div>
//       </CardFooter>
//     </Card>
//   )
// }

// "use client"

// import { TrendingUp } from "lucide-react"
// import { Pie, PieChart, Sector } from "recharts"
// import { PieSectorDataItem } from "recharts/types/polar/Pie"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// // 1. Use `count` instead of `value`
// // 2. Provide meaningful CSS variables for fill
// const chartData = [
//   { status: "Not-Started", count: 42, fill: "var(--color-neutral)" },
//   { status: "In-Progress", count: 37, fill: "var(--color-amber)" },
//   { status: "Late", count: 15, fill: "var(--color-destructive)" },
//   { status: "Completed", count: 68, fill: "var(--color-emerald)" },
// ]

// const chartConfig = {
//   count: {
//     label: "Tasks",
//   },
//   "Not-Started": {
//     label: "Not Started",
//     color:  "hsl(var(--chart-1))",
//   },
//   "In-Progress": {
//     label: "In Progress",
//     color: "hsl(var(--chart-2))",
//   },
//   Late: {
//     label: "Late",
//     color: "hsl(var(--chart-3))",
//   },
//   Completed: {
//     label: "Completed",
//     color: "hsl(var(--chart-4))",
//   },
// } satisfies ChartConfig

// export function DonutChart() {
//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Task Status Distribution</CardTitle>
//         <CardDescription>Overview of your tasks</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Pie
//               data={chartData}
//               dataKey="count"       // ← use `count`
//               nameKey="status"      // ← name field is `status`
//               innerRadius={60}
//               strokeWidth={5}
//               outerRadius={80}
//               fillOpacity={1}
//               activeIndex={0}
//               activeShape={({
//                 outerRadius = 0,
//                 ...props
//               }: PieSectorDataItem) => (
//                 <Sector {...props} outerRadius={outerRadius + 10} />
//               )}
//             />
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">
//           Showing total tasks by status
//         </div>
//       </CardFooter>
//     </Card>
//   )
// }

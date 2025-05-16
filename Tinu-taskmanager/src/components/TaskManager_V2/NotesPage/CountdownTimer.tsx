import { useState, useEffect } from "react";

interface TimeLeft {
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	[key: string]: number | undefined;
}

const CountdownTimer = () => {
	// 👇 Get or create persistent launch date
	const getLaunchDate = () => {
		const saved = localStorage.getItem("launchDate");
		if (saved) {
			return new Date(saved);
		} else {
			const newDate = new Date();
			newDate.setDate(newDate.getDate() + 15);
			localStorage.setItem("launchDate", newDate.toISOString());
			return newDate;
		}
	};

	const launchDate = getLaunchDate();

	const calculateTimeLeft = () => {
		const difference = +launchDate - +new Date();
		let timeLeft: TimeLeft = {};

		if (difference > 0) {
			timeLeft = {
				days: Math.floor(difference / (1000 * 60 * 60 * 24)),
				hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
				minutes: Math.floor((difference / 1000 / 60) % 60),
				seconds: Math.floor((difference / 1000) % 60),
			};
		}

		return timeLeft;
	};

	const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const timerComponents = Object.keys(timeLeft).map((interval) => {
		if (!timeLeft[interval]) return null;

		return (
			<div key={interval} className="flex flex-col items-center mx-4">
				<div className="text-3xl md:text-4xl font-light bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
					{timeLeft[interval]}
				</div>
				<div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 mt-2">
					{interval}
				</div>
			</div>
		);
	});

	return (
		<div className="flex justify-center my-6 text-gray-800 dark:text-white">
			{timerComponents.length ? timerComponents : <span>We've launched!</span>}
		</div>
	);
};

export default CountdownTimer;

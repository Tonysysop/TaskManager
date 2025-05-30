// src/hooks/useArchiveManager.ts

import { useEffect } from "react";
import { TaskAttributes } from "@/types/TaskAttributes";
import { subMonths, isBefore, isValid } from "date-fns"; // Make sure isValid is imported if you use it

type UpdateTaskCallback = (
    taskId: string,
    updates: Partial<TaskAttributes>
) => Promise<void>;

type DeleteTaskCallback = (taskId: string) => Promise<void>;

export const useArchiveManager = (
    tasks: TaskAttributes[], // This is the prop that might be undefined initially
    updateTask: UpdateTaskCallback,
    deleteTaskFromMainList: DeleteTaskCallback
) => {
    // Effect for checking and auto-archiving tasks based on `completedAt`
    useEffect(() => {
        // --- ADDED GUARD CLAUSE HERE ---
        // If tasks is null, undefined, or not an array, exit early.
        // This prevents `tasks.filter` from being called on an invalid value.
        if (!Array.isArray(tasks)) {
            console.warn("useArchiveManager: 'tasks' prop is not an array. Skipping archival check.");
            return;
        }
        // --- END ADDED GUARD CLAUSE ---

        const checkForAutoArchival = async () => {
            const now = new Date();
            const autoArchiveAfterMonths = 2; // Tasks completed 2 months ago or more
            const twoMonthsAgo = subMonths(now, autoArchiveAfterMonths);

            const tasksToAutoArchive = tasks.filter((task) => {
                const taskCompletedAt = task.completedAt
                    ? task.completedAt instanceof Date
                        ? task.completedAt
                        : new Date(task.completedAt)
                    : null;

                return (
                    task.status === "Completed" &&
                    !task.archived &&
                    taskCompletedAt &&
                    isValid(taskCompletedAt) && // Ensure the date is valid
                    isBefore(taskCompletedAt, twoMonthsAgo)
                );
            });

            if (tasksToAutoArchive.length > 0) {
                console.log(
                    `[ArchiveManager] Found ${tasksToAutoArchive.length} tasks to auto-archive based on completion date.`
                );
                for (const task of tasksToAutoArchive) {
                    console.log(
                        `[ArchiveManager] Auto-archiving task: "${task.task}" (ID: ${task.id}) completed on ${task.completedAt?.toString()}`
                    );
                    await updateTask(task.id, {
                        archived: true,
                        archivedAt: new Date(), // Set the archival timestamp
                    });
                }
            }
        };

        checkForAutoArchival();
        const intervalId = setInterval(checkForAutoArchival, 60 * 60 * 1000); // Check every hour

        return () => clearInterval(intervalId);
    }, [tasks, updateTask]); // Depend on `tasks` and `updateTask`

    // Public API of the hook
    return {
        updateTask,
        deleteTaskFromMainList,
    };
};
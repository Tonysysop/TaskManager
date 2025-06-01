// src/hooks/useTaskQueries.ts (or a more specific name like useTasksApi.ts)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { TaskAttributes } from "@/types/TaskAttributes"; // Adjust path as needed
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast"; // Adjust path
import { useAuth } from "@/Context/AuthContext"; // Adjust path

const API_BASE = import.meta.env.VITE_API_URL;
const TASKS_QUERY_KEY = "tasks";


interface ApiErrorResponse {
  error: string;
}

// --- API Helper Functions ---
const getAuthConfig = (idToken: string | null) => {
  if (!idToken) throw new Error("User not authenticated");
  return { headers: { Authorization: `Bearer ${idToken}` } };
};

export const fetchTasksAPI = async (
  userId: string,
  idToken: string
): Promise<TaskAttributes[]> => {
  const { data } = await axios.get<TaskAttributes[]>(`${API_BASE}/tasks`, {
    params: { userId },
    ...getAuthConfig(idToken),
  });
  // Ensure dates are Date objects
  return data.map((t: TaskAttributes) => ({
    ...t,
    dueDate: t.dueDate ? new Date(t.dueDate) : new Date(0),
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    archivedAt: t.archivedAt ? new Date(t.archivedAt) : undefined,
  }));
};

// The server should ideally return the created/updated task
const createTaskAPI = async (
  taskData: Omit<TaskAttributes, "id" | "userId" | "createdAt" | "updatedAt">,
  userId: string,
  idToken: string
): Promise<TaskAttributes> => {
  const payload = {
    ...taskData,
    userId,
    dueDate: taskData.dueDate
      ? new Date(taskData.dueDate).toISOString()
      : undefined,
  };
  const { data } = await axios.post<TaskAttributes>(
    `${API_BASE}/tasks`,
    payload,
    getAuthConfig(idToken)
  );
  return {
    // Ensure dates are Date objects from response
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : new Date(0),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    archivedAt: data.archivedAt ? new Date(data.archivedAt) : undefined,
  };
};

const updateTaskAPI = async (
  taskId: string,
  updates: Partial<TaskAttributes>,
  userId: string,
  idToken: string
): Promise<TaskAttributes> => {
  const payload: Partial<TaskAttributes> & { id: string; userId: string } = {
    id: taskId,
    userId,
    ...updates,
  };
  if (payload.dueDate && payload.dueDate instanceof Date)
    payload.dueDate = payload.dueDate.toISOString();
  if (payload.completedAt && payload.completedAt instanceof Date)
    payload.completedAt = payload.completedAt.toISOString();
  if (payload.archivedAt && payload.archivedAt instanceof Date)
    payload.archivedAt = payload.archivedAt.toISOString();

  const { data } = await axios.patch<TaskAttributes>(
    `${API_BASE}/tasks`,
    payload,
    getAuthConfig(idToken)
  );
  return {
    // Ensure dates are Date objects from response
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : new Date(0),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    archivedAt: data.archivedAt ? new Date(data.archivedAt) : undefined,
  };
};

const deleteTaskAPI = async (
  taskId: string,
  userId: string,
  idToken: string
): Promise<{ taskId: string }> => {
  await axios.delete(`${API_BASE}/tasks`, {
    ...getAuthConfig(idToken),
    data: { taskId, userId },
  });
  return { taskId }; // Return ID for optimistic updates
};

// --- TanStack Query Hooks ---
export const useTasksData = () => {
  const { user, idToken } = useAuth();
  const queryClient = useQueryClient();

  // FETCH Tasks
  const {
    data: tasks = [], // Default to empty array to avoid undefined issues
    isLoading: isLoadingTasks,
    isError: isFetchError,
    error: fetchError,
  } = useQuery<TaskAttributes[], AxiosError<ApiErrorResponse>>({
    queryKey: [TASKS_QUERY_KEY, user?.sub],
    queryFn: () => {
      if (!user?.sub || !idToken)
        return Promise.reject(new Error("User or token missing"));
      return fetchTasksAPI(user.sub, idToken);
    },
    enabled: !!user?.sub && !!idToken, // Only fetch if user and token are available
  });

  // CREATE Task
  const { mutate: createTask, isPending: isCreatingTask, mutateAsync: createTaskAsync } = useMutation< // Add mutateAsync
    TaskAttributes, // Return type of mutationFn
    AxiosError<ApiErrorResponse>, // Error type
    Omit<TaskAttributes, "id" | "userId" | "createdAt" | "updatedAt">,
    { previousTasks: TaskAttributes[]; optimisticTask: TaskAttributes } // Explicitly type the context
  >({
    mutationFn: (newTaskData) => {
      if (!user?.sub || !idToken)
        return Promise.reject(new Error("User or token missing for create"));
      return createTaskAPI(newTaskData, user.sub, idToken);
    },
    onMutate: async (newTaskData) => {
      await queryClient.cancelQueries({
        queryKey: [TASKS_QUERY_KEY, user?.sub],
      });
      const previousTasks =
        queryClient.getQueryData<TaskAttributes[]>([
          TASKS_QUERY_KEY,
          user?.sub,
        ]) || [];
      const optimisticTask: TaskAttributes = {
        ...newTaskData,
        id: `temp-${Date.now()}`,
        userId: user!.sub!, // We've checked user.sub in mutationFn
        dueDate: newTaskData.dueDate
          ? new Date(newTaskData.dueDate)
          : new Date(0),
      };
      queryClient.setQueryData<TaskAttributes[]>(
        [TASKS_QUERY_KEY, user?.sub],
        [...previousTasks, optimisticTask]
      );
      CustomToast({
        variant: "info",
        description: "Creating task...",
        duration: 1500,
      });
      return { previousTasks, optimisticTask };
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic task with actual task from server
      queryClient.setQueryData<TaskAttributes[]>(
        [TASKS_QUERY_KEY, user?.sub],
        (old) =>
          (old || []).map((task) =>
            task.id === context?.optimisticTask.id ? data : task
          )
      );
      CustomToast({
        variant: "success",
        description: "Task created!",
        duration: 3000,
      });
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [TASKS_QUERY_KEY, user?.sub],
          context.previousTasks
        );
      }
      CustomToast({
        variant: "error",
        description: err.response?.data?.error || "Failed to create task.",
        duration: 3000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.sub] });
      queryClient.invalidateQueries({
        queryKey: ["taskStats", user?.sub, idToken],
      }); // <-- Invalidate chart here
      queryClient.invalidateQueries({
        queryKey: ["DashboardTask", user?.sub, idToken],
      }); // <-- Invalidate Task Dashboard card
    },
  });

  // UPDATE Task
  const { mutate: updateTask, isPending: isUpdatingTask, mutateAsync: updateTaskAsync } = useMutation< // Add mutateAsync
    TaskAttributes,
    AxiosError<ApiErrorResponse>,
    {
      taskId: string;
      updates: Partial<TaskAttributes>;
      optimisticTasks?: TaskAttributes[];
    },
    { previousTasks: TaskAttributes[] } // Explicitly type the context
  >({
    mutationFn: ({ taskId, updates }) => {
      console.log("Mutation called with updates:", updates);
      if (!user?.sub || !idToken)
        return Promise.reject(new Error("User or token missing for update"));
      return updateTaskAPI(taskId, updates, user.sub, idToken);
    },
    onMutate: async ({ taskId, updates, optimisticTasks }) => {
      // Destructure optimisticTasks here
      await queryClient.cancelQueries({
        queryKey: [TASKS_QUERY_KEY, user?.sub],
      });
      const previousTasks =
        queryClient.getQueryData<TaskAttributes[]>([
          TASKS_QUERY_KEY,
          user?.sub,
        ]) || [];
      const newCachedTasks = optimisticTasks
        ? // If a full reordered array is provided, use it directly for the optimistic update
          optimisticTasks.map((t) => ({
            ...t,
            // Ensure Date objects for local state consistency if they were ISO strings when passed
            dueDate: t.dueDate
              ? t.dueDate instanceof Date
                ? t.dueDate
                : new Date(t.dueDate)
              : t.dueDate,
            completedAt: t.completedAt
              ? t.completedAt instanceof Date
                ? t.completedAt
                : new Date(t.completedAt)
              : t.completedAt,
            archivedAt: t.archivedAt
              ? t.archivedAt instanceof Date
                ? t.archivedAt
                : new Date(t.archivedAt)
              : t.archivedAt,
          }))
        : // Otherwise, apply updates to the single task as before
          previousTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  ...updates,
                  dueDate: updates.dueDate
                    ? updates.dueDate instanceof Date
                      ? updates.dueDate
                      : new Date(updates.dueDate)
                    : t.dueDate,
                  completedAt: updates.completedAt
                    ? updates.completedAt instanceof Date
                      ? updates.completedAt
                      : new Date(updates.completedAt)
                    : t.completedAt,
                  archivedAt: updates.archivedAt
                    ? updates.archivedAt instanceof Date
                      ? updates.archivedAt
                      : new Date(updates.archivedAt)
                    : t.archivedAt,
                }
              : t
          );

      queryClient.setQueryData<TaskAttributes[]>(
        [TASKS_QUERY_KEY, user?.sub],
        newCachedTasks
      );
      CustomToast({
        variant: "info",
        description: "Updating task...",
        duration: 1500,
      });
      return { previousTasks };
    },
    onSuccess: (data) => {
      // Update the specific task in the cache with server data
      queryClient.setQueryData<TaskAttributes[]>(
        [TASKS_QUERY_KEY, user?.sub],
        (old) => (old || []).map((task) => (task.id === data.id ? data : task))
      );
      CustomToast({
        variant: "success",
        description: "Task updated!",
        duration: 2000,
      });
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [TASKS_QUERY_KEY, user?.sub],
          context.previousTasks
        );
      }
      CustomToast({
        variant: "error",
        description: err.response?.data?.error || "Failed to update task.",
        duration: 3000,
      });
    },
    onSettled: (_data, _error, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.sub] });
      // You might also invalidate a specific task query if you have one:
      queryClient.invalidateQueries({
        queryKey: [TASKS_QUERY_KEY, user?.sub, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["taskStats", user?.sub, idToken],
      }); // <-- Invalidate chart here
      queryClient.invalidateQueries({
        queryKey: ["DashboardTask", user?.sub, idToken],
      }); // <-- Invalidate Task Dashboard card
    },
  });

  // DELETE Task
   const { mutate: deleteTask, isPending: isDeletingTask, mutateAsync: deleteTaskAsync } = useMutation< // Add mutateAsync
    { taskId: string },
    AxiosError<ApiErrorResponse>,
    string, // taskId
    { previousTasks: TaskAttributes[] } // Explicitly type the context
  >({
    mutationFn: (taskId) => {
      if (!user?.sub || !idToken)
        return Promise.reject(new Error("User or token missing for delete"));
      return deleteTaskAPI(taskId, user.sub, idToken);
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: [TASKS_QUERY_KEY, user?.sub],
      });
      const previousTasks =
        queryClient.getQueryData<TaskAttributes[]>([
          TASKS_QUERY_KEY,
          user?.sub,
        ]) || [];
      queryClient.setQueryData<TaskAttributes[]>(
        [TASKS_QUERY_KEY, user?.sub],
        previousTasks.filter((t) => t.id !== taskId)
      );
      CustomToast({
        variant: "info",
        description: "Deleting task...",
        duration: 1500,
      });
      return { previousTasks };
    },
    onSuccess: () => {
      CustomToast({
        variant: "success",
        description: "Task deleted!",
        duration: 3000,
      });
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [TASKS_QUERY_KEY, user?.sub],
          context.previousTasks
        );
      }
      CustomToast({
        variant: "error",
        description: err.response?.data?.error || "Failed to delete task.",
        duration: 3000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.sub] });
      queryClient.invalidateQueries({
        queryKey: ["taskStats", user?.sub, idToken],
      }); // <-- Invalidate chart here
      queryClient.invalidateQueries({
        queryKey: ["DashboardTask", user?.sub, idToken],
      }); // <-- Invalidate Task Dashboard card
    },
  });

  return {
    tasks,
    isLoadingTasks,
    isFetchError,
    fetchError,
    createTask,
    isCreatingTask,
    updateTask,
    isUpdatingTask,
    deleteTask,
    isDeletingTask,
    createTaskAsync, // Expose async mutations
    updateTaskAsync,
    deleteTaskAsync,
  };
};

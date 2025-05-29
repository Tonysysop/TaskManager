import axios, { AxiosError } from "axios";
import { useAuth } from "./AuthContext"; // Ensure this path is correct
import { v4 as uuidv4 } from "uuid";
import { TagColors } from "@/lib/TagColor"; // Ensure this path is correct
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast"; // Ensure this path is correct
import {
	useQuery,
	useMutation,
	useQueryClient,
	QueryKey,
} from "@tanstack/react-query";
import React from "react";

export interface Tag {
	tagId: string;
	name: string;
	color: string;
	userId?: string;
}

// Define a query key for tags
const tagsQueryKeyPrefix = "tags"; // Using a prefix for clarity

const API_BASE = import.meta.env.VITE_API_URL;

// --- Helper Function ---
function formatTagName(name: string): string {
	const trimmed = name.trim();
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// --- API Interaction Functions ---

const fetchTagsAPI = async (
	userId: string,
	idToken: string
): Promise<Tag[]> => {
	const { data } = await axios.get<Tag[]>(`${API_BASE}/tags`, {
		params: { userId },
		headers: { Authorization: `Bearer ${idToken}` },
	});
	return Array.isArray(data) ? data : [];
};

interface AddTagPayload {
	tagId: string; // Client-generated
	name: string;
	color: string;
	userId: string;
}
const addTagAPI = async (
	payload: AddTagPayload,
	idToken: string
): Promise<Tag> => {
	const { data } = await axios.post<Tag>(`${API_BASE}/tags`, payload, {
		headers: { Authorization: `Bearer ${idToken}` },
	});
	return data; // Assuming backend returns the created tag, potentially with its own ID
};

interface RemoveTagPayload {
	tagId: string;
	userId: string;
}
const removeTagAPI = async (
	payload: RemoveTagPayload,
	idToken: string
): Promise<void> => {
	await axios.delete(`${API_BASE}/tags`, {
		data: payload, // As per your original code
		headers: { Authorization: `Bearer ${idToken}` },
	});
};

interface EditTagPayload {
	tagId: string;
	userId: string;
	name: string;
	color: string; // As per your original code, color is also sent
}
const editTagAPI = async (
	payload: EditTagPayload,
	idToken: string
): Promise<Tag> => {
	// Assuming backend returns the updated tag
	const { data } = await axios.patch<Tag>(`${API_BASE}/tags`, payload, {
		headers: { Authorization: `Bearer ${idToken}` },
	});
	return data;
};

interface ErrorResponse {
	message: string;
}

// --- Custom Hook: useTags ---
export function useTags() {
	const queryClient = useQueryClient();
	const { user, idToken } = useAuth();
	const userId = user?.sub;

	const getTagsQueryKey = (): QueryKey => [tagsQueryKeyPrefix, userId];

	// === FETCH TAGS ===
	const {
		data: tags = [],
		isLoading: isLoadingTags,
		isError: isErrorLoadingTags,
		error: tagsError,
	} = useQuery<Tag[], AxiosError<ErrorResponse>, Tag[], QueryKey>({
		queryKey: getTagsQueryKey(),
		queryFn: () => {
			if (!userId || !idToken) return Promise.resolve([]);
			return fetchTagsAPI(userId, idToken);
		},
		enabled: !!userId && !!idToken,
	});

	// Handle query errors separately
	React.useEffect(() => {
		if (tagsError) {
			console.error("Failed to load tags:", tagsError);
			CustomToast({
				variant: "error",
				description:
					tagsError.response?.data?.message || "Failed to load tags.",
				duration: 6000,
			});
		}
	}, [tagsError]);

	// === ADD TAG ===
	const { mutateAsync: addTagMutate, isPending: isAddingTag } = useMutation<
		Tag, // Type of data returned by mutationFn (the created tag from backend)
		AxiosError, // Type of error
		{ name: string }, // Type of variables passed to the exposed addTag function
		{ previousTags?: Tag[] } // Context for optimistic updates
	>({
		mutationFn: async (variables: { name: string }): Promise<Tag> => {
			if (!userId || !idToken)
				throw new Error("User not authenticated for adding tag.");

			const formattedName = formatTagName(variables.name);
			// Client-side duplicate check (optional, backend should ideally handle this too)
			if (
				tags.some((t) => t.name.toLowerCase() === formattedName.toLowerCase())
			) {
				// Throw an error that can be caught by onError or handled before calling mutate
				throw new Error("Tag already exists, use a different name");
			}

			const clientGeneratedTag: AddTagPayload = {
				tagId: uuidv4(), // Client-generated ID
				name: formattedName,
				color: TagColors[Math.floor(Math.random() * TagColors.length)],
				userId: userId,
			};
			return addTagAPI(clientGeneratedTag, idToken);
		},
		onMutate: async (newTagData) => {
			// For Optimistic Update
			if (!userId) return;
			const formattedName = formatTagName(newTagData.name);
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: getTagsQueryKey() });

			// Snapshot the previous value
			const previousTags = queryClient.getQueryData<Tag[]>(getTagsQueryKey());

			// Optimistically update to the new value
			const optimisticTag: Tag = {
				tagId: uuidv4(), // Use a temp ID or the client-generated one
				name: formattedName,
				color: TagColors[Math.floor(Math.random() * TagColors.length)],
			};

			queryClient.setQueryData<Tag[]>(getTagsQueryKey(), (old) =>
				old ? [...old, optimisticTag] : [optimisticTag]
			);

			return { previousTags }; // Return context with snapped-back value
		},
		onSuccess: () => {
			// returnedTagFromServer is the actual tag from the backend
			queryClient.invalidateQueries({ queryKey: getTagsQueryKey() });

			CustomToast({
				variant: "success",
				description: "Tag added.",
				duration: 4000,
			});
		},
		onError: (error: AxiosError | Error, variables, context) => {
			console.error("Error adding tag:", error);
			// Rollback optimistic update if one was performed
			if (context?.previousTags) {
				queryClient.setQueryData(getTagsQueryKey(), context.previousTags);
			}
			const message =
				(error as AxiosError<ErrorResponse>)?.response?.data?.message ||
				error.message ||
				`Failed to add tag "${variables.name}".`;
			CustomToast({ variant: "error", description: message, duration: 6000 });
		},
	});

	// Wrapper for addTag to include client-side checks before mutation
	const addTag = async (name: string) => {
		if (!name.trim()) {
			CustomToast({
				variant: "warning",
				description: "Tag name cannot be empty.",
				duration: 4000,
			});
			return;
		}
		const formatted = formatTagName(name);
		if (tags.some((t) => t.name.toLowerCase() === formatted.toLowerCase())) {
			CustomToast({
				variant: "warning",
				description: "Tag already exists, use a different name.",
				duration: 6000,
			});
			return; // Prevent mutation call
		}
		try {
			await addTagMutate({ name });
		} catch (error) {
			// Error is already handled by useMutation's onError, but you could add more here if needed.
			// console.log("Caught in addTag wrapper", error);
		}
	};

	// === REMOVE TAG ===
	const { mutateAsync: removeTagMutate, isPending: isRemovingTag } =
		useMutation<
			void,
			AxiosError,
			string, // tagId
			{ previousTags?: Tag[]; removedTag?: Tag }
		>({
			mutationFn: (tagId: string) => {
				if (!userId || !idToken)
					throw new Error("User not authenticated for removing tag.");
				return removeTagAPI({ tagId, userId }, idToken);
			},
			onMutate: async (tagIdToRemove) => {
				// Optimistic Update
				if (!userId) return;
				await queryClient.cancelQueries({ queryKey: getTagsQueryKey() });
				const previousTags = queryClient.getQueryData<Tag[]>(getTagsQueryKey());
				const removedTag = previousTags?.find((t) => t.tagId === tagIdToRemove);
				queryClient.setQueryData<Tag[]>(getTagsQueryKey(), (old) =>
					old ? old.filter((tag) => tag.tagId !== tagIdToRemove) : []
				);
				return { previousTags, removedTag };
			},
			onSuccess: () => {
				CustomToast({
					variant: "success",
					description: "Tag removed successfully!",
				});
				// No explicit invalidation needed if optimistic update is perfect,
				// but often good for ensuring consistency or if other data depends on it.
				queryClient.invalidateQueries({ queryKey: getTagsQueryKey() });
			},
			onError: (error: AxiosError, _, context) => {
				console.error("Error removing tag:", error);
				if (context?.previousTags) {
					queryClient.setQueryData(getTagsQueryKey(), context.previousTags);
				}
				const removedTagName = context?.removedTag?.name;
				const desc = removedTagName
					? `Failed to remove tag "${removedTagName}".`
					: "Failed to remove tag.";
				const message =
					(error as AxiosError<ErrorResponse>)?.response?.data?.message ||
					error.message ||
					desc;
				CustomToast({
					variant: "error",
					description: message,
					duration: 6000,
				});
			},
		});

	// === EDIT TAG ===
	const { mutateAsync: editTagMutate, isPending: isEditingTag } = useMutation<
		Tag, // Backend returns updated tag
		AxiosError,
		{ tagId: string; newName: string },
		{ previousTags?: Tag[] }
	>({
		mutationFn: (variables: { tagId: string; newName: string }) => {
			if (!userId || !idToken)
				throw new Error("User not authenticated for editing tag.");

			const formattedNewName = formatTagName(variables.newName);
			const tagToUpdate = tags.find((t) => t.tagId === variables.tagId);
			if (!tagToUpdate) throw new Error("Tag not found for editing.");

			// Client-side duplicate check for the new name (excluding the current tag being edited)
			if (
				tags.some(
					(t) =>
						t.tagId !== variables.tagId &&
						t.name.toLowerCase() === formattedNewName.toLowerCase()
				)
			) {
				throw new Error("Another tag with this name already exists.");
			}

			const payload: EditTagPayload = {
				tagId: variables.tagId,
				userId,
				name: formattedNewName,
				color: tagToUpdate.color, // Preserve existing color as per original logic
			};
			return editTagAPI(payload, idToken);
		},
		onMutate: async (newData) => {
			// Optimistic Update
			if (!userId) return;
			const formattedNewName = formatTagName(newData.newName);
			await queryClient.cancelQueries({ queryKey: getTagsQueryKey() });
			const previousTags = queryClient.getQueryData<Tag[]>(getTagsQueryKey());
			queryClient.setQueryData<Tag[]>(getTagsQueryKey(), (old) =>
				old
					? old.map((tag) =>
							tag.tagId === newData.tagId
								? { ...tag, name: formattedNewName }
								: tag
					  )
					: []
			);
			return { previousTags };
		},
		onSuccess: () => {
			CustomToast({
				variant: "success",
				description: "Tag Updated.",
			});
			// Invalidate to ensure consistency, especially if more fields than 'name' could change or for robust sync
			queryClient.invalidateQueries({ queryKey: getTagsQueryKey() });
		},
		onError: (error: AxiosError | Error, _, context) => {
			console.error("Error editing tag:", error);
			if (context?.previousTags) {
				queryClient.setQueryData(getTagsQueryKey(), context.previousTags);
			}
			const message =
				(error as AxiosError<ErrorResponse>)?.response?.data?.message ||
				error.message ||
				`Failed to update tag.`;
			CustomToast({ variant: "error", description: message, duration: 6000 });
		},
	});

	// Wrapper for editTag to include client-side checks
	const editTag = async (tagId: string, newName: string) => {
		if (!newName.trim()) {
			CustomToast({
				variant: "warning",
				description: "New tag name cannot be empty.",
				duration: 4000,
			});
			return;
		}
		const formattedNewName = formatTagName(newName);
		const tagBeingEdited = tags.find((t) => t.tagId === tagId);

		if (
			tagBeingEdited &&
			tagBeingEdited.name.toLowerCase() === formattedNewName.toLowerCase()
		) {
			CustomToast({
				variant: "info",
				description: "No changes detected in tag name.",
				duration: 4000,
			});
			return;
		}

		if (
			tags.some(
				(t) =>
					t.tagId !== tagId &&
					t.name.toLowerCase() === formattedNewName.toLowerCase()
			)
		) {
			CustomToast({
				variant: "warning",
				description: "Another tag with this name already exists.",
				duration: 6000,
			});
			return;
		}
		try {
			await editTagMutate({ tagId, newName });
		} catch (error) {
			// Error is already handled by useMutation's onError
		}
	};

	return {
		tags,
		isLoadingTags,
		isErrorLoadingTags,
		tagsError,
		addTag, // Use the wrapped version
		isAddingTag,
		removeTag: removeTagMutate, // Expose the direct mutateAsync function
		isRemovingTag,
		editTag, // Use the wrapped version
		isEditingTag,
	};
}

// You no longer need TagsContext or TagsProvider
// export const TagsProvider = ({ children }: { children: ReactNode }) => { ... }
// export function useTags() { const context = useContext(TagsContext); ... }

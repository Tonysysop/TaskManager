import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { TagColors } from "@/lib/TagColor";
import CustomToast from "@/components/TaskManager_V2/Alerts/Custom-toast";


export interface Tag {
  tagId: string;
  name: string;
  color: string;
}

interface TagsContextType {
  tags: Tag[];
  addTag: (name: string) => Promise<void>;
  removeTag: (tagId: string) => Promise<void>;
  editTag: (tagId: string, newName: string) => Promise<void>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);
export function useTags() {
  const context = useContext(TagsContext);
  if (!context) throw new Error("useTags must be used within TagsProvider");
  return context;
}


function formatTagName(name: string) {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

const API_BASE = import.meta.env.VITE_API_URL;

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  // Fetch tags from backend
  const {idToken, user} = useAuth()
  useEffect(() => {
    if (!user?.sub || !idToken) return;
    axios
      .get<Tag[]>(`${API_BASE}/tags`, { 
        params: { userId: user.sub },
        headers: {Authorization: `Bearer ${idToken}`}
        
        })
      .then(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          setTags(data);
        } else {
          console.error("Unexpected tags payload:", data);
          setTags([]);
        }
      })
      .catch(err => {
        console.error(err);
        CustomToast({variant:"error", description:"Failed to load tags, please try again later", duration:6000})
      });
  }, [user?.sub, idToken]);


  const addTag = async (name: string) => {
    if (!user?.sub || !idToken) {
    CustomToast({variant:"error", description:"User is not authenticated", duration:6000})
    return;
  }
    const formatted = formatTagName(name);
    if (!formatted) return;
    const current = Array.isArray(tags) ? tags : [];
    if (current.some(t => t.name.toLowerCase() === formatted.toLowerCase())) {
      CustomToast({variant:"warning", description:"Tag already exists, use a different name", duration:6000})
      return;
    }

    const newTag: Tag = {
      tagId: uuidv4(),
      name: formatted,
      color: TagColors[Math.floor(Math.random() * TagColors.length)],
    };

    try {
      await axios.post(
        `${API_BASE}/tags`,
        { ...newTag, userId: user.sub },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTags([...current, newTag]);
      CustomToast({
        variant: "success",
        description: "Tag added successfully, you can now use it in your tasks",
        duration: 6000,
      });
    } catch (err: any) {
      console.error(err);
      CustomToast({variant:"error", 
        description:err.response?.data?.error || "Failed to add tag", 
        duration:6000
      })
    }
  };


  const removeTag = async (tagId: string) => {
    if (!user?.sub || !idToken) {
    CustomToast({
      variant:"error", 
      description:"User is not authenticated", 
      duration:6000
    })  
    return;
  }
    const current = Array.isArray(tags) ? tags : [];  
    try {
      await axios.delete(
        `${API_BASE}/tags`,
        { data: { tagId, userId: user.sub }, 
        headers: {Authorization: `Bearer ${idToken}`} }
      );
      setTags(current.filter(t => t.tagId !== tagId));
      CustomToast({variant:"success", description:"Tag removed successfully ", duration:6000})
    } catch (err: any) {
      console.error(err);
      CustomToast({variant:"error", description:err.response?.data?.error || "Failed to remove tag", duration:6000})
    }
  };

  const editTag = async (tagId: string, newName: string) => {
    if (!user?.sub || !idToken) {
    CustomToast({variant:"error", description:"User not authenticated", duration:6000})
    return;
  }
    const formatted = formatTagName(newName);
    if (!formatted) return;
    const current = Array.isArray(tags) ? tags : [];
    if (current.some(t => t.name.toLowerCase() === formatted.toLowerCase() && t.tagId !== tagId)) {
      CustomToast({variant:"warning", description:"Tag name already in use", duration:6000})
      return;
    }

    const tagToUpdate = current.find(t => t.tagId === tagId);
    if (!tagToUpdate) return;

    try {
      await axios.patch(
        `${API_BASE}/tags`,
        { tagId, userId: user.sub, name: formatted, color: tagToUpdate.color },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTags(current.map(t => t.tagId === tagId ? { ...t, name: formatted } : t));
      CustomToast({variant:"success", description:"Tag updated successfully, you can now use the new name", duration:6000})
    } catch (err: any) {
      console.error(err);
      CustomToast({variant:"error", description:err.response?.data?.error || "Failed to update tag", duration:6000})
    }
  };

  return (
    <TagsContext.Provider value={{ tags, addTag, removeTag, editTag }}>
      {children}
    </TagsContext.Provider>
  );
};































// // ./TagsContext.tsx
// import  { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { toast } from "sonner";
// import { fetchAuthSession } from "aws-amplify/auth";

// const tagColors = [
//   "bg-blue-100 text-blue-800",
//   "bg-red-100 text-red-800",
//   "bg-green-100 text-green-800",
//   "bg-yellow-100 text-yellow-800",
//   "bg-purple-100 text-purple-800",
//   "bg-pink-100 text-pink-800",
//   "bg-teal-100 text-teal-800",
//   "bg-amber-100 text-amber-800",
// ];

// interface Tag {
//   name: string;
//   color: string;
// }

// interface TagsContextType {
//   tags: Tag[];
//   addTag: (name: string) => void;
//   removeTag: (name: string) => void;
//   editTag: (oldName: string, newName: string) => void;
// }

// const TagsContext = createContext<TagsContextType | undefined>(undefined);

// export function useTags() {
//   const context = useContext(TagsContext);
//   if (!context) {
//     throw new Error("useTags must be used within a TagsProvider");
//   }
//   return context;
// }

// function formatTagName(name: string) {
//   const trimmed = name.trim();
//   return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
// }

// async function getCurrentUserEmail(): Promise<string | null> {
//   try {
//     const session = await fetchAuthSession();
//     const email = session.tokens?.idToken?.payload?.email;
//     return typeof email === 'string' ? email : null;
//   } catch (error) {
//     console.error("Failed to get user email:", error);
//     toast.error("Failed to load user email", { description: "Please try again later." });
//     return null;
//   }
// }

// export function TagsProvider({ children }: { children: ReactNode }) {
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const [tags, setTags] = useState<Tag[]>([]);

//   // Load the current user's email once
//   useEffect(() => {
//     getCurrentUserEmail().then(email => setUserEmail(email));
//   }, []);

//   // Load tags from localStorage when userEmail changes
//   useEffect(() => {
//     if (!userEmail) return;
//     const storageKey = `tags-${userEmail}`;
//     const stored = localStorage.getItem(storageKey);
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         if (Array.isArray(parsed)) setTags(parsed);
//       } catch {
//         console.warn('Invalid tags data, resetting.');
//         setTags([]);
//       }
//     }
//   }, [userEmail]);

//   // Save tags to localStorage whenever they change
//   useEffect(() => {
//     if (!userEmail) return;
//     const storageKey = `tags-${userEmail}`;
//     console.log(
//     `%c[SAVE TAGS] key=${storageKey}, `,
//     'color: purple; font-weight: bold;',
//     tags
//   );
//     localStorage.setItem(storageKey, JSON.stringify(tags));
//   }, [tags, userEmail]);

//   const addTag = (name: string) => {
//     const formatted = formatTagName(name);
//     if (!formatted) return;

//     if (tags.some(t => t.name.toLowerCase() === formatted.toLowerCase())) {
//       toast.error("Tag already exists", {
//         description: `"${formatted}" is already in your tags.`,
//         duration: 4000,
//         position: "bottom-right",
//       });
//       return;
//     }

//     const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
//     setTags(prev => [...prev, { name: formatted, color: randomColor }]);
//   };

//   const removeTag = (name: string) => {
//     setTags(prev => prev.filter(tag => tag.name !== name));
//   };

//   const editTag = (oldName: string, newName: string) => {
//     const formatted = formatTagName(newName);
//     if (!formatted) return;

//     if (
//       tags.some(
//         t =>  t.name.toLowerCase() === formatted.toLowerCase() &&
//               t.name.toLowerCase() !== oldName.toLowerCase()
//       )
//     ) {
//       toast.warning("Tag already exists", {
//         description: `"${formatted}" is already in your tags.`,
//         duration: 4000,
//         position: "bottom-right",
//       });
//       return;
//     }

//     setTags(prev =>
//       prev.map(tag =>
//         tag.name === oldName ? { ...tag, name: formatted } : tag
//       )
//     );
//   };

//   return (
//     <TagsContext.Provider value={{ tags, addTag, removeTag, editTag }}>
//       {children}
//     </TagsContext.Provider>
//   );
// }

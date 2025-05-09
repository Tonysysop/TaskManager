import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { fetchAuthSession } from "aws-amplify/auth";
import axios from "axios";
import { useAuth } from "./AuthContext";

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

const tagColors = [
  "bg-blue-100 text-blue-800",
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-amber-100 text-amber-800",
];

function formatTagName(name: string) {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

async function getCurrentUserSub(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const sub = session.tokens?.idToken?.payload?.sub;
    return typeof sub === 'string' ? sub : null;
  } catch (error) {
    console.error("Failed to load user sub", error);
    toast.error("Failed to load user data");
    return null;
  }
}

const API_BASE = import.meta.env.VITE_API_URL;

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [userSub, setUserSub] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  // Load the current user's Cognito sub once
  useEffect(() => {
    getCurrentUserSub().then(sub => setUserSub(sub));
  }, []);

  // Fetch tags from backend
  const {idToken} = useAuth()
  useEffect(() => {
    if (!userSub || !idToken) return;
    axios
      .get<Tag[]>(`${API_BASE}/tags`, { 
        params: { userId: userSub },
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
        toast.error("Failed to load tags");
      });
  }, [userSub, idToken]);


  const addTag = async (name: string) => {
    const formatted = formatTagName(name);
    if (!formatted) return;
    const current = Array.isArray(tags) ? tags : [];
    if (current.some(t => t.name.toLowerCase() === formatted.toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }

    const newTag: Tag = {
      tagId: crypto.randomUUID(),
      name: formatted,
      color: tagColors[Math.floor(Math.random() * tagColors.length)],
    };

    try {
      await axios.post(
        `${API_BASE}/tags`,
        { ...newTag, userId: userSub },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTags([...current, newTag]);
      toast.success("Tag added");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add tag");
    }
  };


  const removeTag = async (tagId: string) => {
    const current = Array.isArray(tags) ? tags : [];
    try {
      await axios.delete(
        `${API_BASE}/tags`,
        { data: { tagId, userId: userSub }, 
        headers: {Authorization: `Bearer ${idToken}`} }
      );
      setTags(current.filter(t => t.tagId !== tagId));
      toast.success("Tag removed");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to remove tag");
    }
  };

  const editTag = async (tagId: string, newName: string) => {
    const formatted = formatTagName(newName);
    if (!formatted) return;
    const current = Array.isArray(tags) ? tags : [];
    if (current.some(t => t.name.toLowerCase() === formatted.toLowerCase() && t.tagId !== tagId)) {
      toast.warning("Tag name already in use");
      return;
    }

    const tagToUpdate = current.find(t => t.tagId === tagId);
    if (!tagToUpdate) return;

    try {
      await axios.patch(
        `${API_BASE}/tags`,
        { tagId, userId: userSub, name: formatted, color: tagToUpdate.color },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTags(current.map(t => t.tagId === tagId ? { ...t, name: formatted } : t));
      toast.success("Tag updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update tag");
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

// ./TagsContext.tsx
import  { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { fetchAuthSession } from "aws-amplify/auth";

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

interface Tag {
  name: string;
  color: string;
}

interface TagsContextType {
  tags: Tag[];
  addTag: (name: string) => void;
  removeTag: (name: string) => void;
  editTag: (oldName: string, newName: string) => void;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return context;
}

function formatTagName(name: string) {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const email = session.tokens?.idToken?.payload?.email;
    return typeof email === 'string' ? email : null;
  } catch (error) {
    console.error("Failed to get user email:", error);
    toast.error("Failed to load user email", { description: "Please try again later." });
    return null;
  }
}

export function TagsProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  // Load the current user's email once
  useEffect(() => {
    getCurrentUserEmail().then(email => setUserEmail(email));
  }, []);

  // Load tags from localStorage when userEmail changes
  useEffect(() => {
    if (!userEmail) return;
    const storageKey = `tags-${userEmail}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setTags(parsed);
      } catch {
        console.warn('Invalid tags data, resetting.');
        setTags([]);
      }
    }
  }, [userEmail]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (!userEmail) return;
    const storageKey = `tags-${userEmail}`;
    console.log(
    `%c[SAVE TAGS] key=${storageKey}, `,
    'color: purple; font-weight: bold;',
    tags
  );
    localStorage.setItem(storageKey, JSON.stringify(tags));
  }, [tags, userEmail]);

  const addTag = (name: string) => {
    const formatted = formatTagName(name);
    if (!formatted) return;

    if (tags.some(t => t.name.toLowerCase() === formatted.toLowerCase())) {
      toast.error("Tag already exists", {
        description: `"${formatted}" is already in your tags.`,
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
    setTags(prev => [...prev, { name: formatted, color: randomColor }]);
  };

  const removeTag = (name: string) => {
    setTags(prev => prev.filter(tag => tag.name !== name));
  };

  const editTag = (oldName: string, newName: string) => {
    const formatted = formatTagName(newName);
    if (!formatted) return;

    if (
      tags.some(
        t =>  t.name.toLowerCase() === formatted.toLowerCase() &&
              t.name.toLowerCase() !== oldName.toLowerCase()
      )
    ) {
      toast.warning("Tag already exists", {
        description: `"${formatted}" is already in your tags.`,
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setTags(prev =>
      prev.map(tag =>
        tag.name === oldName ? { ...tag, name: formatted } : tag
      )
    );
  };

  return (
    <TagsContext.Provider value={{ tags, addTag, removeTag, editTag }}>
      {children}
    </TagsContext.Provider>
  );
}

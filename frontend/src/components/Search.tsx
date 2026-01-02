// src/components/Search.tsx
import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useAuthStore, useTaskStore } from "@/store";
import { Search as SearchIcon, X, Sparkles } from "lucide-react";

interface SearchProps {
  authMethod: "clerk" | "jwt" | null;
}

export const Search = memo(({ authMethod }: SearchProps) => {
  const { getToken } = useAuth();
  const { token: jwtToken } = useAuthStore();
  const [query, setQuery] = useState("");
  const { tasks, allTasks, filterTasks, fetchTasks } = useTaskStore();

  // Load all tasks when component mounts
  useEffect(() => {
    const loadAllTasks = async () => {
      let token: string | null = null;

      if (authMethod === "clerk") {
        token = await getToken();
      } else if (authMethod === "jwt") {
        token = jwtToken;
      }

      if (token) {
        await fetchTasks(token, true);
      }
    };

    loadAllTasks();
  }, [fetchTasks, getToken, authMethod, jwtToken]);

  // Filter tasks when query changes
  useEffect(() => {
    filterTasks(query);
  }, [query, filterTasks]);

  const handleClear = useCallback(() => {
    setQuery("");
    filterTasks(""); // This will show all tasks
  }, [filterTasks]);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  return (
    <div className="p-6 border-b bg-gradient-to-br from-card/50 to-primary/5 backdrop-blur-sm">
      <div className="relative animate-in fade-in slide-in-from-top-2 duration-500 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors z-10" />
          <Sparkles className="absolute left-14 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 animate-pulse z-10" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="🔍 Search tasks... (instant results)"
            className="w-full pl-24 pr-14 py-4 rounded-2xl bg-background border-2 border-input focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 placeholder:text-muted-foreground font-bold text-lg shadow-lg"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-110 z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Counter */}
        {query && (
          <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <span className="text-sm font-black text-primary">
                {tasks.length === 0 ? (
                  <>😔 No results</>
                ) : (
                  <>
                    ✨ Found {tasks.length}{" "}
                    {tasks.length === 1 ? "task" : "tasks"}
                  </>
                )}
              </span>
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              out of {allTasks.length} total
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Search.displayName = "Search";

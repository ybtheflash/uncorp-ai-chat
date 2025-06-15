import { useState } from "react";
import { MoreVertical, Trash2, Archive } from "lucide-react";

interface OptionsMenuProps {
  onDelete?: () => void;
  onArchive?: () => void;
}

export function OptionsMenu({ onDelete, onArchive }: OptionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="p-2 rounded-full bg-white dark:bg-zinc-900 shadow hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none border border-border"
        onClick={() => setOpen((v) => !v)}
        aria-label="Options"
      >
        <MoreVertical size={20} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black ring-opacity-10 focus:outline-none border border-border">
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => {
                setOpen(false);
                if (onDelete) onDelete();
              }}
            >
              <Trash2 size={16} className="mr-2" /> Delete Chat
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
              onClick={() => {
                setOpen(false);
                if (onArchive) onArchive();
              }}
            >
              <Archive size={16} className="mr-2" /> Archive Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

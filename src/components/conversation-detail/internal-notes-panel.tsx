import { useState, useRef } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import type { InternalNote, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface InternalNotesPanelProps {
  notes: InternalNote[];
  users: User[];
  currentUserId?: string;
  currentUserRole?: string;
  onAddNote?: (content: string) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function InternalNotesPanel({ notes, users, currentUserId, currentUserRole, onAddNote, onEditNote, onDeleteNote }: InternalNotesPanelProps) {
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resolveAuthor = (authorId: string) =>
    users.find((u) => u.id === authorId) ?? null;

  const sortedNotes = [...notes].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || !onAddNote) return;
    onAddNote(trimmed);
    setValue("");
  };

  const startEdit = (note: InternalNote) => {
    setEditingId(note.id);
    setEditValue(note.content);
  };

  const saveEdit = () => {
    if (!editingId || !onEditNote) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    onEditNote(editingId, trimmed);
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const canModifyNote = (note: InternalNote) => {
    if (!currentUserId) return true; // fallback: no restriction if props not provided
    return note.authorId === currentUserId || currentUserRole === "admin";
  };

  const hasActions = !!onEditNote || !!onDeleteNote;

  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Internal Notes
      </h4>

      {onAddNote && (
        <div className="mb-3 space-y-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-full"
          >
            Add Note
          </Button>
        </div>
      )}

      {sortedNotes.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No internal notes.
        </p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {sortedNotes.map((note) => {
            const author = resolveAuthor(note.authorId);
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className="group rounded-lg border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-2">
                  {author?.avatarUrl && (
                    <img
                      src={author.avatarUrl}
                      alt={author.name}
                      className="size-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs font-medium">
                    {author?.name ?? "Unknown"}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {formatRelativeTime(note.createdAt)}
                  </span>
                  {hasActions && !isEditing && canModifyNote(note) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-muted"
                        >
                          <MoreHorizontal className="size-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditNote && (
                          <DropdownMenuItem onClick={() => startEdit(note)}>
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDeleteNote && (
                          <DropdownMenuItem
                            onClick={() => onDeleteNote(note.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-1.5 space-y-1.5">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={saveEdit} disabled={!editValue.trim()} className="h-7 px-2">
                        <Check className="mr-1 size-3" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 px-2">
                        <X className="mr-1 size-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { InternalNote, User } from "@/types";

interface InternalNotesPanelProps {
  notes: InternalNote[];
  users: User[];
}

export function InternalNotesPanel({ notes, users }: InternalNotesPanelProps) {
  const resolveAuthor = (authorId: string): string => {
    const user = users.find((u) => u.id === authorId);
    return user?.name ?? "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No internal notes.
          </p>
        ) : (
          <div className="space-y-0">
            {notes.map((note, index) => (
              <div key={note.id}>
                {index > 0 && <hr className="my-3 border-border" />}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {resolveAuthor(note.authorId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cannedResponses } from "@/lib/canned-responses";
import { formatFileSize } from "@/lib/format";
import type { Attachment } from "@/types";

interface MessageComposerProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachments, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCannedResponse = (template: string) => {
    setValue(template);
    textareaRef.current?.focus();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `att-local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="border-t">
      {/* Canned response chips */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3 pb-1">
        <span className="mr-0.5 shrink-0 text-[11px] font-medium text-muted-foreground">Quick replies</span>
        <TooltipProvider delayDuration={300}>
          {cannedResponses.map((cr) => (
            <Tooltip key={cr.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleCannedResponse(cr.template)}
                  className="shrink-0 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {cr.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {cr.template.length > 80 ? `${cr.template.slice(0, 80)}...` : cr.template}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs"
            >
              <Paperclip className="size-3 text-muted-foreground" />
              <span className="max-w-[120px] truncate">{att.name}</span>
              <span className="text-muted-foreground">({formatFileSize(att.size)})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer row */}
      <div className="flex items-end gap-2 p-4 pt-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="max-h-32 min-h-9 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesChanged}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleFileSelect}
          className="shrink-0"
        >
          <Paperclip className="size-4" />
        </Button>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!value.trim() && attachments.length === 0}
          className="shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Copy, Check, LinkIcon, Send } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SharePaymentLinkPopoverProps {
  invoiceId: string;
  paymentUrl: string;
  clientName: string;
  clientEmail: string;
  onAction: () => void;
}

export function SharePaymentLinkPopover({
  paymentUrl,
  clientName,
  clientEmail,
  onAction,
}: SharePaymentLinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [emailTo, setEmailTo] = useState(clientEmail);
  const [emailSubject, setEmailSubject] = useState("Your payment link");
  const [emailBody, setEmailBody] = useState(
    `Hi ${clientName},\n\nPlease use the following link to complete your payment:\n${paymentUrl}\n\nThank you!`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    onAction();
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  };

  const handleSendEmail = () => {
    onAction();
    setOpen(false);
  };

  // Reset form state when popover opens
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setCopied(false);
      setEmailTo(clientEmail);
      setEmailSubject("Your payment link");
      setEmailBody(
        `Hi ${clientName},\n\nPlease use the following link to complete your payment:\n${paymentUrl}\n\nThank you!`
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <LinkIcon className="size-3" /> Share payment link
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center">
        <Tabs defaultValue="copy" className="gap-0">
          <TabsList className="w-full rounded-none border-b bg-muted/50 px-2">
            <TabsTrigger value="copy" className="flex-1 text-xs">
              <Copy className="size-3" />
              Copy Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1 text-xs">
              <Send className="size-3" />
              Send Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="copy" className="p-3">
            <div className="space-y-3">
              <Input
                readOnly
                value={paymentUrl}
                className="h-8 text-xs font-mono"
                onFocus={(e) => e.target.select()}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy to clipboard
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="p-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium">To</span>
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <span className="text-xs font-medium">Subject</span>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <span className="text-xs font-medium">Body</span>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  className="mt-1 text-xs"
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleSendEmail}>
                <Send className="size-3.5" />
                Send
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

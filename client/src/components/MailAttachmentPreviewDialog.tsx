import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import React from "react";

export type MailPreviewAttachment = { id: number; originalName: string; mimeType: string; sizeBytes?: number; url: string };

const imageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const textTypes = new Set(["text/plain", "text/csv", "text/markdown"]);

export function canPreviewMailAttachment(mimeType: string) {
  return imageTypes.has(mimeType) || textTypes.has(mimeType) || mimeType === "application/pdf";
}

export default function MailAttachmentPreviewDialog({ attachment, onClose }: { attachment: MailPreviewAttachment; onClose: () => void }) {
  const isImage = imageTypes.has(attachment.mimeType);
  const previewable = canPreviewMailAttachment(attachment.mimeType);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent dir="rtl" className="max-w-4xl">
      <DialogHeader><DialogTitle>معاينة مرفق البريد</DialogTitle><DialogDescription>{attachment.originalName}</DialogDescription></DialogHeader>
      <div className="grid min-h-[360px] place-items-center overflow-auto rounded-xl border border-[#e1e9e1] bg-[#f8fbf8] p-3">
        {isImage ? <img src={attachment.url} alt={`معاينة ${attachment.originalName}`} className="max-h-[58vh] max-w-full object-contain" /> : previewable ? <iframe title={`معاينة ${attachment.originalName}`} src={attachment.mimeType === "application/pdf" ? `${attachment.url}#view=FitH` : attachment.url} className="h-[58vh] w-full rounded-lg border-0 bg-white" /> : <div className="max-w-sm text-center"><FileText className="mx-auto h-12 w-12 text-[#899b8e]" /><p className="mt-4 text-sm font-black text-[#315448]">لا يدعم المتصفح معاينة هذا النوع مباشرة</p><p className="mt-2 text-xs leading-6 text-[#708178]">يمكنك فتح الملف الأصلي أو تنزيله من دون كشفه خارج بريد ركيزة.</p></div>}
      </div>
      <DialogFooter className="gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-[#d6e2d7] px-3 py-2 text-xs font-bold text-[#315f49]">إغلاق</button><a href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e6a40] px-3 py-2 text-xs font-black text-white"><ExternalLink className="h-3.5 w-3.5" />فتح الأصل</a><a href={attachment.url} download={attachment.originalName} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6e2d7] px-3 py-2 text-xs font-bold text-[#315f49]"><Download className="h-3.5 w-3.5" />تنزيل</a></DialogFooter>
    </DialogContent>
  </Dialog>;
}

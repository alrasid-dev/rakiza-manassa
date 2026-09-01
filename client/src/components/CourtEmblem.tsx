import React from "react";

/** شعار محكمة مرسوم لرَكيزة، وليس أيقونة ميزان عامة. */
export default function CourtEmblem({ className = "h-6 w-6", title = "شعار رَكيزة" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path fill="currentColor" d="M24 4c.8 0 1.5.5 1.7 1.2l1.6 5.3h7.2c1.3 0 2.1 1.4 1.5 2.6L33 20.3c2.3.8 4 3 4 5.6v1.2c0 .7-.6 1.3-1.3 1.3h-5.2v7.4h3.4c.7 0 1.3.6 1.3 1.3v1.4H12.8v-1.4c0-.7.6-1.3 1.3-1.3h3.4v-7.4h-5.2c-.7 0-1.3-.6-1.3-1.3V25.9c0-2.6 1.7-4.8 4-5.6l-3-7.2c-.6-1.2.2-2.6 1.5-2.6h7.2l1.6-5.3C22.5 4.5 23.2 4 24 4Zm-8.4 14.4 1.7-4.1h15.4l1.7 4.1c-1.2-.4-2.5-.6-3.8-.6h-11c-1.4 0-2.7.2-4 .6Zm4.5 7.4h11.8v7.4H20.1v-7.4Zm-4.8-2.6h3.4c.4-1.4 1.7-2.4 3.2-2.4h8.2c1.5 0 2.8 1 3.2 2.4h3.4c-.2-1.2-1.2-2.1-2.5-2.1H17.8c-1.3 0-2.3.9-2.5 2.1Z" />
      <path fill="currentColor" opacity="0.55" d="M10 40.2h28c.7 0 1.2.6 1.2 1.3v1.2c0 .4-.3.7-.7.7H9.5c-.4 0-.7-.3-.7-.7v-1.2c0-.7.5-1.3 1.2-1.3Z" />
    </svg>
  );
}

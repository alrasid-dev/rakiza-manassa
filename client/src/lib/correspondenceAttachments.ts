export const MAX_CORRESPONDENCE_ATTACHMENT_COUNT = 5;

export function canAddCorrespondenceAttachments(currentCount: number, incomingCount: number) {
  return currentCount >= 0 && incomingCount > 0 && currentCount + incomingCount <= MAX_CORRESPONDENCE_ATTACHMENT_COUNT;
}

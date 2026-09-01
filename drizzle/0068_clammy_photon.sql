ALTER TABLE `conversation_messages` ADD `replyToMessageId` int;--> statement-breakpoint
ALTER TABLE `conversation_messages` ADD `forwardedFromMessageId` int;--> statement-breakpoint
CREATE INDEX `conversation_messages_reply_idx` ON `conversation_messages` (`replyToMessageId`);--> statement-breakpoint
CREATE INDEX `conversation_messages_forwarded_idx` ON `conversation_messages` (`forwardedFromMessageId`);
ALTER TABLE `internal_conversations` ADD `pinnedMessageId` int;--> statement-breakpoint
ALTER TABLE `internal_conversations` ADD `pinnedByProfileId` int;--> statement-breakpoint
ALTER TABLE `internal_conversations` ADD `pinnedAt` timestamp;--> statement-breakpoint
CREATE INDEX `internal_conversations_pinned_message_idx` ON `internal_conversations` (`pinnedMessageId`);
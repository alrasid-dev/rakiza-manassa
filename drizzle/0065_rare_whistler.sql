CREATE TABLE `internal_mail_assistant_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceMessageId` int NOT NULL,
	`profileId` int NOT NULL,
	`mode` enum('draft','reply','forward') NOT NULL,
	`forwardProfileId` int,
	`status` enum('pending','processed','skipped','failed') NOT NULL DEFAULT 'pending',
	`generatedMessageId` int,
	`errorCode` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `internal_mail_assistant_actions_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_ai_action_source_profile_unique` UNIQUE(`sourceMessageId`,`profileId`)
);
--> statement-breakpoint
ALTER TABLE `internal_mail_messages` ADD `automationAction` enum('none','draft','reply','forward') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `signatureImageStorageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `signatureImageStorageUrl` varchar(600);--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `assistantMode` enum('off','draft','auto_reply','auto_forward') DEFAULT 'off' NOT NULL;--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `assistantForwardProfileId` int;--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `assistantSubjectContains` varchar(160);--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `assistantEnabledAt` timestamp;--> statement-breakpoint
ALTER TABLE `internal_mail_preferences` ADD `assistantUpdatedByUserId` int;--> statement-breakpoint
CREATE INDEX `internal_mail_ai_action_status_created_idx` ON `internal_mail_assistant_actions` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `internal_mail_ai_action_profile_idx` ON `internal_mail_assistant_actions` (`profileId`,`createdAt`);
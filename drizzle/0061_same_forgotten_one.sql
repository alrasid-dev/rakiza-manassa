CREATE TABLE `internal_mail_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`uploadedByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `internal_mail_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`profileId` int NOT NULL,
	`recipientType` enum('sender','to','cc','bcc') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`isStarred` boolean NOT NULL DEFAULT false,
	`category` varchar(80),
	`archivedAt` timestamp,
	`trashedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_entries_message_profile_type_unique` UNIQUE(`messageId`,`profileId`,`recipientType`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int,
	`parentMessageId` int,
	`senderProfileId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`importance` enum('normal','high') NOT NULL DEFAULT 'normal',
	`status` enum('draft','sent') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `internal_mail_attachments_message_idx` ON `internal_mail_attachments` (`messageId`);--> statement-breakpoint
CREATE INDEX `internal_mail_entries_profile_box_idx` ON `internal_mail_entries` (`profileId`,`trashedAt`,`archivedAt`,`isRead`);--> statement-breakpoint
CREATE INDEX `internal_mail_entries_message_idx` ON `internal_mail_entries` (`messageId`);--> statement-breakpoint
CREATE INDEX `internal_mail_messages_sender_status_idx` ON `internal_mail_messages` (`senderProfileId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `internal_mail_messages_thread_idx` ON `internal_mail_messages` (`threadId`,`sentAt`);
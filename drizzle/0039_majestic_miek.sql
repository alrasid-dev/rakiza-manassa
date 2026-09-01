CREATE TABLE `conversation_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`uploadedByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderProfileId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`profileId` int NOT NULL,
	`lastReadAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_participants_unique` UNIQUE(`conversationId`,`profileId`)
);
--> statement-breakpoint
CREATE TABLE `correspondence_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`ownerProfileId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `correspondence_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_export_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`requestedByUserId` int NOT NULL,
	`assignedArchiveProfileId` int,
	`status` enum('queued','processing','completed','failed','expired') NOT NULL DEFAULT 'queued',
	`storageKey` varchar(512),
	`storageUrl` varchar(600),
	`errorMessage` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`expiresAt` timestamp,
	CONSTRAINT `data_export_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `department_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`accountKey` varchar(120) NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `department_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `department_accounts_key_unique` UNIQUE(`accountKey`)
);
--> statement-breakpoint
CREATE TABLE `internal_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(255),
	`unitId` int,
	`createdByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `conversation_attachments_message_idx` ON `conversation_attachments` (`messageId`);--> statement-breakpoint
CREATE INDEX `conversation_messages_conversation_created_idx` ON `conversation_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `conversation_participants_profile_idx` ON `conversation_participants` (`profileId`,`lastReadAt`);--> statement-breakpoint
CREATE INDEX `correspondence_templates_owner_active_idx` ON `correspondence_templates` (`ownerProfileId`,`isActive`);--> statement-breakpoint
CREATE INDEX `correspondence_templates_unit_idx` ON `correspondence_templates` (`unitId`);--> statement-breakpoint
CREATE INDEX `data_export_jobs_unit_status_idx` ON `data_export_jobs` (`unitId`,`status`);--> statement-breakpoint
CREATE INDEX `data_export_jobs_requested_idx` ON `data_export_jobs` (`requestedByUserId`,`requestedAt`);--> statement-breakpoint
CREATE INDEX `department_accounts_unit_active_idx` ON `department_accounts` (`unitId`,`isActive`);--> statement-breakpoint
CREATE INDEX `internal_conversations_created_by_idx` ON `internal_conversations` (`createdByProfileId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `internal_conversations_unit_idx` ON `internal_conversations` (`unitId`,`updatedAt`);
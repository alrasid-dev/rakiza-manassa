CREATE TABLE `task_update_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskUpdateId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`storageUrl` varchar(1000) NOT NULL,
	`uploadedByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_update_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_update_mentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskUpdateId` int NOT NULL,
	`mentionedProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_update_mentions_id` PRIMARY KEY(`id`),
	CONSTRAINT `task_update_mentions_unique` UNIQUE(`taskUpdateId`,`mentionedProfileId`)
);
--> statement-breakpoint
CREATE INDEX `task_update_attachments_update_idx` ON `task_update_attachments` (`taskUpdateId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `task_update_mentions_profile_idx` ON `task_update_mentions` (`mentionedProfileId`,`createdAt`);
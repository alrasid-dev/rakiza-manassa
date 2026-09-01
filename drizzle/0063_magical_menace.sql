CREATE TABLE `internal_mail_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`contactProfileId` int NOT NULL,
	`isFavorite` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_contacts_profile_contact_unique` UNIQUE(`profileId`,`contactProfileId`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`signature` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_preferences_profile_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`subjectContains` varchar(160),
	`senderContains` varchar(160),
	`action` enum('star','archive','category') NOT NULL,
	`category` varchar(80),
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_schedule_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobKey` varchar(80) NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_schedule_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_schedule_jobs_key_unique` UNIQUE(`jobKey`)
);
--> statement-breakpoint
ALTER TABLE `internal_mail_messages` MODIFY COLUMN `status` enum('draft','scheduled','sent') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `internal_mail_messages` ADD `scheduledAt` timestamp;--> statement-breakpoint
CREATE INDEX `internal_mail_contacts_profile_favorite_idx` ON `internal_mail_contacts` (`profileId`,`isFavorite`);--> statement-breakpoint
CREATE INDEX `internal_mail_rules_profile_enabled_idx` ON `internal_mail_rules` (`profileId`,`isEnabled`);--> statement-breakpoint
CREATE INDEX `internal_mail_schedule_jobs_task_uid_idx` ON `internal_mail_schedule_jobs` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `internal_mail_messages_scheduled_idx` ON `internal_mail_messages` (`status`,`scheduledAt`);
CREATE TABLE `document_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentType` enum('letter','daily_attendance','form','task_schedule','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`storageKey` varchar(512),
	`storageUrl` varchar(600),
	`sourceReference` varchar(240),
	`summary` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int,
	`category` enum('trainee_due_soon','task_due','delay_alert','access_request') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainee_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`trainingJudge` varchar(240),
	`courtTrack` varchar(160),
	`sourceStartDate` varchar(80),
	`expectedStartAt` timestamp,
	`expectedEndAt` timestamp,
	`durationDays` int NOT NULL DEFAULT 60,
	`renewalCount` int NOT NULL DEFAULT 0,
	`status` enum('active','on_leave','completed','needs_date_confirmation') NOT NULL DEFAULT 'needs_date_confirmation',
	`sourceNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainee_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `trainee_assignments_profile_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE INDEX `document_records_type_created_idx` ON `document_records` (`documentType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_profile_read_idx` ON `notifications` (`profileId`,`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_category_sent_idx` ON `notifications` (`category`,`sentAt`);--> statement-breakpoint
CREATE INDEX `trainee_assignments_expected_end_idx` ON `trainee_assignments` (`expectedEndAt`);--> statement-breakpoint
CREATE INDEX `trainee_assignments_status_idx` ON `trainee_assignments` (`status`);
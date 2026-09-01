CREATE TABLE `internal_mail_recurring_schedule_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`sentMessageId` int,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`failureReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_recurring_schedule_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_recurring_runs_schedule_due_unique` UNIQUE(`scheduleId`,`scheduledFor`),
	CONSTRAINT `internal_mail_recurring_runs_message_unique` UNIQUE(`sentMessageId`)
);
--> statement-breakpoint
CREATE TABLE `internal_mail_recurring_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceMessageId` int NOT NULL,
	`senderProfileId` int NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`intervalCount` int NOT NULL DEFAULT 1,
	`weekdays` varchar(20),
	`monthDay` int,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`nextRunAt` timestamp NOT NULL,
	`lastRunAt` timestamp,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_recurring_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_mail_recurring_source_unique` UNIQUE(`sourceMessageId`)
);
--> statement-breakpoint
ALTER TABLE `internal_mail_messages` ADD `recurringScheduleRunId` int;--> statement-breakpoint
ALTER TABLE `internal_mail_messages` ADD CONSTRAINT `internal_mail_messages_recurring_run_unique` UNIQUE(`recurringScheduleRunId`);--> statement-breakpoint
CREATE INDEX `internal_mail_recurring_runs_status_idx` ON `internal_mail_recurring_schedule_runs` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `internal_mail_recurring_due_idx` ON `internal_mail_recurring_schedules` (`status`,`nextRunAt`);--> statement-breakpoint
CREATE INDEX `internal_mail_recurring_sender_idx` ON `internal_mail_recurring_schedules` (`senderProfileId`,`updatedAt`);
CREATE TABLE `scheduled_job_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobType` enum('trainee_due_soon') NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`cronExpression` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_job_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_job_configs_type_unique` UNIQUE(`jobType`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD `dedupeKey` varchar(255);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_dedupe_key_unique` UNIQUE(`dedupeKey`);--> statement-breakpoint
CREATE INDEX `scheduled_job_configs_task_uid_idx` ON `scheduled_job_configs` (`scheduleCronTaskUid`);
CREATE TABLE `data_source_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('trainee_excel') NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`lastFingerprint` varchar(128),
	`lastScannedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_source_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_source_configs_type_unique` UNIQUE(`sourceType`)
);
--> statement-breakpoint
ALTER TABLE `scheduled_job_configs` MODIFY COLUMN `jobType` enum('trainee_due_soon','daily_task_reminder','task_escalation','leave_status_refresh','trainee_excel_sync') NOT NULL;
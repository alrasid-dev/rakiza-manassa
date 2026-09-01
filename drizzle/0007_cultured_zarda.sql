CREATE TABLE `attendance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`recordDate` timestamp NOT NULL,
	`checkInAt` timestamp,
	`checkOutAt` timestamp,
	`status` enum('present','late','absent','excused','on_leave') NOT NULL,
	`note` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_profile_date_unique` UNIQUE(`profileId`,`recordDate`)
);
--> statement-breakpoint
CREATE TABLE `excel_change_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importBatchId` int NOT NULL,
	`sourceKey` varchar(255) NOT NULL,
	`fingerprint` varchar(128) NOT NULL,
	`changeType` enum('added','modified') NOT NULL,
	`title` text NOT NULL,
	`relatedProfileId` int,
	`linkedTaskId` int,
	`rawSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `excel_change_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `excel_change_events_source_fingerprint_unique` UNIQUE(`sourceKey`,`fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`requestType` enum('leave','permission') NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL,
	`substituteProfileId` int,
	`handoverConfirmed` boolean NOT NULL DEFAULT false,
	`status` enum('pending','approved','rejected','active','completed') NOT NULL DEFAULT 'pending',
	`note` text,
	`requestedByUserId` int NOT NULL,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`profileId` int,
	`authorUserId` int,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `attendance_date_status_idx` ON `attendance_records` (`recordDate`,`status`);--> statement-breakpoint
CREATE INDEX `excel_change_events_profile_idx` ON `excel_change_events` (`relatedProfileId`);--> statement-breakpoint
CREATE INDEX `leave_requests_profile_status_idx` ON `leave_requests` (`profileId`,`status`);--> statement-breakpoint
CREATE INDEX `leave_requests_period_idx` ON `leave_requests` (`startAt`,`endAt`);--> statement-breakpoint
CREATE INDEX `task_comments_task_created_idx` ON `task_comments` (`taskId`,`createdAt`);
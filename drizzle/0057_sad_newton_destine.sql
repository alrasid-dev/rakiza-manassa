CREATE TABLE `task_exception_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`kind` enum('reassignment','obstacle') NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`requesterProfileId` int NOT NULL,
	`managerProfileId` int NOT NULL,
	`reason` text NOT NULL,
	`proposedAssigneeProfileId` int,
	`approvedAssigneeProfileId` int,
	`deductionPoints` int NOT NULL DEFAULT 0,
	`managerNote` text,
	`decidedByUserId` int,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_exception_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `task_updates` MODIFY COLUMN `updateType` enum('acknowledged','progress','submitted','returned','approved','overdue_marked','reassignment_requested','obstacle_reported','exception_decided') NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `startedAt` timestamp;--> statement-breakpoint
CREATE INDEX `task_exception_requests_task_status_idx` ON `task_exception_requests` (`taskId`,`status`);--> statement-breakpoint
CREATE INDEX `task_exception_requests_manager_status_idx` ON `task_exception_requests` (`managerProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `task_exception_requests_requester_status_idx` ON `task_exception_requests` (`requesterProfileId`,`status`);
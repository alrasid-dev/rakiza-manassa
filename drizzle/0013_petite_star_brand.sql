CREATE TABLE `support_ticket_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`uploadedByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`authorProfileId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`body` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterProfileId` int NOT NULL,
	`requesterUnitId` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('normal','high','critical') NOT NULL DEFAULT 'normal',
	`status` enum('open','in_progress','resolved','closed','escalated_to_manager','escalated_to_president') NOT NULL DEFAULT 'open',
	`assignedSupportProfileId` int,
	`supportManagerProfileId` int,
	`linkedTaskId` int,
	`dueAt` timestamp NOT NULL,
	`managerDueAt` timestamp,
	`resolvedAt` timestamp,
	`resolutionNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `court_role_assignments` MODIFY COLUMN `role` enum('court_president','assistant_president','trainee_affairs_manager','technical_support_manager','technical_support_agent','administrative_staff','judicial_trainee','judge') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `category` enum('trainee_due_soon','task_due','delay_alert','access_request','support_ticket') NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_job_configs` MODIFY COLUMN `jobType` enum('trainee_due_soon','daily_task_reminder','task_escalation','leave_status_refresh','trainee_excel_sync','support_ticket_escalation') NOT NULL;--> statement-breakpoint
CREATE INDEX `support_ticket_attachments_ticket_idx` ON `support_ticket_attachments` (`ticketId`);--> statement-breakpoint
CREATE INDEX `support_ticket_comments_ticket_created_idx` ON `support_ticket_comments` (`ticketId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `support_tickets_requester_status_idx` ON `support_tickets` (`requesterProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_assignee_status_idx` ON `support_tickets` (`assignedSupportProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_due_status_idx` ON `support_tickets` (`dueAt`,`status`);
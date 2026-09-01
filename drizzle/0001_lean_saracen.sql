CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`visibility` enum('all','unit_only','roles_only') NOT NULL DEFAULT 'all',
	`publishedAt` timestamp,
	`expiresAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('task','delay','decision','disciplinary_action','score_adjustment') NOT NULL,
	`entityId` int NOT NULL,
	`requestedByUserId` int NOT NULL,
	`currentRole` enum('trainee_affairs_manager','assistant_president','court_president') NOT NULL,
	`status` enum('pending','returned','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`requestNote` text,
	`decisionNote` text,
	`decidedByUserId` int,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `court_role_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('court_president','assistant_president','trainee_affairs_manager','administrative_staff','judicial_trainee','judge') NOT NULL,
	`unitId` int,
	`delegatedByUserId` int,
	`startsAt` timestamp NOT NULL DEFAULT (now()),
	`endsAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `court_role_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delay_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`relatedProfileId` int,
	`taskId` int,
	`title` text NOT NULL,
	`category` varchar(160) NOT NULL,
	`referenceNumber` varchar(120),
	`startedAt` timestamp,
	`status` enum('under_follow_up','overdue','resolved','archived') NOT NULL DEFAULT 'under_follow_up',
	`ownerProfileId` int,
	`actionTaken` text,
	`nextFollowUpAt` timestamp,
	`sourceReference` varchar(240),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delay_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(60) NOT NULL,
	`parentId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_units_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `person_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`unitId` int,
	`personType` enum('administrative','trainee','judge') NOT NULL,
	`fullName` varchar(240) NOT NULL,
	`email` varchar(320),
	`employeeNumber` varchar(80),
	`jobTitle` varchar(180),
	`judicialFormation` varchar(180),
	`attendanceMode` enum('in_person','remote','mixed'),
	`status` enum('active','on_leave','inactive','pending_review') NOT NULL DEFAULT 'pending_review',
	`sourceReference` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `person_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`taskId` int,
	`delayRecordId` int,
	`points` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`title` text NOT NULL,
	`frequency` enum('daily','weekly','monthly','quarterly','custom') NOT NULL,
	`workdayOnly` boolean NOT NULL DEFAULT true,
	`dueHourLocal` int NOT NULL DEFAULT 13,
	`requiredApprovals` int NOT NULL DEFAULT 1,
	`defaultAssigneeProfileId` int,
	`formReference` varchar(240),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`updateType` enum('acknowledged','progress','submitted','returned','approved','overdue_marked') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int,
	`unitId` int,
	`title` text NOT NULL,
	`status` enum('new','in_progress','under_review','completed','overdue','cancelled') NOT NULL DEFAULT 'new',
	`priority` enum('normal','high','critical') NOT NULL DEFAULT 'normal',
	`assigneeProfileId` int,
	`assignedByUserId` int NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`dueAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`completionNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `announcements_published_idx` ON `announcements` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `approval_requests_current_status_idx` ON `approval_requests` (`currentRole`,`status`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actorUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `court_roles_user_active_idx` ON `court_role_assignments` (`userId`,`isActive`);--> statement-breakpoint
CREATE INDEX `court_roles_unit_idx` ON `court_role_assignments` (`unitId`);--> statement-breakpoint
CREATE INDEX `delay_records_status_idx` ON `delay_records` (`status`);--> statement-breakpoint
CREATE INDEX `delay_records_owner_idx` ON `delay_records` (`ownerProfileId`);--> statement-breakpoint
CREATE INDEX `person_profiles_unit_idx` ON `person_profiles` (`unitId`);--> statement-breakpoint
CREATE INDEX `person_profiles_type_idx` ON `person_profiles` (`personType`);--> statement-breakpoint
CREATE INDEX `person_profiles_user_idx` ON `person_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `score_events_profile_created_idx` ON `score_events` (`profileId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `task_templates_unit_active_idx` ON `task_templates` (`unitId`,`isActive`);--> statement-breakpoint
CREATE INDEX `task_updates_task_created_idx` ON `task_updates` (`taskId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `tasks_assignee_status_idx` ON `tasks` (`assigneeProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `tasks_due_idx` ON `tasks` (`dueAt`);--> statement-breakpoint
CREATE INDEX `tasks_unit_idx` ON `tasks` (`unitId`);
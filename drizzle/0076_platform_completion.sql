ALTER TABLE `users` ADD `phone` varchar(40);--> statement-breakpoint
ALTER TABLE `registration_requests` ADD `phone` varchar(40);--> statement-breakpoint
CREATE TABLE `permission_delegations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grantorUserId` int NOT NULL,
	`delegateUserId` int NOT NULL,
	`role` enum('court_president','assistant_president','court_secretary','human_resources_manager','department_manager','performance_monitor','trainee_affairs_manager','technical_support_manager','technical_support_agent','administrative_staff','judicial_trainee','judge') NOT NULL,
	`unitId` int,
	`title` varchar(240) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`status` enum('active','ended','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permission_delegations_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `permission_delegations_delegate_status_idx` ON `permission_delegations` (`delegateUserId`,`status`);--> statement-breakpoint
CREATE INDEX `permission_delegations_dates_idx` ON `permission_delegations` (`startsAt`,`endsAt`);--> statement-breakpoint
CREATE TABLE `user_work_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workMode` enum('employee','manager') NOT NULL DEFAULT 'manager',
	`notificationsEnabled` boolean NOT NULL DEFAULT true,
	`dndUntil` timestamp,
	`seenHelpKeys` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_work_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_work_preferences_user_unique` UNIQUE(`userId`)
);--> statement-breakpoint
CREATE INDEX `users_phone_idx` ON `users` (`phone`);

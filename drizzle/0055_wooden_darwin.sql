CREATE TABLE `department_account_delegations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentAccountId` int NOT NULL,
	`delegateUserId` int NOT NULL,
	`delegateProfileId` int,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`status` enum('planned','active','ended','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `department_account_delegations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `actorProfileId` int;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `actingDepartmentAccountId` int;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `departmentDelegationId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `activeDepartmentAccountId` int;--> statement-breakpoint
CREATE INDEX `department_account_delegations_account_status_idx` ON `department_account_delegations` (`departmentAccountId`,`status`);--> statement-breakpoint
CREATE INDEX `department_account_delegations_delegate_status_idx` ON `department_account_delegations` (`delegateUserId`,`status`);--> statement-breakpoint
CREATE INDEX `department_account_delegations_window_idx` ON `department_account_delegations` (`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `audit_logs_department_account_created_idx` ON `audit_logs` (`actingDepartmentAccountId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `users_active_department_account_idx` ON `users` (`activeDepartmentAccountId`);
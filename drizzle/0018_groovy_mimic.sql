CREATE TABLE `profile_delegations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`delegateProfileId` int NOT NULL,
	`coveredProfileId` int,
	`unitId` int,
	`assignmentType` enum('acting','temporary_duty','formation_assignment') NOT NULL DEFAULT 'acting',
	`title` varchar(240) NOT NULL,
	`sourceReference` varchar(240),
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`status` enum('planned','active','ended','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_delegations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `profile_delegations_delegate_idx` ON `profile_delegations` (`delegateProfileId`);--> statement-breakpoint
CREATE INDEX `profile_delegations_covered_idx` ON `profile_delegations` (`coveredProfileId`);--> statement-breakpoint
CREATE INDEX `profile_delegations_unit_idx` ON `profile_delegations` (`unitId`);--> statement-breakpoint
CREATE INDEX `profile_delegations_status_idx` ON `profile_delegations` (`status`);--> statement-breakpoint
CREATE INDEX `profile_delegations_dates_idx` ON `profile_delegations` (`startsAt`,`endsAt`);
CREATE TABLE `work_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(60) NOT NULL,
	`startMinutes` int NOT NULL,
	`endMinutes` int NOT NULL,
	`workingDays` varchar(40) NOT NULL DEFAULT '0,1,2,3,4',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_shifts_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_shifts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `person_profiles` ADD `shiftId` int;--> statement-breakpoint
CREATE INDEX `work_shifts_active_idx` ON `work_shifts` (`isActive`);
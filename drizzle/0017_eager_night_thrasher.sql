CREATE TABLE `meeting_attendees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingId` int NOT NULL,
	`profileId` int NOT NULL,
	`attendanceStatus` enum('invited','attended','absent','excused') NOT NULL DEFAULT 'invited',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meeting_attendees_id` PRIMARY KEY(`id`),
	CONSTRAINT `meeting_attendees_unique` UNIQUE(`meetingId`,`profileId`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`agenda` text,
	`scheduledAt` timestamp NOT NULL,
	`location` varchar(255),
	`unitId` int,
	`status` enum('scheduled','held','cancelled') NOT NULL DEFAULT 'scheduled',
	`minutes` text,
	`recommendations` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `meeting_attendees_profile_idx` ON `meeting_attendees` (`profileId`,`attendanceStatus`);--> statement-breakpoint
CREATE INDEX `meetings_unit_scheduled_idx` ON `meetings` (`unitId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `meetings_status_scheduled_idx` ON `meetings` (`status`,`scheduledAt`);
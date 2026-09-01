CREATE TABLE `administrative_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`managerProfileId` int NOT NULL,
	`sequenceOrder` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `administrative_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `administrative_levels_sequence_unique` UNIQUE(`sequenceOrder`)
);
--> statement-breakpoint
CREATE TABLE `correspondence_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`correspondenceId` int NOT NULL,
	`fromLevelId` int,
	`toLevelId` int,
	`actorUserId` int NOT NULL,
	`action` enum('created','forwarded','approved','returned','rejected','commented') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `correspondence_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `correspondences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`correspondenceType` enum('request','letter') NOT NULL,
	`senderProfileId` int NOT NULL,
	`recipientProfileId` int,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`currentLevelId` int,
	`linkedTaskId` int,
	`status` enum('pending','in_review','approved','returned','rejected','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `correspondences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `administrative_levels_manager_idx` ON `administrative_levels` (`managerProfileId`);--> statement-breakpoint
CREATE INDEX `correspondence_actions_correspondence_created_idx` ON `correspondence_actions` (`correspondenceId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `correspondences_sender_status_idx` ON `correspondences` (`senderProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `correspondences_level_status_idx` ON `correspondences` (`currentLevelId`,`status`);
CREATE TABLE `decision_reads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_reads_id` PRIMARY KEY(`id`),
	CONSTRAINT `decision_reads_unique` UNIQUE(`decisionId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `decisions_circulars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('decision','circular') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`unitId` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedByUserId` int,
	`publishedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decisions_circulars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `decision_reads_user_idx` ON `decision_reads` (`userId`,`readAt`);--> statement-breakpoint
CREATE INDEX `decisions_circulars_status_published_idx` ON `decisions_circulars` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `decisions_circulars_unit_idx` ON `decisions_circulars` (`unitId`);
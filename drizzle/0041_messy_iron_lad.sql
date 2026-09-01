ALTER TABLE `tasks` ADD `recurrence` enum('none','daily','weekly','monthly','custom') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurrenceEndAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `watcherProfileId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `isConfidential` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `confidentialityExpiresAt` timestamp;--> statement-breakpoint
CREATE INDEX `tasks_watcher_idx` ON `tasks` (`watcherProfileId`);--> statement-breakpoint
CREATE INDEX `tasks_confidential_idx` ON `tasks` (`isConfidential`,`confidentialityExpiresAt`);
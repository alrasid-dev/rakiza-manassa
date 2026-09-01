ALTER TABLE `tasks` ADD `archivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `archivedByUserId` int;--> statement-breakpoint
CREATE INDEX `tasks_archived_idx` ON `tasks` (`archivedAt`);
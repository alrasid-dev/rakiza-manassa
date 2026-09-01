ALTER TABLE `platform_modules` MODIFY COLUMN `audience` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `backupEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `users` ADD `emailNotificationPreference` enum('work','backup','both') DEFAULT 'work' NOT NULL;
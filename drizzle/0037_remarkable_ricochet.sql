ALTER TABLE `access_grants` ADD `notificationEmail` varchar(320) NULL;--> statement-breakpoint
UPDATE `access_grants` SET `notificationEmail` = `officialEmail` WHERE `notificationEmail` IS NULL;--> statement-breakpoint
ALTER TABLE `access_grants` MODIFY `notificationEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `registration_requests` ADD `notificationEmail` varchar(320) NULL;--> statement-breakpoint
UPDATE `registration_requests` SET `notificationEmail` = `officialEmail` WHERE `notificationEmail` IS NULL;--> statement-breakpoint
ALTER TABLE `registration_requests` MODIFY `notificationEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `backupEmailVerifiedAt` timestamp NULL;--> statement-breakpoint

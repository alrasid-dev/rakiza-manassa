ALTER TABLE `department_accounts` MODIFY COLUMN `isActive` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `department_accounts` ADD `loginEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `department_accounts` ADD `notificationEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `department_accounts` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `department_accounts` ADD `profileId` int;--> statement-breakpoint
ALTER TABLE `department_accounts` ADD CONSTRAINT `department_accounts_login_email_unique` UNIQUE(`loginEmail`);--> statement-breakpoint
CREATE INDEX `department_accounts_user_idx` ON `department_accounts` (`userId`);
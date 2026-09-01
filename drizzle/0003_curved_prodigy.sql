CREATE TABLE `access_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`registrationRequestId` int,
	`fullName` varchar(240) NOT NULL,
	`officialEmail` varchar(320) NOT NULL,
	`permission` enum('full_control','edit','view') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`grantedByUserId` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `access_grants_id` PRIMARY KEY(`id`),
	CONSTRAINT `access_grants_email_unique` UNIQUE(`officialEmail`)
);
--> statement-breakpoint
CREATE TABLE `registration_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(240) NOT NULL,
	`officialEmail` varchar(320) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedByUserId` int,
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registration_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `registration_requests_email_unique` UNIQUE(`officialEmail`)
);
--> statement-breakpoint
CREATE INDEX `access_grants_active_permission_idx` ON `access_grants` (`isActive`,`permission`);--> statement-breakpoint
CREATE INDEX `registration_requests_status_created_idx` ON `registration_requests` (`status`,`createdAt`);
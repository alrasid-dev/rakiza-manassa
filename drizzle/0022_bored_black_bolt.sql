CREATE TABLE `platform_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleKey` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`path` varchar(240) NOT NULL,
	`iconKey` varchar(80) NOT NULL DEFAULT 'LayoutDashboard',
	`moduleType` enum('navigation','software') NOT NULL DEFAULT 'navigation',
	`audience` text NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_modules_key_unique` UNIQUE(`moduleKey`)
);
--> statement-breakpoint
CREATE INDEX `platform_modules_enabled_order_idx` ON `platform_modules` (`isEnabled`,`sortOrder`);
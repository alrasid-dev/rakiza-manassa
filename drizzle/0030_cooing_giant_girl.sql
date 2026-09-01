CREATE TABLE `asset_custodies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` int NOT NULL,
	`profileId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`returnedAt` timestamp,
	`status` enum('assigned','returned','pending_clearance') NOT NULL DEFAULT 'assigned',
	`returnCondition` varchar(255),
	`notes` text,
	`assignedByUserId` int NOT NULL,
	`returnedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asset_custodies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_custody_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` int NOT NULL,
	`custodyId` int,
	`action` enum('created','assigned','returned','marked_lost','updated') NOT NULL,
	`actorUserId` int NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_custody_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `court_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetNumber` varchar(100) NOT NULL,
	`assetType` enum('computer','phone','screen','printer','seal','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`serialNumber` varchar(160),
	`unitId` int,
	`status` enum('available','assigned','returned','maintenance','lost') NOT NULL DEFAULT 'available',
	`notes` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `court_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `court_assets_number_unique` UNIQUE(`assetNumber`)
);
--> statement-breakpoint
CREATE INDEX `asset_custodies_asset_status_idx` ON `asset_custodies` (`assetId`,`status`);--> statement-breakpoint
CREATE INDEX `asset_custodies_profile_status_idx` ON `asset_custodies` (`profileId`,`status`);--> statement-breakpoint
CREATE INDEX `asset_custody_audit_asset_created_idx` ON `asset_custody_audit` (`assetId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `court_assets_status_idx` ON `court_assets` (`status`);--> statement-breakpoint
CREATE INDEX `court_assets_unit_idx` ON `court_assets` (`unitId`);
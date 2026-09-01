CREATE TABLE `import_batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('manual_upload','teams_sync') NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`status` enum('validated','requires_review','rejected','imported') NOT NULL DEFAULT 'requires_review',
	`summary` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	CONSTRAINT `import_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `import_batches_status_created_idx` ON `import_batches` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `import_batches_source_idx` ON `import_batches` (`source`);
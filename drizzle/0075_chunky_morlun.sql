CREATE TABLE `correspondence_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`correspondenceId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`storageUrl` varchar(1000) NOT NULL,
	`uploadedByProfileId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `correspondence_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `correspondence_attachments_correspondence_created_idx` ON `correspondence_attachments` (`correspondenceId`,`createdAt`);
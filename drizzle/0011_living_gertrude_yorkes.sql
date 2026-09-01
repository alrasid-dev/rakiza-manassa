CREATE TABLE `correspondence_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`correspondenceId` int NOT NULL,
	`profileId` int NOT NULL,
	`recipientType` enum('trainee_copy','manager_copy','direct_recipient') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `correspondence_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `correspondence_recipients_unique` UNIQUE(`correspondenceId`,`profileId`,`recipientType`)
);
--> statement-breakpoint
CREATE INDEX `correspondence_recipients_profile_idx` ON `correspondence_recipients` (`profileId`,`isRead`);
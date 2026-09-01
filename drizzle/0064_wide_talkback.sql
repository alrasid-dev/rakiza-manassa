CREATE TABLE `internal_mail_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`bodyHtml` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_mail_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `internal_mail_templates_profile_updated_idx` ON `internal_mail_templates` (`profileId`,`updatedAt`);
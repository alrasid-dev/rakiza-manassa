CREATE TABLE `fcm_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`token` varchar(4096) NOT NULL,
	`platform` varchar(32) NOT NULL DEFAULT 'web',
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fcm_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `fcm_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE INDEX `fcm_tokens_profile_idx` ON `fcm_tokens` (`profileId`);
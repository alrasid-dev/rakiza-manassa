CREATE TABLE `webauthn_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`challenge` varchar(256) NOT NULL,
	`flow` enum('registration','authentication') NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webauthn_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webauthn_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`credentialId` varchar(512) NOT NULL,
	`publicKey` text NOT NULL,
	`counter` int NOT NULL DEFAULT 0,
	`transports` text,
	`deviceType` varchar(80),
	`backedUp` boolean NOT NULL DEFAULT false,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webauthn_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `webauthn_credentials_credential_unique` UNIQUE(`credentialId`)
);
--> statement-breakpoint
DROP INDEX `otp_challenges_email_created_idx` ON `otp_challenges`;--> statement-breakpoint
DROP INDEX `otp_challenges_expires_idx` ON `otp_challenges`;--> statement-breakpoint
ALTER TABLE `otp_challenges` CHANGE COLUMN `officialEmail` `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `otp_challenges` CHANGE COLUMN `codeHash` `codeDigest` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `otp_challenges` ADD `requestIpDigest` varchar(128);--> statement-breakpoint
CREATE INDEX `webauthn_challenges_email_flow_idx` ON `webauthn_challenges` (`email`,`flow`);--> statement-breakpoint
CREATE INDEX `webauthn_challenges_expiry_idx` ON `webauthn_challenges` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `webauthn_credentials_user_idx` ON `webauthn_credentials` (`userId`);--> statement-breakpoint
CREATE INDEX `otp_challenges_email_idx` ON `otp_challenges` (`email`);--> statement-breakpoint
CREATE INDEX `otp_challenges_expiry_idx` ON `otp_challenges` (`expiresAt`);
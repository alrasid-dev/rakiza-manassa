CREATE TABLE `auth_activation_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenDigest` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_activation_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_activation_tokens_digest_unique` UNIQUE(`tokenDigest`)
);
--> statement-breakpoint
CREATE INDEX `auth_activation_tokens_user_idx` ON `auth_activation_tokens` (`userId`);--> statement-breakpoint
CREATE INDEX `auth_activation_tokens_expiry_idx` ON `auth_activation_tokens` (`expiresAt`);
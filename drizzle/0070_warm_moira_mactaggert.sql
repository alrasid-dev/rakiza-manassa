CREATE TABLE `conversation_message_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`profileId` int NOT NULL,
	`reaction` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_message_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_message_reactions_unique` UNIQUE(`messageId`,`profileId`,`reaction`)
);
--> statement-breakpoint
CREATE INDEX `conversation_message_reactions_message_idx` ON `conversation_message_reactions` (`messageId`,`createdAt`);
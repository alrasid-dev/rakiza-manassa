ALTER TABLE `internal_conversations` ADD `conversationType` enum('direct','department','custom','general','task') DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `internal_conversations` ADD `taskId` int;--> statement-breakpoint
CREATE INDEX `internal_conversations_task_idx` ON `internal_conversations` (`taskId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `internal_conversations_type_idx` ON `internal_conversations` (`conversationType`,`updatedAt`);
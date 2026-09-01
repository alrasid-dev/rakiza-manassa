ALTER TABLE `document_records` MODIFY COLUMN `documentType` enum('letter','daily_attendance','form','task_schedule','report','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `document_records` ADD `originalName` varchar(255);--> statement-breakpoint
ALTER TABLE `document_records` ADD `mimeType` varchar(120);--> statement-breakpoint
ALTER TABLE `document_records` ADD `profileId` int;--> statement-breakpoint
ALTER TABLE `document_records` ADD `unitId` int;--> statement-breakpoint
ALTER TABLE `document_records` ADD `linkedTaskId` int;--> statement-breakpoint
ALTER TABLE `document_records` ADD `reviewStatus` enum('submitted','accepted','rejected') DEFAULT 'submitted' NOT NULL;--> statement-breakpoint
CREATE INDEX `document_records_unit_created_idx` ON `document_records` (`unitId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `document_records_profile_created_idx` ON `document_records` (`profileId`,`createdAt`);
ALTER TABLE `registration_requests` ADD `privacyNoticeVersion` varchar(40) DEFAULT '2026-08-v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `registration_requests` ADD `privacyAcknowledgedAt` timestamp NULL;--> statement-breakpoint
UPDATE `registration_requests` SET `privacyAcknowledgedAt` = `createdAt` WHERE `privacyAcknowledgedAt` IS NULL;--> statement-breakpoint
ALTER TABLE `registration_requests` MODIFY `privacyAcknowledgedAt` timestamp NOT NULL;

ALTER TABLE `person_profiles` ADD `activityState` enum('active','chatting','inactive') DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE `person_profiles` ADD `lastActiveAt` timestamp;
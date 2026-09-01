ALTER TABLE `person_profiles` ADD `directManagerProfileId` int;--> statement-breakpoint
CREATE INDEX `person_profiles_manager_idx` ON `person_profiles` (`directManagerProfileId`);
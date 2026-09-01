ALTER TABLE `work_shifts` ADD `fingerprintOpenMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `lateStartMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `morningCompensationDeadlineMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `actualEndMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `eveningCompensationDeadlineMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `fingerprintCloseMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `work_shifts` ADD `isDefault` boolean DEFAULT false NOT NULL;
CREATE TABLE `performance_report_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`analysisStatus` enum('readable','partial','unreadable','not_attempted') NOT NULL DEFAULT 'not_attempted',
	`analysisSummary` text,
	`findingsJson` text,
	`extractedCompletedCount` int,
	`extractedIssueCount` int,
	`periodDays` int NOT NULL,
	`normalizedDailyRateHundredths` int,
	`confidence` int,
	`suggestedPoints` int,
	`managerDecision` enum('pending','accepted','returned','rejected') NOT NULL DEFAULT 'pending',
	`managerPoints` int,
	`managerNote` text,
	`analyzedAt` timestamp,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_report_evaluations_id` PRIMARY KEY(`id`),
	CONSTRAINT `performance_report_evaluations_document_unique` UNIQUE(`documentId`)
);
--> statement-breakpoint
CREATE INDEX `performance_report_evaluations_decision_idx` ON `performance_report_evaluations` (`managerDecision`,`createdAt`);
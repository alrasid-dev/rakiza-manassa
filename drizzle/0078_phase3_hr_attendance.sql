ALTER TABLE `notifications` MODIFY COLUMN `category` enum('trainee_due_soon','task_due','delay_alert','access_request','support_ticket','attendance_confirmation','security_alert','performance_recommendation','chat_message','report_review','correspondence_update','hr_notice') NOT NULL;--> statement-breakpoint
ALTER TABLE `leave_requests` ADD `requiresSecretaryReview` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD `earlyLeaveDeficitMinutes` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `scheduled_job_configs` ADD `attendanceTargetUnitIds` varchar(500) NOT NULL DEFAULT '';--> statement-breakpoint
INSERT INTO `work_shifts` (`name`,`code`,`startMinutes`,`endMinutes`,`fingerprintOpenMinutes`,`lateStartMinutes`,`morningCompensationDeadlineMinutes`,`actualEndMinutes`,`eveningCompensationDeadlineMinutes`,`fingerprintCloseMinutes`,`workingDays`,`isDefault`,`isActive`,`createdByUserId`)
SELECT 'الوردية الأساسية','flex-3',450,870,420,480,495,855,885,900,'0,1,2,3,4',true,true,1
WHERE NOT EXISTS (SELECT 1 FROM `work_shifts` WHERE `code` = 'flex-3');--> statement-breakpoint
UPDATE `work_shifts` SET `name`='الوردية الأساسية', `startMinutes`=450, `endMinutes`=870, `fingerprintOpenMinutes`=420, `lateStartMinutes`=480, `morningCompensationDeadlineMinutes`=495, `actualEndMinutes`=855, `eveningCompensationDeadlineMinutes`=885, `fingerprintCloseMinutes`=900, `workingDays`='0,1,2,3,4', `isDefault`=true, `isActive`=true WHERE `code`='flex-3';

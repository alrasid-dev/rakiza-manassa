export const ASSISTANT_DATA_SCOPE = {
  leadership: { sources: ["dashboard_summary", "delays_summary", "attendance_summary", "activity_summary"], restricted: ["private_personal_notes", "credentials", "full_document_content"] },
  trainee_affairs: { sources: ["trainee_tasks", "trainee_delays", "trainee_assignments", "correspondence_templates"], restricted: ["other_units_reports", "credentials", "private_personal_notes"] },
  judicial_affairs: { sources: ["judge_profiles", "formations", "delegations", "judicial_correspondence"], restricted: ["employee_private_records", "credentials", "unrelated_units"] },
  performance_monitoring: { sources: ["uploaded_reports", "task_statuses", "unit_summary_metrics"], restricted: ["credentials", "private_personal_notes", "unrelated_unit_details"] },
  technical_support: { sources: ["support_tickets", "ticket_attachments_metadata", "support_workflows"], restricted: ["case_content_outside_ticket", "credentials", "private_personal_notes"] },
} as const;

export const FORBIDDEN_AUTOMATION_ACTIONS = ["penalty", "employment_decision", "sensitive_correspondence", "permission_change"] as const;

export type AssistantDataScopeKey = keyof typeof ASSISTANT_DATA_SCOPE;

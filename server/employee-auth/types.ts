/** أنواع نظام دخول الموظفين المستقل عن OTP اليومي. */
export type ApprovedEmployee = {
  fullName: string;
  department: string;
};

export type EmployeeRecord = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  pinHash: string;
  biometricCredentialId: string | null;
  notificationsEnabled: boolean;
  createdAt: string;
};

export type OneTimeChallenge = {
  employeeId: string;
  purpose: "registration" | "password_recovery";
  codeHash: string;
  expiresAt: number;
  consumed: boolean;
};

export type EmployeeSession = {
  token: string;
  employeeId: string;
  expiresAt: number;
};

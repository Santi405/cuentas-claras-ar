export const ISSUE_LEVELS = ["ERROR", "WARNING", "INFO"] as const;
export type IssueLevel = (typeof ISSUE_LEVELS)[number];

export type Issue = {
  level: IssueLevel;
  code: string;
  message: string;
  row?: number;
  column?: string;
};

export function issue(
  level: IssueLevel,
  code: string,
  message: string,
  extra?: { row?: number; column?: string },
): Issue {
  return { level, code, message, ...extra };
}

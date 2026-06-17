export type StatusTone = "open" | "progress" | "waiting" | "done" | "closed";

export type DemoRequest = {
  requestNo: string;
  requestDate: string;
  body: string;
  type: string;
  status: string;
  tone: StatusTone;
  assignedTo: string;
  department: string;
  due: string;
  difference: string;
  checkState: string;
  enteredBy: string;
};

export const demoSheets = [
  "Audit Requests",
  "Operations Requests",
  "Client Follow-ups"
];

export const demoRequests: DemoRequest[] = [
  {
    requestNo: "R-001",
    requestDate: "Jun 17, 09:15",
    body: "Provide Q2 bank reconciliation evidence for Finance review.",
    type: "Audit Request",
    status: "Open",
    tone: "open",
    assignedTo: "Abdullah",
    department: "Finance",
    due: "Jun 18, 09:15",
    difference: "2h 14m",
    checkState: "Check-in",
    enteredBy: "Abdullah"
  },
  {
    requestNo: "R-002",
    requestDate: "Jun 17, 10:05",
    body: "Upload vendor invoice approval chain for sampled transaction.",
    type: "Information Request",
    status: "In Progress",
    tone: "progress",
    assignedTo: "Sara Khan",
    department: "Compliance",
    due: "Jun 18, 12:00",
    difference: "1h 24m",
    checkState: "Check-in",
    enteredBy: "Ali Raza"
  },
  {
    requestNo: "R-003",
    requestDate: "Jun 16, 15:30",
    body: "Confirm whether payroll exception report was reviewed.",
    type: "Approval Request",
    status: "Waiting",
    tone: "waiting",
    assignedTo: "Maham Noor",
    department: "HR",
    due: "Jun 17, 15:30",
    difference: "1d 3h",
    checkState: "",
    enteredBy: "Usman Tariq"
  },
  {
    requestNo: "R-004",
    requestDate: "Jun 15, 11:45",
    body: "Submit access control evidence for terminated users.",
    type: "Audit Request",
    status: "Completed",
    tone: "done",
    assignedTo: "Usman Tariq",
    department: "IT",
    due: "Jun 16, 11:45",
    difference: "20h 5m",
    checkState: "Check-out",
    enteredBy: "Sara Khan"
  }
];

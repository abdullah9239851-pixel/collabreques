const { PrismaClient, UserRole, UserStatus, PermissionEffect, CheckState, ErrorSeverity } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const colors = {
  evergreen: "#1F6F5B",
  mint: "#A7C957",
  coral: "#E85D4F",
  amber: "#D99A29",
  ink: "#1F2933",
  surface: "#F7F8F5",
  grid: "#D9DED6",
};

async function upsertUser({ email, displayName, role, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      displayName,
      role,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    update: {
      displayName,
      role,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });
}

async function main() {
  const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD || "123456";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "123456";
  const demoUserPassword = process.env.SEED_USER_PASSWORD || "DemoPass123!";

  const superAdmin = await upsertUser({
    email: "abdullah9239851@gmail.com",
    displayName: "Abdullah",
    role: UserRole.SUPER_ADMIN,
    password: superAdminPassword,
  });

  const admin = await upsertUser({
    email: "contact.abdullah9239851@gmail.com",
    displayName: "Abdullah Admin",
    role: UserRole.ADMIN,
    password: adminPassword,
  });

  const users = [
    superAdmin,
    admin,
    await upsertUser({
      email: "user1@demo.local",
      displayName: "Demo User 1",
      role: UserRole.USER,
      password: demoUserPassword,
    }),
    await upsertUser({
      email: "user2@demo.local",
      displayName: "Demo User 2",
      role: UserRole.USER,
      password: demoUserPassword,
    }),
    await upsertUser({
      email: "limited@demo.local",
      displayName: "Limited Demo",
      role: UserRole.USER,
      password: demoUserPassword,
    }),
  ];

  const statuses = await Promise.all(
    [
      ["Open", "#E7F4EF", colors.evergreen, false, 1],
      ["In Progress", "#EEF6D5", "#3E5B1D", false, 2],
      ["Waiting", "#F9E8BE", "#735116", false, 3],
      ["Completed", "#E8ECE8", "#44504A", true, 4],
      ["Closed", "#E2E5E1", "#44504A", true, 5],
    ].map(([name, fillColor, textColor, isClosing, sortOrder]) =>
      prisma.statusOption.upsert({
        where: { name },
        create: { name, fillColor, textColor, isClosing, sortOrder },
        update: { fillColor, textColor, isClosing, sortOrder, isActive: true },
      }),
    ),
  );

  const requestTypes = await Promise.all(
    ["Audit Request", "Task", "Complaint", "Change Request", "Information Request", "Approval Request", "Other"].map(
      (name, index) =>
        prisma.requestTypeOption.upsert({
          where: { name },
          create: { name, sortOrder: index + 1 },
          update: { sortOrder: index + 1, isActive: true },
        }),
    ),
  );

  const departments = await Promise.all(
    ["Finance", "HR", "Operations", "IT", "Compliance", "Customer Support"].map((name, index) =>
      prisma.departmentOption.upsert({
        where: { name },
        create: { name, sortOrder: index + 1 },
        update: { sortOrder: index + 1, isActive: true },
      }),
    ),
  );

  const dashboards = await Promise.all(
    [
      ["Audit Requests", "Shared audit, evidence, and compliance request sheet."],
      ["Operations Requests", "Shared operations task and follow-up sheet."],
      ["Client Follow-ups", "Shared sheet for customer and client follow-up work."],
    ].map(([name, description]) =>
      prisma.dashboard.upsert({
        where: { name },
        create: {
          name,
          description,
          createdByUserId: superAdmin.id,
        },
        update: {
          description,
          isActive: true,
        },
      }),
    ),
  );

  const peopleByDashboard = {
    "Audit Requests": ["Abdullah", "Sara", "Ali", "Finance Team"],
    "Operations Requests": ["Operations Lead", "Abdullah", "IT Support", "Customer Support"],
    "Client Follow-ups": ["Client Success", "Sara", "Ali", "Admin Team"],
  };

  const assignablePeople = new Map();
  for (const dashboard of dashboards) {
    for (const name of peopleByDashboard[dashboard.name]) {
      const person = await prisma.assignablePerson.upsert({
        where: {
          dashboardId_name: {
            dashboardId: dashboard.id,
            name,
          },
        },
        create: {
          dashboardId: dashboard.id,
          name,
          linkedUserId: name === "Abdullah" ? superAdmin.id : null,
        },
        update: {
          isActive: true,
          linkedUserId: name === "Abdullah" ? superAdmin.id : null,
        },
      });
      assignablePeople.set(`${dashboard.name}:${name}`, person);
    }
  }

  const statusByName = Object.fromEntries(statuses.map((status) => [status.name, status]));
  const typeByName = Object.fromEntries(requestTypes.map((type) => [type.name, type]));
  const departmentByName = Object.fromEntries(departments.map((department) => [department.name, department]));
  const dashboardByName = Object.fromEntries(dashboards.map((dashboard) => [dashboard.name, dashboard]));

  const demoRequests = [
    {
      dashboardName: "Audit Requests",
      sequenceNumber: 1,
      requestBody: "Provide Q2 bank reconciliation evidence for Finance review.",
      requestType: "Audit Request",
      status: "Open",
      assignedTo: "Finance Team",
      department: "Finance",
      dueInHours: 18,
      checkState: CheckState.CHECK_IN,
      comments: "Initial demo row for live sheet testing.",
    },
    {
      dashboardName: "Audit Requests",
      sequenceNumber: 2,
      requestBody: "Upload vendor invoice approval chain for sampled transaction.",
      requestType: "Information Request",
      status: "In Progress",
      assignedTo: "Abdullah",
      department: "Compliance",
      dueInHours: 36,
      checkState: null,
      comments: "Shows admin-owned due date flow.",
    },
    {
      dashboardName: "Audit Requests",
      sequenceNumber: 3,
      requestBody: "Confirm whether payroll exception report was reviewed.",
      requestType: "Approval Request",
      status: "Waiting",
      assignedTo: "Sara",
      department: "HR",
      dueInHours: -6,
      checkState: CheckState.CHECK_OUT,
      comments: "Overdue by due date for smoke testing.",
    },
    {
      dashboardName: "Audit Requests",
      sequenceNumber: 4,
      requestBody: "Submit access control evidence for terminated users.",
      requestType: "Audit Request",
      status: "Completed",
      assignedTo: "Ali",
      department: "IT",
      dueInHours: 8,
      checkState: CheckState.CHECK_IN,
      comments: "Completed row for closing-status tests.",
    },
    {
      dashboardName: "Operations Requests",
      sequenceNumber: 1,
      requestBody: "Replace damaged access badge for front desk staff.",
      requestType: "Task",
      status: "Open",
      assignedTo: "Operations Lead",
      department: "Operations",
      dueInHours: 12,
      checkState: CheckState.CHECK_OUT,
      comments: "Open operations task.",
    },
    {
      dashboardName: "Operations Requests",
      sequenceNumber: 2,
      requestBody: "Investigate laptop docking station issue in conference room.",
      requestType: "Complaint",
      status: "In Progress",
      assignedTo: "IT Support",
      department: "IT",
      dueInHours: 20,
      checkState: null,
      comments: "Assigned to IT Support.",
    },
    {
      dashboardName: "Operations Requests",
      sequenceNumber: 3,
      requestBody: "Review process update for visitor sign-in workflow.",
      requestType: "Change Request",
      status: "Waiting",
      assignedTo: "Operations Lead",
      department: "Operations",
      dueInHours: -30,
      checkState: CheckState.CHECK_OUT,
      comments: "Overdue by open-duration and due-date smoke path.",
    },
    {
      dashboardName: "Operations Requests",
      sequenceNumber: 4,
      requestBody: "Confirm equipment inventory count for storage room.",
      requestType: "Task",
      status: "Closed",
      assignedTo: "Customer Support",
      department: "Operations",
      dueInHours: 6,
      checkState: null,
      comments: "Closed operations row.",
    },
    {
      dashboardName: "Client Follow-ups",
      sequenceNumber: 1,
      requestBody: "Investigate complaint about delayed response time.",
      requestType: "Complaint",
      status: "Open",
      assignedTo: "Client Success",
      department: "Customer Support",
      dueInHours: 24,
      checkState: null,
      comments: "Demo customer-facing request.",
    },
    {
      dashboardName: "Client Follow-ups",
      sequenceNumber: 2,
      requestBody: "Send requested contract amendment information to client.",
      requestType: "Information Request",
      status: "In Progress",
      assignedTo: "Sara",
      department: "Customer Support",
      dueInHours: 30,
      checkState: CheckState.CHECK_IN,
      comments: "Shows client success follow-up.",
    },
    {
      dashboardName: "Client Follow-ups",
      sequenceNumber: 3,
      requestBody: "Approve exception for client onboarding deadline.",
      requestType: "Approval Request",
      status: "Waiting",
      assignedTo: "Admin Team",
      department: "Compliance",
      dueInHours: 4,
      checkState: null,
      comments: "Waiting for admin approval.",
    },
    {
      dashboardName: "Client Follow-ups",
      sequenceNumber: 4,
      requestBody: "Close completed follow-up after client confirmation.",
      requestType: "Task",
      status: "Completed",
      assignedTo: "Ali",
      department: "Customer Support",
      dueInHours: 10,
      checkState: CheckState.CHECK_OUT,
      comments: "Completed follow-up row.",
    },
  ];

  for (const item of demoRequests) {
    const dashboard = dashboardByName[item.dashboardName];
    const dueDate = new Date(Date.now() + item.dueInHours * 60 * 60 * 1000);
    const closedAt = statusByName[item.status].isClosing ? new Date() : null;
    const request = await prisma.request.upsert({
      where: {
        dashboardId_sequenceNumber: {
          dashboardId: dashboard.id,
          sequenceNumber: item.sequenceNumber,
        },
      },
      create: {
        dashboardId: dashboard.id,
        sequenceNumber: item.sequenceNumber,
        requestBody: item.requestBody,
        requestTypeId: typeByName[item.requestType].id,
        statusId: statusByName[item.status].id,
        assignedPersonId: assignablePeople.get(`${item.dashboardName}:${item.assignedTo}`)?.id,
        departmentId: departmentByName[item.department].id,
        dueDateTime: dueDate,
        dueDateSetByUserId: admin.id,
        dueDateUpdatedAt: new Date(),
        firstFilledAt: new Date(),
        closedAt,
        completedAt: item.status === "Completed" ? closedAt : null,
        checkState: item.checkState,
        comments: item.comments,
        enteredByUserId: users[2].id,
      },
      update: {
        requestBody: item.requestBody,
        requestTypeId: typeByName[item.requestType].id,
        statusId: statusByName[item.status].id,
        assignedPersonId: assignablePeople.get(`${item.dashboardName}:${item.assignedTo}`)?.id,
        departmentId: departmentByName[item.department].id,
        dueDateTime: dueDate,
        dueDateSetByUserId: admin.id,
        dueDateUpdatedAt: new Date(),
        firstFilledAt: new Date(),
        closedAt,
        completedAt: item.status === "Completed" ? closedAt : null,
        checkState: item.checkState,
        comments: item.comments,
        version: 1,
      },
    });

    const activityCount = await prisma.requestActivity.count({
      where: { requestId: request.id },
    });

    if (activityCount === 0) {
      await prisma.requestActivity.create({
        data: {
          dashboardId: dashboard.id,
          requestId: request.id,
          userId: users[2].id,
          actionType: "CREATE_ROW",
          metadata: {
            seeded: true,
            displayRequestNumber: `R-${String(item.sequenceNumber).padStart(3, "0")}`,
          },
        },
      });
    }
  }

  for (const dashboard of dashboards) {
    const maxSequence = Math.max(
      ...demoRequests
        .filter((request) => request.dashboardName === dashboard.name)
        .map((request) => request.sequenceNumber),
    );

    await prisma.dashboard.update({
      where: { id: dashboard.id },
      data: { nextRequestSequence: maxSequence + 1 },
    });
  }

  const permissions = [
    ["dashboard.view", "View sheets", "Sheet access", "Dashboard"],
    ["dashboard.create", "Create sheets", "Create shared sheets", "Dashboard"],
    ["dashboard.lock", "Lock sheets", "Prevent edits while admin is changing a sheet", "Dashboard"],
    ["request.create", "Create requests", "Add new request rows", "Request"],
    ["request.edit", "Edit requests", "Edit request cells", "Request"],
    ["request.delete", "Delete requests", "Delete request rows", "Request"],
    ["due_date.edit", "Edit due dates", "Set or update due date/time", "Request"],
    ["lists.manage", "Manage dropdown lists", "Manage status, type, department, and assigned people lists", "Admin"],
    ["users.manage", "Manage users", "Invite, disable, or update users", "Admin"],
    ["exports.csv", "Export CSV", "Download sheet data as CSV", "Export"],
  ];

  for (const [key, label, description, category] of permissions) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, label, description, category },
      update: { label, description, category },
    });
  }

  const grants = {
    USER: ["dashboard.view", "request.create", "request.edit", "exports.csv"],
    ADMIN: [
      "dashboard.view",
      "dashboard.create",
      "dashboard.lock",
      "request.create",
      "request.edit",
      "request.delete",
      "due_date.edit",
      "lists.manage",
      "exports.csv",
    ],
    SUPER_ADMIN: permissions.map(([key]) => key),
  };

  for (const [role, permissionKeys] of Object.entries(grants)) {
    for (const permissionKey of permissionKeys) {
      await prisma.roleDefaultPermission.upsert({
        where: {
          role_permissionKey: {
            role,
            permissionKey,
          },
        },
        create: {
          role,
          permissionKey,
          effect: PermissionEffect.GRANT,
        },
        update: {
          effect: PermissionEffect.GRANT,
        },
      });
    }
  }

  await prisma.displaySetting.upsert({
    where: { key: "brand" },
    create: {
      key: "brand",
      value: {
        name: "CollabRequest",
        palette: colors,
        uiLabel: "Sheet",
      },
      updatedByUserId: superAdmin.id,
    },
    update: {
      value: {
        name: "CollabRequest",
        palette: colors,
        uiLabel: "Sheet",
      },
      updatedByUserId: superAdmin.id,
    },
  });

  const savedViews = [
    ["Audit Requests", "Open Items", { status: ["Open", "In Progress", "Waiting"], sort: [{ field: "dueDateTime", direction: "asc" }] }],
    ["Operations Requests", "Overdue Items", { overdueOnly: true, sort: [{ field: "dueDateTime", direction: "asc" }] }],
    ["Client Follow-ups", "My Follow-ups", { assignedTo: ["Client Success", "Sara"], status: ["Open", "In Progress", "Waiting"] }],
  ];

  for (const [dashboardName, name, config] of savedViews) {
    const dashboard = dashboardByName[dashboardName];
    const existing = await prisma.savedView.findFirst({
      where: {
        dashboardId: dashboard.id,
        name,
        ownerUserId: superAdmin.id,
      },
    });

    if (existing) {
      await prisma.savedView.update({
        where: { id: existing.id },
        data: { config, scope: "SHARED" },
      });
    } else {
      await prisma.savedView.create({
        data: {
          dashboardId: dashboard.id,
          ownerUserId: superAdmin.id,
          name,
          scope: "SHARED",
          config,
        },
      });
    }
  }

  const existingDemoErrors = await prisma.errorLog.count({
    where: {
      source: "demo-seed",
    },
  });

  if (existingDemoErrors === 0) {
    await prisma.errorLog.createMany({
      data: [
        {
          severity: ErrorSeverity.INFO,
          source: "demo-seed",
          message: "Demo info log for diagnostics screen smoke testing.",
          metadata: { demo: true },
          userId: superAdmin.id,
        },
        {
          severity: ErrorSeverity.WARNING,
          source: "demo-seed",
          message: "Demo warning log for diagnostics screen smoke testing.",
          metadata: { demo: true },
          userId: admin.id,
        },
      ],
    });
  }

  console.log("Seed complete: users, sheets, dropdown lists, demo requests, and permissions are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

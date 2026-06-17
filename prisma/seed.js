const { PrismaClient, UserRole, UserStatus, PermissionEffect, CheckState } = require("@prisma/client");
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
          nextRequestSequence: 4,
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
      requestBody: "Upload vendor invoice evidence for monthly audit pack.",
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
      requestBody: "Confirm policy change request ownership before close.",
      requestType: "Change Request",
      status: "In Progress",
      assignedTo: "Abdullah",
      department: "Compliance",
      dueInHours: 36,
      checkState: null,
      comments: "Shows admin-owned due date flow.",
    },
    {
      dashboardName: "Operations Requests",
      sequenceNumber: 1,
      requestBody: "Prepare daily operations handover checklist.",
      requestType: "Task",
      status: "Waiting",
      assignedTo: "Operations Lead",
      department: "Operations",
      dueInHours: 12,
      checkState: CheckState.CHECK_OUT,
      comments: "Waiting on confirmation.",
    },
    {
      dashboardName: "Client Follow-ups",
      sequenceNumber: 1,
      requestBody: "Follow up with client about delayed response complaint.",
      requestType: "Complaint",
      status: "Open",
      assignedTo: "Client Success",
      department: "Customer Support",
      dueInHours: 24,
      checkState: null,
      comments: "Demo customer-facing request.",
    },
  ];

  for (const item of demoRequests) {
    const dashboard = dashboardByName[item.dashboardName];
    const dueDate = new Date(Date.now() + item.dueInHours * 60 * 60 * 1000);
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
        checkState: item.checkState,
        comments: item.comments,
        version: { increment: 1 },
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

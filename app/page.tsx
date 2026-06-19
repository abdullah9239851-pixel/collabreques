import { demoRequests, demoSheets } from "@/lib/demo-data";
import { LogoutButton } from "@/app/LogoutButton";
import { getCurrentUserSafe } from "@/lib/auth";

export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  open: "statusOpen",
  progress: "statusProgress",
  waiting: "statusWaiting",
  done: "statusDone",
  closed: "statusClosed"
};

export default async function Home() {
  const user = await getCurrentUserSafe();
  const signedInName = user?.displayName ?? "Demo Super Admin";
  const signedInEmail = user?.email ?? "abdullah9239851@gmail.com";
  const signedInRole = user?.role ? user.role.replace("_", " ") : "Demo Mode";

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/brand/collabrequest-logo.svg" alt="CollabRequest" />
        </div>
        <nav className="sheetList" aria-label="Sheets">
          {demoSheets.map((sheet, index) => (
            <button className={index === 0 ? "sheet active" : "sheet"} key={sheet}>
              <span className="sheetIcon" />
              {sheet}
            </button>
          ))}
        </nav>
        <div className="sidebarCard">
          <span className="eyebrow">Signed in as</span>
          <strong>{signedInName}</strong>
          <span>{signedInEmail}</span>
          <span className="rolePill">{signedInRole}</span>
          {user ? <LogoutButton /> : <a className="textButton" href="/login">Sign In</a>}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Shared Sheet</p>
            <h1>Audit Requests</h1>
          </div>
          <div className="actions">
            {user ? <span className="authBadge">Authenticated</span> : <a className="ghost actionLink" href="/login">Sign In</a>}
            <button className="ghost">Export CSV</button>
            <button className="primary">Add Row</button>
          </div>
        </header>

        <section className="metrics" aria-label="Dashboard metrics">
          <div>
            <span>Total Requests</span>
            <strong>24</strong>
          </div>
          <div>
            <span>In Progress</span>
            <strong>7</strong>
          </div>
          <div>
            <span>Overdue</span>
            <strong>3</strong>
          </div>
          <div>
            <span>Active Editors</span>
            <strong>2</strong>
          </div>
        </section>

        <section className="presence" aria-label="Presence">
          <div className="avatar">A</div>
          <div className="avatar coral">S</div>
          <span>Abdullah is editing Status in R-002</span>
        </section>

        <section className="gridFrame" aria-label="Request grid preview">
          <table className="grid">
            <thead>
              <tr>
                <th>Request No</th>
                <th>Request Date/Time</th>
                <th>Auditor's / Item Request</th>
                <th>Request Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Requested Department</th>
                <th>Due Date/Time</th>
                <th>Difference</th>
                <th>Check-in / Check-out</th>
                <th>Entered By</th>
              </tr>
            </thead>
            <tbody>
              {demoRequests.map((request, index) => (
                <tr key={request.requestNo}>
                  <td className="requestNo">{request.requestNo}</td>
                  <td>{request.requestDate}</td>
                  <td className={index === 1 ? "lockedCell" : "wideCell"}>
                    {request.body}
                  </td>
                  <td>{request.type}</td>
                  <td>
                    <span className={`status ${statusClass[request.tone]}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.assignedTo}</td>
                  <td>{request.department}</td>
                  <td>{request.due}</td>
                  <td>{request.difference}</td>
                  <td>{request.checkState || "-"}</td>
                  <td>{request.enteredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}

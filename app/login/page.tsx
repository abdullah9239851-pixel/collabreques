import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="loginShell">
      <section className="loginBrandPanel">
        <img src="/brand/collabrequest-logo.svg" alt="CollabRequest" />
        <div>
          <p className="eyebrow">Shared request tracker</p>
          <h1>Sign in to your Sheet workspace</h1>
          <p>
            Access the shared company Sheets, request rows, assignments, and live collaboration
            controls from one protected workspace.
          </p>
        </div>
      </section>
      <section className="loginPanel" aria-label="Sign in">
        <div>
          <p className="eyebrow">CollabRequest</p>
          <h2>Welcome back</h2>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}

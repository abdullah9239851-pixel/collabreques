"use client";

import { FormEvent, useState } from "react";

type LoginState = "idle" | "loading" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("abdullah9239851@gmail.com");
  const [password, setPassword] = useState("123456");
  const [state, setState] = useState<LoginState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setState("error");
      setMessage(result?.error ?? "Unable to sign in.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      <label>
        <span>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {state === "error" ? <p className="formError">{message}</p> : null}
      <button className="primary loginButton" disabled={state === "loading"} type="submit">
        {state === "loading" ? "Signing in..." : "Sign In"}
      </button>
      <div className="demoCredentials">
        <span>Demo Super Admin</span>
        <strong>abdullah9239851@gmail.com</strong>
      </div>
    </form>
  );
}

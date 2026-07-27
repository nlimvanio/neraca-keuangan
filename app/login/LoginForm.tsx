"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./action";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <form className="login-form-grid" action={loginAction}>
      <label>
        Email
        <input
            required
            id = "email"
            name = "email"
            type ="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
        />
        {state?.errors?.email && (
            <p className="error">{state.errors.email}</p>
        )}
      </label>
      <label>
        Password
        <input
            required
            id = "password"
            name = "password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
        />
        {state?.errors?.password && (
            <p className="error">{state.errors.password}</p>
        )}
      </label>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="button primary">
      Login
    </button>
  );
}

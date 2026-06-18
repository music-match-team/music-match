"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  async function login() {

    const response =
      await fetch(
        "/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

    if (!response.ok) {

      alert(
        "Credenziali errate"
      );

      return;
    }

    const utente =
      await response.json();

    localStorage.setItem(
      "utente",
      JSON.stringify(
        utente
      )
    );

    router.push(
      "/musicisti"
    );
  }

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Login
      </h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        onClick={login}
      >
        Accedi
      </button>

    </main>

  );
}
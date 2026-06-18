"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProteggiPagina({
  children
}: {
  children: React.ReactNode;
}) {

  const router =
    useRouter();

  const [controllato, setControllato] =
    useState(false);

  useEffect(() => {

    const utente =
      localStorage.getItem(
        "utente"
      );

    if (!utente) {

      router.push(
        "/login"
      );

      return;
    }

    setControllato(true);

  }, [router]);

  if (!controllato) {

    return (
      <main
        style={{
          padding: "20px"
        }}
      >
        <p>
          Controllo accesso...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
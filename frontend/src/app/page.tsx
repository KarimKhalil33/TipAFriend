"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/landing");
  }, [router]);

  return (
    <main className="container mx-auto py-6">
      <div>Redirecting...</div>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { PeopleDataProvider, usePeopleData } from "@/components/providers/PeopleDataContext";

/**
 * Triggers non-blocking load of all classmates + teachers data
 * as soon as the user enters the Echoes section.
 */
function PeopleLoader() {
  const { load } = usePeopleData();
  useEffect(() => {
    load();
  }, [load]);
  return null;
}

export default function EchoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PeopleDataProvider>
      <PeopleLoader />
      {children}
    </PeopleDataProvider>
  );
}

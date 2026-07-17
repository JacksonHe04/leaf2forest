"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

/* ── Types ── */

export interface PeopleClassmate {
  id: string;
  name: string;
  city: string | null;
  user_id: string;
}

export interface PeopleTeacher {
  id: string;
  name: string;
  subject: string;
}

interface PeopleData {
  classmates: PeopleClassmate[];
  teachers: PeopleTeacher[];
}

interface PeopleDataContextValue {
  classmates: PeopleClassmate[];
  teachers: PeopleTeacher[];
  loading: boolean;
  /** Trigger a background fetch. Safe to call multiple times. */
  load: () => void;
}

const EMPTY: PeopleDataContextValue = {
  classmates: [],
  teachers: [],
  loading: false,
  load: () => {},
};

const Ctx = createContext<PeopleDataContextValue>(EMPTY);

/* ── Provider ── */

export function PeopleDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PeopleData | null>(null);
  const [loading, setLoading] = useState(false);
  const dataRef = useRef(data);
  const loadingRef = useRef(loading);
  dataRef.current = data;
  loadingRef.current = loading;

  const load = useCallback(() => {
    if (dataRef.current || loadingRef.current) return;
    setLoading(true);
    fetch("/api/people")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.status === "success") {
          setData(json.data as PeopleData);
        }
      })
      .catch(() => {/* silent — non-critical */})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider
      value={{
        classmates: data?.classmates ?? [],
        teachers: data?.teachers ?? [],
        loading,
        load,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

/* ── Hook ── */

export function usePeopleData() {
  return useContext(Ctx);
}

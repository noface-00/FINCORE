// src/hooks/useAccounts.ts
import { useState, useEffect } from "react";
import { Cuenta } from "../types";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../api/cuentas.api";

export function useAccounts() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts();
      setCuentas(data);
    } catch (err: any) {
      setError(err?.message || "Error al cargar las cuentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async (cuenta: Cuenta) => {
    try {
      const newAccount = await createAccount(cuenta);
      setCuentas((prev) => [...prev, newAccount]);
      return newAccount;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al crear la cuenta");
    }
  };

  const editAccount = async (id: number, cuenta: Cuenta) => {
    try {
      const updated = await updateAccount(id, cuenta);
      setCuentas((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al actualizar la cuenta");
    }
  };

  const removeAccount = async (id: number) => {
    try {
      await deleteAccount(id);
      setCuentas((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al eliminar la cuenta");
    }
  };

  return {
    cuentas,
    loading,
    error,
    refetch: fetchAccounts,
    addAccount,
    editAccount,
    removeAccount,
  };
}

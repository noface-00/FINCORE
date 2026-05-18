// src/hooks/useClients.ts
import { useState, useEffect } from "react";
import { Cliente } from "../types";
import { getClients, createClient, updateClient, deleteClient } from "../api/clientes.api";

export function useClients() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients();
      setClientes(data);
    } catch (err: any) {
      setError(err?.message || "Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (cliente: Cliente) => {
    try {
      const newClient = await createClient(cliente);
      setClientes((prev) => [...prev, newClient]);
      return newClient;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al crear el cliente");
    }
  };

  const editClient = async (id: number, cliente: Cliente) => {
    try {
      const updated = await updateClient(id, cliente);
      setClientes((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al actualizar el cliente");
    }
  };

  const removeClient = async (id: number) => {
    try {
      await deleteClient(id);
      setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, estado: "suspendido" } : c)));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error al eliminar el cliente");
    }
  };

  return {
    clientes,
    loading,
    error,
    refetch: fetchClients,
    refresh: fetchClients,
    addClient,
    editClient,
    removeClient,
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Discursante = {
  id: number;
  nombre: string;
  telefono: string;
  telefonoResponsable: string | null;
  congregacionOrigen: string | null;
};

export type Bosquejo = {
  numero: number;
  titulo: string;
};

export type EstadoDiscurso =
  | "pendiente"
  | "enviado"
  | "confirmado"
  | "rechazado";

export type Discurso = {
  id: number;
  fecha: string;
  discursanteId: number | null;
  discursante: Discursante | null;
  bosquejoNumero: number | null;
  bosquejo: Bosquejo | null;
  estado: EstadoDiscurso;
  notas: string | null;
};

export async function obtenerDiscursos(): Promise<Discurso[]> {
  const res = await fetch(`${API_URL}/discursos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar discursos");
  return res.json();
}

export async function actualizarEstadoDiscurso(
  id: number,
  estado: EstadoDiscurso,
): Promise<Discurso> {
  const res = await fetch(`${API_URL}/discursos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
}

export async function obtenerDiscursantes(): Promise<Discursante[]> {
  const res = await fetch(`${API_URL}/discursantes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar discursantes");
  return res.json();
}

export async function crearDiscursante(data: {
  nombre: string;
  telefono: string;
  telefonoResponsable?: string | null;
  congregacionOrigen?: string | null;
}): Promise<Discursante> {
  const res = await fetch(`${API_URL}/discursantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear discursante");
  return res.json();
}

export async function actualizarDiscursante(
  id: number,
  data: Partial<{
    nombre: string;
    telefono: string;
    telefonoResponsable: string | null;
    congregacionOrigen: string | null;
  }>,
): Promise<Discursante> {
  const res = await fetch(`${API_URL}/discursantes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar discursante");
  return res.json();
}

export async function obtenerBosquejos(): Promise<Bosquejo[]> {
  const res = await fetch(`${API_URL}/bosquejos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar bosquejos");
  return res.json();
}

export async function guardarBosquejo(
  numero: number,
  titulo: string,
): Promise<Bosquejo> {
  const res = await fetch(`${API_URL}/bosquejos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero, titulo }),
  });
  if (!res.ok) throw new Error("Error al guardar bosquejo");
  return res.json();
}

export async function asignarDiscursoData(
  id: number,
  data: { discursanteId?: number | null; bosquejoNumero?: number | null },
): Promise<Discurso> {
  const res = await fetch(`${API_URL}/discursos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al asignar");
  return res.json();
}

export async function crearDiscurso(data: {
  fecha: string;
  discursanteId?: number | null;
  bosquejoNumero?: number | null;
}): Promise<Discurso> {
  const res = await fetch(`${API_URL}/discursos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear discurso");
  return res.json();
}

export async function eliminarDiscurso(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/discursos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar discurso");
}

export async function intercambiarDiscursos(
  idA: number,
  idB: number,
): Promise<{ a: Discurso; b: Discurso }> {
  const res = await fetch(`${API_URL}/discursos/intercambiar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idA, idB }),
  });
  if (!res.ok) throw new Error("Error al intercambiar");
  return res.json();
}

export async function actualizarNotasDiscurso(
  id: number,
  notas: string,
): Promise<Discurso> {
  const res = await fetch(`${API_URL}/discursos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notas: notas || null }),
  });
  if (!res.ok) throw new Error("Error al guardar la nota");
  return res.json();
}

export async function eliminarDiscursante(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/discursantes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar discursante");
}

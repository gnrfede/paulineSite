"use client";

import { useState, useEffect } from "react";
import type { Service } from "@/types";

export default function ServiciosAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: 60,
    price: "",
    active: true,
    order: 0,
  });

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    setLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function startEdit(srv: Service) {
    setEditingId(srv.id);
    setForm({
      name: srv.name,
      description: srv.description,
      duration: srv.duration,
      price: srv.price?.toString() ?? "",
      active: srv.active,
      order: srv.order,
    });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm({ name: "", description: "", duration: 60, price: "", active: true, order: services.length + 1 });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        duration: Number(form.duration),
        price: form.price ? Number(form.price) : undefined,
        active: form.active,
        order: Number(form.order),
      };

      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        fetchServices();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(srv: Service) {
    await fetch(`/api/services/${srv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !srv.active }),
    });
    fetchServices();
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Servicios</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">Gestioná los servicios disponibles</p>
        </div>
        <button onClick={startNew} className="btn-primary text-sm px-5 py-2.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo servicio
        </button>
      </div>

      {/* Edit/create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-6 mb-6">
          <h2 className="font-serif text-lg text-gray-800 mb-5">
            {editingId ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-sans text-xs text-gray-500 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-sans text-xs text-gray-500 mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Descripción del servicio"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 mb-1.5">Duración (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                className="input-field"
                min={15}
                step={15}
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 mb-1.5">
                Precio <span className="text-teal-500 font-medium">(se muestra en la página)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-gray-400">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="input-field pl-7"
                  placeholder="45000"
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 mb-1.5">Orden</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className="input-field"
                min={1}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 text-teal-500 rounded border-cream-300 focus:ring-teal-400"
              />
              <label htmlFor="active" className="font-sans text-sm text-gray-600">Activo</label>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.description}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-cream-300 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`bg-white rounded-2xl border ${srv.active ? "border-cream-300" : "border-cream-200 opacity-60"} shadow-sm p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-sm font-medium text-gray-800">{srv.name}</h3>
                    {!srv.active && (
                      <span className="font-sans text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">{srv.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="font-sans text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {srv.duration} min
                    </span>
                    {srv.price != null ? (
                      <span className="font-sans text-sm font-semibold text-teal-600">
                        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(srv.price)}
                      </span>
                    ) : (
                      <span className="font-sans text-xs text-gray-400 italic">Sin precio</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(srv)}
                    className="font-sans text-xs text-gray-400 hover:text-teal-500 px-3 py-1.5 rounded-full border border-cream-300 hover:border-teal-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActive(srv)}
                    className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      srv.active
                        ? "text-gray-400 hover:text-red-500 border-cream-300 hover:border-red-200"
                        : "text-teal-500 border-teal-200 hover:bg-teal-50"
                    }`}
                  >
                    {srv.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

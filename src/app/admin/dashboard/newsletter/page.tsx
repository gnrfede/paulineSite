"use client";

import { useState, useEffect } from "react";

interface Consent {
  id:          string;
  email:       string;
  name:        string;
  consentedAt: string;
}

const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NewsletterPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((d) => setConsents(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  function copyEmails() {
    const emails = consents.map((c) => c.email).join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Newsletter</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">Clientas que dieron consentimiento para recibir comunicaciones</p>
        </div>
        {consents.length > 0 && (
          <button onClick={copyEmails} className="btn-outline text-xs px-4 py-2 flex items-center gap-2">
            {copied ? (
              <><svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>¡Copiado!</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>Copiar todos los emails</>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm">
          <div className="text-xl mb-2">✉️</div>
          <div className="font-serif text-3xl text-teal-600">{loading ? "—" : consents.length}</div>
          <div className="font-sans text-xs text-gray-400 mt-1">Suscriptas activas</div>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-cream-300 p-5 shadow-sm">
          <div className="text-xl mb-2">⚖️</div>
          <div className="font-sans text-sm text-amber-700 font-medium mt-1">Consentimiento explícito</div>
          <div className="font-sans text-xs text-gray-500 mt-1">Cada clienta optó por recibir comunicaciones al reservar su turno.</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-cream-300 animate-pulse" />)}
        </div>
      ) : consents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
          <p className="font-sans text-sm text-gray-400">Todavía no hay clientas suscriptas. Aparecerán aquí cuando marquen la opción al reservar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="text-left font-sans text-xs font-medium text-gray-400 tracking-wide uppercase px-5 py-3">Nombre</th>
                <th className="text-left font-sans text-xs font-medium text-gray-400 tracking-wide uppercase px-5 py-3">Email</th>
                <th className="text-left font-sans text-xs font-medium text-gray-400 tracking-wide uppercase px-5 py-3 hidden sm:table-cell">Fecha de consentimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {consents.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-sans text-xs text-teal-600 font-medium">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-sans text-sm text-gray-700">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <a href={`mailto:${c.email}`} className="font-sans text-sm text-teal-600 hover:text-teal-700 transition-colors">{c.email}</a>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="font-sans text-xs text-gray-400">{fmtDate(c.consentedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="font-sans text-xs text-gray-400 mt-4 text-center">
        Este listado solo incluye clientas con consentimiento explícito. Cumple con la Ley 25.326 de protección de datos personales.
      </p>
    </div>
  );
}

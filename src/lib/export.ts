import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { FORM_STEPS } from "./form-schema";
import {
  analysisOf,
  answersOf,
  effectiveScore,
  formatDate,
  type AppRow,
} from "./applications";
import { RECOMMENDATION_LABEL, STATUS_LABEL } from "./scoring";

export function exportExcel(apps: AppRow[]) {
  const rows = apps.map((a) => {
    const answers = answersOf(a);
    const base: Record<string, unknown> = {
      Nome: a.full_name,
      Idade: a.age,
      Cidade: a.city,
      Telefone: a.phone,
      Email: a.email,
      Vaga: a.vacancy,
      "Pontuação": effectiveScore(a),
      Estado: STATUS_LABEL[a.status] ?? a.status,
      Data: formatDate(a.created_at),
    };
    for (const step of FORM_STEPS) {
      for (const field of step.fields) {
        const value = answers[field.id];
        base[field.label.slice(0, 80)] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
      }
    }
    return base;
  });

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Candidaturas");
  XLSX.writeFile(book, `mwila-mania-candidaturas-${Date.now()}.xlsx`);
}

export function exportListPdf(apps: AppRow[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Mwila Mania — Candidaturas", 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [["#", "Nome", "Vaga", "Cidade", "Idade", "Pontos", "Estado", "Data"]],
    body: apps.map((a, i) => [
      String(i + 1),
      a.full_name,
      a.vacancy,
      a.city ?? "",
      String(a.age ?? ""),
      String(effectiveScore(a)),
      STATUS_LABEL[a.status] ?? a.status,
      formatDate(a.created_at),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [226, 122, 44] },
  });
  doc.save(`mwila-mania-candidaturas-${Date.now()}.pdf`);
}

export function exportApplicationPdf(app: AppRow) {
  const doc = new jsPDF();
  const answers = answersOf(app);
  const analysis = analysisOf(app);
  let y = 18;

  doc.setFontSize(16);
  doc.text(`Candidatura — ${app.full_name}`, 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(
    `${app.vacancy} · ${app.city ?? ""} · ${app.age ?? ""} anos · ${effectiveScore(app)}/100 · ${
      STATUS_LABEL[app.status] ?? app.status
    } · ${formatDate(app.created_at)}`,
    14,
    y,
  );
  y += 6;
  if (analysis.recomendacao) {
    doc.text(`Recomendação: ${RECOMMENDATION_LABEL[analysis.recomendacao]}`, 14, y);
    y += 6;
  }

  for (const step of FORM_STEPS) {
    const body = step.fields
      .map((field) => {
        const value = answers[field.id];
        const text = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "boolean"
            ? value
              ? "Sim"
              : "Não"
            : String(value ?? "");
        return text ? [field.label, text] : null;
      })
      .filter(Boolean) as string[][];
    if (!body.length) continue;

    autoTable(doc, {
      startY: y + 4,
      head: [[step.title, ""]],
      body,
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 105 } },
      headStyles: { fillColor: [226, 122, 44] },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY;
  }

  doc.save(`candidatura-${app.full_name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import type { BeiResult } from "@/lib/bei-calculations";

export function WhitePaper({ result, insight }: { result: BeiResult; insight: string }) {
  const [open, setOpen] = useState(false);

  const rows: [string, string][] = [
    ["Exporter", `${result.countryA.name} (${result.countryA.surplus} TWh surplus)`],
    ["Importer", `${result.countryB.name} (${result.countryB.surplus} TWh balance)`],
    ["Great-circle distance", `${Math.round(result.distanceKm).toLocaleString()} km`],
    ["Transmission loss", `${result.lossPercent.toFixed(1)}%`],
    ["Deliverable energy", `${result.deliverableEnergy.toFixed(2)} TWh`],
    ["Price gap", `$${result.priceGap.toFixed(3)}/kWh`],
    ["Renewable share of surplus", `${result.renewableShare.toFixed(0)}%`],
    ["Feasibility score", result.feasibilityScore.toFixed(2)],
    ["Border Energy Index", `${result.beiScore.toFixed(1)} / 100`],
  ];

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    // Print-optimised: white page, dark text, no app theme colours.
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 56;
    let y = margin;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
    doc.setTextColor(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Border Energy Index — White Paper Excerpt", margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70);
    doc.text(
      `Cross-Border Renewable Energy Trade Feasibility · ${result.countryA.name} to ${result.countryB.name}`,
      margin,
      y,
    );
    doc.setTextColor(20);
    y += 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. Trade Corridor Data", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    rows.forEach(([label, value]) => {
      doc.text(label, margin, y);
      doc.text(value, margin + 250, y);
      y += 17;
    });

    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("2. Policy Insight", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc
      .splitTextToSize(insight || "Policy insight not yet generated.", 483)
      .forEach((line: string) => {
        doc.text(line, margin, y);
        y += 16;
      });

    y += 20;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Border Energy Index · Cross-Border Renewable Energy Trade Feasibility Analysis · generated ${new Date().toLocaleDateString()}`,
      margin,
      y,
    );

    doc.save(`BEI-${result.countryA.id}-${result.countryB.id}.pdf`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">White Paper Excerpt</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Formal, citation-ready summary of this corridor.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <FileText className="size-4" />
            Generate White Paper Excerpt
          </motion.button>
          {open ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              <Download className="size-4" />
              Download as PDF
            </motion.button>
          ) : null}
        </div>
      </div>

      {open ? (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border border-neutral-300 bg-white p-8 text-neutral-900 shadow-sm sm:p-12"
        >
          <p className="text-[11px] tracking-[0.24em] text-neutral-500 uppercase">
            Border Energy Index · White Paper Excerpt · Print view
          </p>
          <h4 className="mt-3 font-display text-3xl font-bold text-neutral-900">
            Cross-Border Feasibility: {result.countryA.name} → {result.countryB.name}
          </h4>

          <h5 className="mt-8 font-display text-lg font-bold text-neutral-900">
            1. Trade Corridor Data
          </h5>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-neutral-200">
                  <th className="py-2 text-left font-medium text-neutral-600">{label}</th>
                  <td className="py-2 text-right font-semibold text-neutral-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5 className="mt-8 font-display text-lg font-bold text-neutral-900">2. Policy Insight</h5>
          <p className="mt-3 border-l-2 border-neutral-400 pl-4 text-sm leading-relaxed text-neutral-700 italic">
            {insight || "Policy insight is still being generated."}
          </p>

          <p className="mt-8 text-xs text-neutral-500">
            Border Energy Index — Cross-Border Renewable Energy Trade Feasibility Analysis.
          </p>
        </motion.article>
      ) : null}
    </div>
  );
}

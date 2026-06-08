import jsPDF from "jspdf";
import { Institution, InstitutionPhoto } from "../types";

type DocWithPages = { internal: { getNumberOfPages: () => number } };

function photoToDataUrl(photo: InstitutionPhoto): string {
    const mt = photo.mime_type || "image/jpeg";
    const data = photo.photo;
    if (typeof data === "string") {
        if (data.startsWith("data:")) return data;
        return `data:${mt};base64,${data}`;
    }
    if (data && typeof data === "object" && (data as { type?: string }).type === "Buffer" && Array.isArray((data as { data?: number[] }).data)) {
        const bytes = new Uint8Array((data as { data: number[] }).data);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return `data:${mt};base64,${btoa(binary)}`;
    }
    return "";
}

function imageFormatFromMime(mime?: string | null): string {
    if (mime?.includes("png")) return "PNG";
    if (mime?.includes("webp")) return "WEBP";
    return "JPEG";
}

function calculateActivityProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (end <= start) return 100;
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
}

function drawGanttPage(doc: jsPDF, institution: Institution) {
    doc.addPage('a4', 'landscape');

    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const M  = 10;
    const LABEL_W = 52;
    const CHART_W = PW - 2 * M - LABEL_W;
    const N_COLS  = 11; // 2025 | Q1 2026 | Abr…Dez (9)
    const W_COL   = CHART_W / N_COLS;
    const W_2025  = W_COL;
    const W_Q1    = W_COL;
    const W_MON   = W_COL;

    const HEADER_Y_H = 7;  // year band
    const HEADER_M_H = 7;  // month band
    const HEADER_H   = HEADER_Y_H + HEADER_M_H;
    const INST_H     = 9;
    const ACT_H      = 7;

    const BLUE:   [number,number,number] = [19, 81, 180];
    const YELLOW: [number,number,number] = [255, 205, 7];
    const GRID:   [number,number,number] = [196, 209, 228];
    const actColors: Record<string, [number,number,number]> = {
        Concluído:      [22, 136, 33],
        "Em andamento": [19, 81, 180],
        Projetado:      [255, 140, 0],
        Planejado:      [255, 140, 0],
    };

    const chartX = M + LABEL_W;
    const FOOTER_TOP = PH - 8;

    // ── Date → x offset (mm) ──
    const dateToX = (dateStr: string): number | null => {
        try {
            const parts = dateStr.substring(0, 10).split("-");
            const yr = parseInt(parts[0], 10);
            const mo = parseInt(parts[1], 10);
            const d  = parseInt(parts[2], 10);
            if (isNaN(yr) || isNaN(mo) || isNaN(d)) return null;
            const frac = (d - 1) / new Date(yr, mo, 0).getDate();
            if (yr === 2025)              return ((mo - 1 + frac) / 12) * W_2025;
            if (yr === 2026 && mo <= 3)   return W_2025 + ((mo - 1 + frac) / 3) * W_Q1;
            if (yr === 2026 && mo >= 4)   return W_2025 + W_Q1 + (mo - 4 + frac) * W_MON;
            return null;
        } catch { return null; }
    };

    const gridLines = [
        W_2025, W_2025 + W_Q1,
        ...Array.from({ length: 9 }, (_, i) => W_2025 + W_Q1 + (i + 1) * W_MON),
    ];

    const drawGridLines = (rowY: number, rowH: number) => {
        doc.setDrawColor(GRID[0], GRID[1], GRID[2]);
        doc.setLineWidth(0.25);
        gridLines.forEach(ox => doc.line(chartX + ox, rowY, chartX + ox, rowY + rowH));
    };

    // ── Draws title bar, table header, institution row and footer for the current page; returns y of first activity row ──
    const drawChrome = (): number => {
        // Page header
        doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
        doc.rect(0, 0, PW, 19, "F");
        doc.setTextColor(YELLOW[0], YELLOW[1], YELLOW[2]);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Cronograma de Atividades", M, 10);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(institution.name, M, 14);

        let cy = 24;

        // ── Gantt header — year row ──
        doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
        doc.rect(M, cy, LABEL_W, HEADER_H, "F");
        doc.rect(chartX, cy, CHART_W, HEADER_Y_H, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Atividade", M + 3, cy + HEADER_H / 2 + 2);

        doc.setTextColor(YELLOW[0], YELLOW[1], YELLOW[2]);
        doc.setFontSize(6.5);
        doc.text("2025", chartX + W_2025 / 2, cy + HEADER_Y_H / 2 + 2, { align: "center" });
        doc.text("2026", chartX + W_2025 + (CHART_W - W_2025) / 2, cy + HEADER_Y_H / 2 + 2, { align: "center" });

        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(chartX + W_2025, cy, chartX + W_2025, cy + HEADER_Y_H);

        // ── Gantt header — month row ──
        const cy2 = cy + HEADER_Y_H;
        doc.setFillColor(BLUE[0] + 15, BLUE[1] + 15, BLUE[2] + 15);
        doc.rect(chartX, cy2, CHART_W, HEADER_M_H, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "bold");

        // Q1
        doc.text("1º Tri", chartX + W_2025 + W_Q1 / 2, cy2 + HEADER_M_H / 2 + 2, { align: "center" });
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(chartX + W_2025, cy2, chartX + W_2025, cy2 + HEADER_M_H);
        doc.line(chartX + W_2025 + W_Q1, cy2, chartX + W_2025 + W_Q1, cy2 + HEADER_M_H);

        // Abr–Dez
        ["Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].forEach((mon, i) => {
            const mx = chartX + W_2025 + W_Q1 + i * W_MON;
            doc.text(mon, mx + W_MON / 2, cy2 + HEADER_M_H / 2 + 2, { align: "center" });
            doc.line(mx, cy2, mx, cy2 + HEADER_M_H);
        });

        cy += HEADER_H;

        // ── Institution row ──
        doc.setFillColor(224, 235, 250);
        doc.rect(M, cy, LABEL_W + CHART_W, INST_H, "F");
        doc.setDrawColor(190, 210, 240);
        doc.setLineWidth(0.25);
        doc.rect(M, cy, LABEL_W + CHART_W, INST_H);
        doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text((doc.splitTextToSize(institution.name, LABEL_W - 6) as string[])[0], M + 3, cy + INST_H / 2 + 2);
        drawGridLines(cy, INST_H);
        cy += INST_H;

        // ── Footer ──
        doc.setFillColor(248, 249, 250);
        doc.rect(0, FOOTER_TOP, PW, PH - FOOTER_TOP, "F");
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.3);
        doc.line(0, FOOTER_TOP, PW, FOOTER_TOP);
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text(
            "Ministério da Saúde — DECAN © 2026 | Sistema de Monitoramento",
            PW / 2, FOOTER_TOP + 5, { align: "center" }
        );

        return cy;
    };

    let y = drawChrome();

    // ── Activity rows ──
    const NAME_LINE_H = 3.1;
    const NAME_MAX_LINES = 2;
    (institution.activities || []).forEach((act, i) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        let nameLines = doc.splitTextToSize(act.name, LABEL_W - 8) as string[];
        if (nameLines.length > NAME_MAX_LINES) nameLines = nameLines.slice(0, NAME_MAX_LINES);
        const rowH = Math.max(ACT_H, nameLines.length * NAME_LINE_H + 3.4);

        if (y + rowH > FOOTER_TOP) {
            doc.addPage('a4', 'landscape');
            y = drawChrome();
        }

        const bg: [number,number,number] = i % 2 === 0 ? [255,255,255] : [248,249,250];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(M, y, LABEL_W + CHART_W, rowH, "F");
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.rect(M, y, LABEL_W + CHART_W, rowH);

        doc.setTextColor(60, 60, 60);
        const textStartY = y + rowH / 2 + 2 - ((nameLines.length - 1) * NAME_LINE_H) / 2;
        nameLines.forEach((line, li) => doc.text(line, M + 5, textStartY + li * NAME_LINE_H));

        drawGridLines(y, rowH);

        if (act.start_date && act.end_date) {
            const sx = dateToX(String(act.start_date));
            const ex = dateToX(String(act.end_date));
            if (sx !== null && ex !== null && ex > sx) {
                const [r,g,b] = actColors[act.status] || BLUE;
                const BAR_H = ACT_H - 2.5;
                const barW = ex - sx;
                doc.setFillColor(r, g, b);
                doc.roundedRect(chartX + sx, y + (rowH - BAR_H) / 2, barW, BAR_H, 0.8, 0.8, "F");

                const progress = calculateActivityProgress(String(act.start_date), String(act.end_date));
                const label = `${progress}%`;
                const labelY = y + rowH / 2 + 1.2;
                doc.setFontSize(5.5);
                doc.setFont("helvetica", "bold");
                const labelW = doc.getTextWidth(label);

                if (barW >= labelW + 3) {
                    doc.setTextColor(255, 255, 255);
                    doc.text(label, chartX + sx + barW / 2, labelY, { align: "center" });
                } else if (sx + barW + labelW + 2 <= CHART_W) {
                    doc.setTextColor(60, 60, 60);
                    doc.text(label, chartX + sx + barW + 1.5, labelY);
                } else {
                    doc.setTextColor(60, 60, 60);
                    doc.text(label, chartX + sx - 1.5, labelY, { align: "right" });
                }
            }
        }

        y += rowH;
    });
}

function buildInstitutionDetailPDF(institution: Institution, withGantt = false, photos: InstitutionPhoto[] = []): { doc: jsPDF; filename: string } {
    const doc = new jsPDF("p", "mm", "a4");
    const PW  = doc.internal.pageSize.getWidth();   // 210
    const PH  = doc.internal.pageSize.getHeight();  // 297
    const M   = 12;
    const CW  = PW - 2 * M; // content width ~186mm
    const FOOTER_H = 10;
    const MAX_Y    = PH - FOOTER_H - 4;

    // ── Palette ──────────────────────────────────────────────
    const BLUE: [number, number, number]   = [19, 81, 180];
    const YELLOW: [number, number, number] = [255, 205, 7];

    const instStatusColors: Record<string, [number, number, number]> = {
        Concluído:        [22, 136, 33],
        "Em andamento":   [19, 81, 180],
        "Não iniciado":   [117, 117, 117],
        Atrasado:         [229, 34, 7],
        Pendente:         [255, 140, 0],
    };
    const actStatusColors: Record<string, [number, number, number]> = {
        Concluído:        [22, 136, 33],
        "Em andamento":   [19, 81, 180],
        Projetado:        [255, 140, 0],
        Planejado:        [255, 140, 0],
    };
    const equipChipColors: Record<string, [number, number, number]> = {
        simb:             [19,  81, 180],
        status:           [22, 136, 33],
        marca:            [180, 96, 0],
        quantidade:       [73,  80, 87],
        previsao_entrega: [14, 117, 116],
    };

    const fmt = (d: string | Date | undefined | null): string => {
        if (!d) return "—";
        try { return new Date(String(d)).toLocaleDateString("pt-BR"); } catch { return String(d); }
    };

    // ── drawChip: draws one chip, returns width consumed (including gap) ──
    const drawChip = (
        text: string,
        bg: [number, number, number],
        x: number,
        topY: number,
    ): number => {
        const PAD = 2.5;
        const H   = 5;
        doc.setFontSize(5.8);
        doc.setFont("helvetica", "bold");
        const tw = doc.getTextWidth(text.toUpperCase());
        const w  = tw + PAD * 2;
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.roundedRect(x, topY, w, H, 1.3, 1.3, "F");
        doc.setTextColor(255, 255, 255);
        doc.text(text.toUpperCase(), x + PAD, topY + 3.4);
        return w + 1.5;
    };

    // ── drawChipsRow: draws chips left-to-right with wrapping, returns total height ──
    const drawChipsRow = (
        chips: { text: string; color: [number, number, number] }[],
        x: number,
        topY: number,
        maxW: number,
    ): number => {
        const ROW_H = 6.5;
        let cx = x;
        let cy = topY;
        chips.forEach(({ text, color }) => {
            doc.setFontSize(5.8);
            doc.setFont("helvetica", "bold");
            const tw = doc.getTextWidth(text.toUpperCase());
            const chipW = tw + 5;
            if (cx + chipW > x + maxW + 0.5 && cx > x) {
                cx = x;
                cy += ROW_H;
            }
            cx += drawChip(text, color, cx, cy);
        });
        return cy - topY + ROW_H;
    };

    // ── measureTallField: wraps the value and computes the box height it needs ──
    const TALL_LINE_H = 4;
    const measureTallField = (value: string, w: number): { lines: string[]; height: number } => {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(value || "Nenhuma", w - 6) as string[];
        return { lines, height: Math.max(18, lines.length * TALL_LINE_H + 8) };
    };

    // ── drawField: outlined text-field style box ──
    const drawField = (
        label: string,
        value: string,
        x: number,
        y: number,
        w: number,
        tall = false,
    ): number => {
        let H = 11;
        let tallData: { lines: string[]; height: number } | null = null;
        if (tall) {
            tallData = measureTallField(value, w);
            H = tallData.height;
        }
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.35);
        doc.roundedRect(x, y, w, H, 1.2, 1.2, "FD");

        // small floating label inside box top
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(label, x + 3, y + 4);

        // value
        if (tall && tallData) {
            doc.setFontSize(8.5);
            doc.setFont("helvetica", value ? "normal" : "italic");
            doc.setTextColor(value ? 40 : 160, value ? 40 : 160, value ? 40 : 160);
            doc.text(tallData.lines, x + 3, y + 9);
        } else {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 30, 30);
            doc.text(value || "", x + 3, y + H - 3);
        }
        return H + 2.5;
    };

    // ── Continuation-page header (blue bar + institution name), mirrors the Gantt page header ──
    const HEADER_BAR_H = 19;
    const CONTENT_TOP = HEADER_BAR_H + 5;
    const drawContinuationHeader = () => {
        doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
        doc.rect(0, 0, PW, HEADER_BAR_H, "F");
        doc.setTextColor(YELLOW[0], YELLOW[1], YELLOW[2]);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Sistema de Monitoramento", M, 10);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(institution.name, M, 14);
    };

    // ── checkPage: add new page if needed, return new y ──
    const checkPage = (currentY: number, needed: number): number => {
        if (currentY + needed > MAX_Y) {
            doc.addPage();
            drawContinuationHeader();
            return CONTENT_TOP;
        }
        return currentY;
    };

    // ════════════════════════════════════════════════════════
    // PAGE HEADER
    // ════════════════════════════════════════════════════════
    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.rect(0, 0, PW, 22, "F");

    doc.setTextColor(YELLOW[0], YELLOW[1], YELLOW[2]);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Sistema de Monitoramento", M, 10);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Super Centro Brasil", M, 17);
    doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, PW - M, 17, { align: "right" });

    let y = 28;

    // ════════════════════════════════════════════════════════
    // DIALOG TITLE ROW  ("Detalhes da Instituição" + status chip)
    // ════════════════════════════════════════════════════════
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(222, 226, 230);
    doc.setLineWidth(0.35);
    doc.rect(M, y, CW, 10, "FD");

    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Detalhes da Instituição", M + 4, y + 7);

    // status chip (top-right of title bar)
    const [sr, sg, sb] = instStatusColors[institution.status] || [100, 100, 100];
    const stText = institution.status.toUpperCase();
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const stW = doc.getTextWidth(stText) + 6;
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(PW - M - stW - 2, y + 2, stW, 6, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(stText, PW - M - stW + 1, y + 6.3);

    y += 13;

    // ════════════════════════════════════════════════════════
    // FORM FIELDS
    // ════════════════════════════════════════════════════════

    // Nome da Instituição
    y += drawField("Nome da Instituição *", institution.name, M, y, CW);

    // Estado | Status  (side by side)
    const halfW = (CW - 3) / 2;
    drawField("Estado *",  institution.state  || "—", M,             y, halfW);
    drawField("Status *",  institution.status || "—", M + halfW + 3, y, halfW);
    y += 13.5;

    // Responsável
    y += drawField("Responsável *", institution.responsible || "—", M, y, CW);

    // Observações
    const obsValue = institution.observations || "";
    y = checkPage(y, measureTallField(obsValue, CW).height + 2.5);
    y += drawField("Observações", obsValue, M, y, CW, true);
    y += 2;

    // ════════════════════════════════════════════════════════
    // ATIVIDADES E CRONOGRAMA
    // ════════════════════════════════════════════════════════
    if (institution.activities && institution.activities.length > 0) {
        y = checkPage(y, 22);

        // Section header
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.35);
        doc.roundedRect(M, y, CW, 8, 1.5, 1.5, "FD");
        doc.setTextColor(73, 80, 87);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Atividades e Cronograma", M + 4, y + 5.6);
        y += 11;

        institution.activities.forEach((activity) => {
            const actColor = actStatusColors[activity.status] || BLUE;
            const chips: { text: string; color: [number, number, number] }[] = [
                { text: activity.status, color: actColor },
            ];
            if (activity.responsible)
                chips.push({ text: `Resp: ${activity.responsible}`, color: BLUE });
            if (activity.start_date && activity.end_date)
                chips.push({ text: `${fmt(activity.start_date)} – ${fmt(activity.end_date)}`, color: [22, 136, 33] });

            // pre-measure chip rows to know card height
            let cx2 = 0;
            let rows = 1;
            chips.forEach(({ text }) => {
                doc.setFontSize(5.8);
                doc.setFont("helvetica", "bold");
                const cw = doc.getTextWidth(text.toUpperCase()) + 5;
                if (cx2 + cw > CW - 8 && cx2 > 0) { rows++; cx2 = cw + 1.5; }
                else cx2 += cw + 1.5;
            });

            // pre-measure observations lines
            let obsLines: string[] = [];
            if (activity.observation && activity.observation.length > 0) {
                doc.setFontSize(7.5);
                doc.setFont("helvetica", "normal");
                const obsText = activity.observation
                    .map((o) => `${new Date(o.date_observation).toLocaleDateString("pt-BR", { timeZone: "UTC" })}: ${o.text_observation}`)
                    .join(" | ");
                obsLines = doc.splitTextToSize(obsText, CW - 10) as string[];
            }
            const obsH = obsLines.length > 0 ? obsLines.length * 4.5 + 11 : 0;

            const CARD_H = 9 + rows * 6.5 + obsH;
            y = checkPage(y, CARD_H + 2);

            // White card
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.35);
            doc.roundedRect(M, y, CW, CARD_H, 1.5, 1.5, "FD");

            // Activity name
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "bold");
            doc.text((doc.splitTextToSize(activity.name, CW - 8) as string[])[0], M + 4, y + 6);

            // Chips
            const chipsBottomY = y + 8.5 + (rows - 1) * 6.5;
            drawChipsRow(chips, M + 4, y + 8.5, CW - 8);

            // Observações (abaixo dos chips)
            if (obsLines.length > 0) {
                doc.setFontSize(6);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text("OBSERVAÇÕES DA ATIVIDADE", M + 5, chipsBottomY + 12);

                doc.setFontSize(7.5);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(40, 40, 40);
                doc.text(obsLines, M + 5, chipsBottomY + 17);
            }

            y += CARD_H + 2;
        });
        y += 2;
    }

    // ════════════════════════════════════════════════════════
    // EQUIPAMENTOS
    // ════════════════════════════════════════════════════════
    if (institution.machine && institution.machine.length > 0) {
        y = checkPage(y, 22);

        // Section header
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.35);
        doc.roundedRect(M, y, CW, 8, 1.5, 1.5, "FD");
        doc.setTextColor(73, 80, 87);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Equipamentos", M + 4, y + 5.6);
        y += 11;

        institution.machine.forEach((m) => {
            const chips: { text: string; color: [number, number, number] }[] = [];
            if (m.simb)             chips.push({ text: `Simb: ${m.simb}`,                 color: equipChipColors.simb });
            if (m.status)           chips.push({ text: `Status: ${m.status}`,              color: equipChipColors.status });
            if (m.marca)            chips.push({ text: `Marca: ${m.marca}`,                color: equipChipColors.marca });
            chips.push(             { text: `Quantidade: ${m.quantidade}`,                  color: equipChipColors.quantidade });
            if (m.previsao_entrega) chips.push({ text: `Previsão: ${fmt(String(m.previsao_entrega))}`, color: equipChipColors.previsao_entrega });

            let cx2 = 0;
            let rows = 1;
            chips.forEach(({ text }) => {
                doc.setFontSize(5.8);
                doc.setFont("helvetica", "bold");
                const cw = doc.getTextWidth(text.toUpperCase()) + 5;
                if (cx2 + cw > CW - 8 && cx2 > 0) { rows++; cx2 = cw + 1.5; }
                else cx2 += cw + 1.5;
            });
            const CARD_H = 9 + rows * 6.5;
            y = checkPage(y, CARD_H + 2);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.35);
            doc.roundedRect(M, y, CW, CARD_H, 1.5, 1.5, "FD");

            doc.setTextColor(30, 30, 30);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "bold");
            doc.text((doc.splitTextToSize(m.descricao || m.simb, CW - 8) as string[])[0], M + 4, y + 6);

            drawChipsRow(chips, M + 4, y + 8.5, CW - 8);
            y += CARD_H + 2;
        });
    }

    // ════════════════════════════════════════════════════════
    // GALERIA DE FOTOS
    // ════════════════════════════════════════════════════════
    if (photos.length > 0) {
        y = checkPage(y, 22);

        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.35);
        doc.roundedRect(M, y, CW, 8, 1.5, 1.5, "FD");
        doc.setTextColor(73, 80, 87);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Galeria de Fotos", M + 4, y + 5.6);
        y += 11;

        const GAP = 4;
        const THUMB = 40;
        const cols = Math.max(1, Math.floor((CW + GAP) / (THUMB + GAP)));
        const ROW_H = THUMB + 7;

        photos.forEach((photo, idx) => {
            const col = idx % cols;
            if (col === 0) y = checkPage(y, ROW_H + 2);

            const x = M + col * (THUMB + GAP);
            const dataUrl = photoToDataUrl(photo);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            if (dataUrl) {
                try {
                    doc.addImage(dataUrl, imageFormatFromMime(photo.mime_type), x, y, THUMB, THUMB);
                } catch {
                    doc.setFillColor(233, 236, 239);
                    doc.rect(x, y, THUMB, THUMB, "F");
                }
            } else {
                doc.setFillColor(233, 236, 239);
                doc.rect(x, y, THUMB, THUMB, "F");
            }
            doc.rect(x, y, THUMB, THUMB);

            doc.setTextColor(120, 120, 120);
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.text(fmt(photo.created_at), x + THUMB / 2, y + THUMB + 3.5, { align: "center" });

            if (col === cols - 1 || idx === photos.length - 1) y += ROW_H;
        });
        y += 2;
    }

    // ════════════════════════════════════════════════════════
    // FOOTER  (todas as páginas)
    // ════════════════════════════════════════════════════════
    const pageCount = (doc as unknown as DocWithPages).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 249, 250);
        doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.3);
        doc.line(0, PH - FOOTER_H, PW, PH - FOOTER_H);
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(
            "Ministério da Saúde — DECAN © 2026 | Sistema de Monitoramento",
            PW / 2, PH - 3.5, { align: "center" }
        );
        if (pageCount > 1)
            doc.text(`${i} / ${pageCount}`, PW - M, PH - 3.5, { align: "right" });
    }

    if (withGantt) drawGanttPage(doc, institution);

    const slug = institution.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40);
    const filename = `${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return { doc, filename };
}

export function exportInstitutionDetailPDF(institution: Institution, withGantt = false, photos: InstitutionPhoto[] = []) {
    const { doc, filename } = buildInstitutionDetailPDF(institution, withGantt, photos);
    doc.save(filename);
}

export function previewInstitutionDetailPDF(institution: Institution, withGantt = false, photos: InstitutionPhoto[] = []): { url: string; download: () => void } {
    const { doc, filename } = buildInstitutionDetailPDF(institution, withGantt, photos);
    const url = doc.output("bloburl") as unknown as string;
    return { url, download: () => doc.save(filename) };
}

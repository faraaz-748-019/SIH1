import io
import json
from typing import Dict, Any, List
from datetime import datetime

def generate_json_report(scan_data: Dict[str, Any]) -> str:
    """Returns formatted JSON report string"""
    report = {
        "report_type": "CRYPTOSCOPE_CRYPTOGRAPHIC_BILL_OF_MATERIALS (CBOM)",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "tool": "CRYPTOSCOPE v2.4 (Enterprise PQC Discovery Engine)",
        "scan_summary": scan_data.get("summary", {}),
        "cryptographic_assets": scan_data.get("findings", []),
        "pqc_migration_roadmap": [
            {
                "asset_id": f["asset_id"],
                "algorithm": f["algorithm"],
                "criticality": f["criticality"],
                "location": f"{f['location']['file']}:{f['location']['line']}",
                "recommendation": f.get("migration_recommendation", {})
            }
            for f in scan_data.get("findings", [])
            if f.get("criticality") in ["critical", "high", "medium"]
        ]
    }
    return json.dumps(report, indent=2)

def generate_pdf_report(scan_data: Dict[str, Any]) -> bytes:
    """Generates a professional PDF report using ReportLab"""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header
    story.append(Paragraph("CRYPTOSCOPE | Cryptographic Discovery & PQC Risk Report", title_style))
    story.append(Paragraph(f"Standardized CBOM & Post-Quantum Cryptographic Readiness Assessment • Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=15))

    summary = scan_data.get("summary", {})
    findings = scan_data.get("findings", [])

    # Executive Summary Box
    summary_data = [
        [
            Paragraph(f"<b>Target:</b> {summary.get('scan_name', 'Enterprise Repo')}", body_style),
            Paragraph(f"<b>Files Scanned:</b> {summary.get('total_files_scanned', 0)}", body_style),
            Paragraph(f"<b>Crypto Assets:</b> {summary.get('total_crypto_assets', 0)}", body_style)
        ],
        [
            Paragraph(f"<b>Critical Risks:</b> <font color='#EF4444'><b>{summary.get('critical_count', 0)}</b></font>", body_style),
            Paragraph(f"<b>High Risks:</b> <font color='#F97316'><b>{summary.get('high_count', 0)}</b></font>", body_style),
            Paragraph(f"<b>PQC Readiness:</b> <font color='#10B981'><b>{summary.get('pqc_readiness_score', 0):.1f}%</b></font>", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[180, 180, 180])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # Findings Table
    story.append(Paragraph("Inventory of Cryptographic Assets & Risk Scoring", h2_style))
    
    table_headers = ["Asset / Algorithm", "Type", "Risk Tier", "PQC Status", "Location", "Recommended Migration"]
    table_rows = [[Paragraph(f"<b>{h}</b>", body_style) for h in table_headers]]

    for f in findings[:25]:  # include top findings
        crit = f.get("criticality", "medium").upper()
        crit_color = "#EF4444" if crit == "CRITICAL" else ("#F97316" if crit == "HIGH" else ("#EAB308" if crit == "MEDIUM" else "#10B981"))
        
        mig = f.get("migration_recommendation", {})
        rec_text = mig.get("recommended_pqc", "N/A")

        table_rows.append([
            Paragraph(f"<b>{f.get('algorithm', 'N/A')}</b>", body_style),
            Paragraph(f.get("type", "algo"), body_style),
            Paragraph(f"<font color='{crit_color}'><b>{crit}</b></font>", body_style),
            Paragraph(f.get("pqc_classification", "N/A"), body_style),
            Paragraph(f"{f['location']['file']}:{f['location']['line']}", code_style),
            Paragraph(rec_text[:35] + "..." if len(rec_text) > 35 else rec_text, body_style)
        ])

    findings_table = Table(table_rows, colWidths=[100, 60, 60, 95, 110, 115])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(findings_table)
    story.append(Spacer(1, 15))

    # PQC Guidance Section
    story.append(Paragraph("Post-Quantum Migration Blueprint (NIST FIPS 203/204)", h2_style))
    story.append(Paragraph("According to Mosca's Theorem (X + Y > Z), enterprise data lifetime coupled with multi-year migration cycles necessitates migrating key encapsulation to ML-KEM and digital signatures to ML-DSA immediately to prevent Harvest-Now-Decrypt-Later exploits.", body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

# Report Generation Files - Forensic Writer

## Purpose
These files contain the working report generation system with LLM integration using a structured HTML prompt. Copy these files to replace the corresponding files in your friend's zip to fix the report generation.

## Files to Replace

### Backend Files (replace in `server/src/`):
1. **services/aiAnalysisService.js** - AI analysis service with LLM integration (UPDATED with new HTML prompt)
2. **services/imageAnalysisService.js** - Image analysis service
3. **services/pdfReportService.js** - PDF report generation service
4. **controllers/aiController.js** - AI controller for API routes
5. **routes/imageAnalysis.js** - Image analysis routes
6. **routes/simpleAiRoutes.js** - Simple AI routes

### Frontend Files (replace in `client/src/pages/`):
1. **AIInvestigator.jsx** - AI investigation component for report generation

## Key Changes Made

### 1. New Structured HTML Prompt
- **Prompt Type:** Court-ready HTML report generation with embedded CSS
- **Output Format:** Complete HTML file with styling (no markdown, no PDF generation needed)
- **Evidence Structure:** JSON-based evidence data passed to LLM
- **Sections:** Introduction, Evidence Summary, Image Analysis Findings (if applicable), Technical Findings, Timeline, Observations, Conclusion, Recommendations

### 2. LLM Model & API
- **Model:** `meta-llama/Llama-3.1-8B-Instruct`
- **API:** HuggingFace Inference API (NOT Router API)
- **Endpoint:** `https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct`
- **Note:** Uses `inputs` parameter (not `messages` like Router API)

### 3. Report Format
The LLM generates a complete HTML report with:
- Blue header banner with "Forensic Investigation Report"
- Case metadata table (Case Name, Case ID, Date, Investigator, Evidence Type, Report Status)
- Evidence summary with SHA-256 hash integrity box
- Evidence table with status badges
- Image Analysis Findings (if image evidence exists)
- Technical Findings (file analysis, IP addresses, error events)
- Timeline of Events (if timestamps exist)
- Observations
- Conclusion box
- Numbered recommendations
- Note box with disclaimer
- Footer with case ID and generation date

### 4. Evidence Data Structure
The LLM receives evidence in this JSON format:
```json
{
  "caseId": "CASE-1234567890",
  "caseName": "Case Name",
  "investigatorName": "AI Investigator",
  "date": "2026-04-24",
  "evidence_type": "image only / file only / image and file",
  "sha256_hash": "abc123...",
  "analyzed_at": "2026-04-24T...",
  "image_evidence": {
    "filename": "image.jpg",
    "dominant_scene": { "label": "car accident", "confidence": 0.95 },
    "detected_by": "ViT + DETR Models",
    "high_confidence_detection": [...]
  },
  "file_evidence": {
    "filename": "log.txt",
    "summary_for_report": "File analyzed with X anomalies",
    "total_lines": 100,
    "ip_addresses_found": ["192.168.1.1"],
    "error_events": 5,
    "timestamps_found": ["2026-04-24", ...]
  }
}
```

### 5. Configuration Requirements
**IMPORTANT:** The `.env` file must contain:
```
HUGGINGFACE_API_KEY=your_valid_huggingface_token
```

Without a valid API key, the LLM will fail to generate reports.

### 6. DNS Requirements
The system requires DNS resolution for `huggingface.co`. If DNS fails:
- Change DNS to Google DNS: `8.8.8.8` and `8.8.4.4`
- Or add to hosts file: `99.86.147.108 huggingface.co`

## Troubleshooting

### LLM API Returns "Invalid username or password"
- Check `HUGGINGFACE_API_KEY` in `.env` is valid
- Get free token from: https://huggingface.co/settings/tokens

### LLM API Returns "model_not_supported"
- Ensure model is `meta-llama/Llama-3.1-8B-Instruct` (NOT `Llama-3.2-3B-Instruct`)

### DNS Resolution Fails
- Change DNS servers to Google DNS (8.8.8.8, 8.8.4.4)
- Or add IP to hosts file

### Report Shows Generic Text Instead of LLM Analysis
- Check server logs for LLM API errors
- Verify evidence JSON is being built correctly
- Check that `buildEvidenceJSON` is extracting data properly

### HTML Output Not Styled
- Verify CSS is being wrapped correctly with `wrapReportWithCSS`
- Check that LLM is outputting valid HTML (not markdown)

## Testing
After replacing files:
1. Restart the server
2. Upload evidence (log files or images)
3. Generate report via AI Investigator
4. Verify report is complete HTML with styling
5. Check that all sections are present and filled with actual evidence data

## System Status (Working Configuration)
- Image analysis: Working ✓
- LLM report generation: Working ✓
- Model: `meta-llama/Llama-3.1-8B-Instruct` ✓
- API: HuggingFace Inference API ✓
- DNS: Resolving huggingface.co ✓
- Output: Complete HTML with CSS styling ✓

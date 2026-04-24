// ============================================================
//  ForensiQ — Image Analysis Pipeline (UPGRADED)
//  imageAnalysis.js
//
//  Handles:
//  1. Image-only upload  → CNN Models → JSON → LLaMA3 → Report
//  2. File-only upload   → Parse → JSON → LLaMA3 → Report
//  3. Both uploads       → Merge JSON → LLaMA3 → Report
//
//  Models used (ALL confirmed working with free HuggingFace API):
//  - google/vit-base-patch16-224     → General scene classification
//  - microsoft/resnet-50             → Scene/object recognition
//  - facebook/detr-resnet-50         → Object detection (vehicles, people, debris)
//  - Falconsai/nsfw_image_detection  → Anomaly / sensitive content detection
//  - meta-llama/Llama-3.1-8B-Instruct → Report generation
// ============================================================

const express = require("express");
const multer  = require("multer");
const fs      = require("fs");
const crypto  = require("crypto");
const axios   = require("axios");
const path    = require("path");

const router = express.Router();

// ─────────────────────────────────────────────
//  MULTER STORAGE
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/jpg", "image/webp",
      "text/plain", "application/json",
      "text/csv", "application/octet-stream",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// ─────────────────────────────────────────────
//  HuggingFace CONFIG
// ─────────────────────────────────────────────
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const HF_BASE  = "https://api-inference.huggingface.co/models";

const MODELS = {
  SCENE:     `${HF_BASE}/google/vit-base-patch16-224`,
  OBJECT:    `${HF_BASE}/microsoft/resnet-50`,
  DETECTION: `${HF_BASE}/facebook/detr-resnet-50`,
  ANOMALY:   `${HF_BASE}/Falconsai/nsfw_image_detection`,
  LLAMA3:    `${HF_BASE}/meta-llama/Llama-3.1-8B-Instruct`,
};

// ─────────────────────────────────────────────
//  STEP 1 — SHA-256 Hash
// ─────────────────────────────────────────────
function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// ─────────────────────────────────────────────
//  STEP 2A — Call HuggingFace model with retry
// ─────────────────────────────────────────────
async function callHFModel(modelUrl, imageData, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(modelUrl, imageData, {
        headers: {
          Authorization:  `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        timeout: 40000,
      });
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 503 && attempt < retries) {
        // Model cold start — wait and retry
        await new Promise((r) => setTimeout(r, 20000));
      } else {
        return null;
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────
//  STEP 2B — Run ALL 4 image models in parallel
// ─────────────────────────────────────────────
async function analyzeImage(imagePath, filename) {
  const imageData = fs.readFileSync(imagePath);

  const [sceneResult, objectResult, detectionResult, anomalyResult] =
    await Promise.all([
      callHFModel(MODELS.SCENE,     imageData),
      callHFModel(MODELS.OBJECT,    imageData),
      callHFModel(MODELS.DETECTION, imageData),
      callHFModel(MODELS.ANOMALY,   imageData),
    ]);

  const topN = (result, n = 3) => {
    if (!result || !Array.isArray(result)) return [];
    return result
      .filter((r) => r.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((r) => ({
        label:      r.label,
        confidence: parseFloat((r.score * 100).toFixed(1)) + "%",
        score:      parseFloat(r.score.toFixed(4)),
      }));
  };

  const modelResults = {
    scene_classification: {
      model:      "google/vit-base-patch16-224",
      purpose:    "General scene and environment identification",
      top_labels: topN(sceneResult, 5),
      status:     sceneResult ? "success" : "unavailable",
    },
    object_recognition: {
      model:      "microsoft/resnet-50",
      purpose:    "Specific object recognition",
      top_labels: topN(objectResult, 5),
      status:     objectResult ? "success" : "unavailable",
    },
    object_detection: {
      model:   "facebook/detr-resnet-50",
      purpose: "Object detection with location data",
      detected_objects: Array.isArray(detectionResult)
        ? detectionResult
            .filter((d) => d.score > 0.5)
            .map((d) => ({
              label:      d.label,
              confidence: parseFloat((d.score * 100).toFixed(1)) + "%",
              location:   d.box || null,
            }))
        : [],
      status: detectionResult ? "success" : "unavailable",
    },
    anomaly_detection: {
      model:      "Falconsai/nsfw_image_detection",
      purpose:    "Sensitive content and anomaly detection",
      top_labels: topN(anomalyResult, 3),
      status:     anomalyResult ? "success" : "unavailable",
    },
  };

  const allLabels = [
    ...topN(sceneResult, 3),
    ...topN(objectResult, 3),
  ].sort((a, b) => b.score - a.score);

  const dominantScene = allLabels[0] || { label: "Unknown", score: 0, confidence: "0%" };

  return {
    source:       "image_analysis",
    filename,
    sha256_hash:  computeHash(imagePath),
    analyzed_at:  new Date().toISOString(),
    dominant_scene: {
      scene_type:  dominantScene.label,
      confidence:  dominantScene.confidence,
      score:       dominantScene.score,
    },
    model_results,
    high_confidence_detections: allLabels.filter((l) => l.score > 0.6),
    summary_for_report:
      `Image classified as "${dominantScene.label}" with ${dominantScene.confidence} confidence. ` +
      `Objects detected: ${modelResults.object_detection.detected_objects.map((o) => o.label).join(", ") || "none"}.`,
  };
}

// ─────────────────────────────────────────────
//  STEP 3 — Parse Text/Log/CSV File into JSON
// ─────────────────────────────────────────────
function parseForensicFile(filePath, filename) {
  const raw   = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim() !== "");

  const timestampRegex =
    /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}|\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/g;
  const timestamps = [...raw.matchAll(timestampRegex)].map((m) => m[0]);

  const ipRegex = /\b(\d{1,3}\.){3}\d{1,3}\b/g;
  const ips     = [...new Set([...raw.matchAll(ipRegex)].map((m) => m[0]))];

  const errorKeywords = [
    "error", "fail", "failed", "denied", "unauthorized",
    "exception", "crash", "invalid", "blocked", "timeout",
    "breach", "attack", "intrusion", "malware", "suspicious",
  ];
  const errorLines = lines.filter((l) =>
    errorKeywords.some((k) => l.toLowerCase().includes(k))
  );

  const actionKeywords = ["login", "logout", "access", "delete", "upload", "download", "execute", "modify"];
  const actionLines = lines.filter((l) =>
    actionKeywords.some((k) => l.toLowerCase().includes(k))
  );

  return {
    source:             "file_analysis",
    filename,
    sha256_hash:        computeHash(filePath),
    analyzed_at:        new Date().toISOString(),
    total_lines:        lines.length,
    timestamps_found:   timestamps.slice(0, 20),
    ip_addresses_found: ips,
    error_events:       errorLines.slice(0, 10),
    user_actions:       actionLines.slice(0, 10),
    raw_preview:        lines.slice(0, 40).join("\n"),
    summary_for_report:
      `File contains ${lines.length} lines. ` +
      `Timestamps: ${timestamps.length}. ` +
      `IPs found: ${ips.length > 0 ? ips.join(", ") : "none"}. ` +
      `Error events: ${errorLines.length}. ` +
      `User actions: ${actionLines.length}.`,
  };
}

// ─────────────────────────────────────────────
//  STEP 4 — Merge image + file evidence
// ─────────────────────────────────────────────
function mergeEvidenceJSON(imageData, fileData) {
  return {
    evidence_type:
      imageData && fileData ? "image_and_file"
      : imageData           ? "image_only"
      :                       "file_only",
    generated_at:     new Date().toISOString(),
    image_evidence:   imageData || null,
    file_evidence:    fileData  || null,
    combined_summary: [imageData?.summary_for_report, fileData?.summary_for_report]
      .filter(Boolean)
      .join(" | "),
  };
}

// ─────────────────────────────────────────────
//  STEP 5 — Build LLaMA 3 Prompt
// ─────────────────────────────────────────────
function buildForensicPrompt(combinedJSON, caseId, investigatorName, caseName) {
  const date         = new Date().toISOString().split("T")[0];
  const evidenceType = combinedJSON.evidence_type;

  let evidenceSections = "";

  if (combinedJSON.image_evidence) {
    const img = combinedJSON.image_evidence;
    evidenceSections += `
IMAGE EVIDENCE:
- Filename: ${img.filename}
- SHA-256 Hash: ${img.sha256_hash}
- Analyzed At: ${img.analyzed_at}
- Dominant Scene Detected: ${img.dominant_scene?.scene_type} (${img.dominant_scene?.confidence} confidence)
- High Confidence Detections: ${img.high_confidence_detections?.map(d => `${d.label} (${d.confidence})`).join(", ") || "None above threshold"}
- Objects Detected: ${img.model_results?.object_detection?.detected_objects?.map(o => o.label).join(", ") || "None"}
- Scene Classification Top Results: ${img.model_results?.scene_classification?.top_labels?.map(l => `${l.label} (${l.confidence})`).join(", ") || "N/A"}
- Full Summary: ${img.summary_for_report}`;
  }

  if (combinedJSON.file_evidence) {
    const file = combinedJSON.file_evidence;
    evidenceSections += `
FILE EVIDENCE:
- Filename: ${file.filename}
- SHA-256 Hash: ${file.sha256_hash}
- Analyzed At: ${file.analyzed_at}
- Total Lines: ${file.total_lines}
- Timestamps Found: ${file.timestamps_found?.length > 0 ? file.timestamps_found.slice(0, 5).join(", ") : "None found"}
- IP Addresses Found: ${file.ip_addresses_found?.length > 0 ? file.ip_addresses_found.join(", ") : "None found"}
- Error Events (${file.error_events?.length || 0} total): ${file.error_events?.slice(0, 3).join(" | ") || "None"}
- User Actions (${file.user_actions?.length || 0} total): ${file.user_actions?.slice(0, 3).join(" | ") || "None"}
- File Content Preview (first lines): ${file.raw_preview?.slice(0, 500) || "N/A"}
- Full Summary: ${file.summary_for_report}`;
  }

  return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are ForensiQ Writer AI, a professional digital forensic report generator. Your job is to write a formal, structured forensic investigation report using ONLY the evidence data provided.

CRITICAL RULES:
1. Use ONLY the data provided below. Do not add any facts, assumptions, or conclusions not supported by the data.
2. If a section has no data (e.g., no timestamps found), write "No [item] were identified in the provided evidence."
3. Use formal, neutral, court-appropriate language throughout.
4. Never accuse. Never speculate. State only what the data shows.
5. Always include SHA-256 hash values exactly as provided.
6. End the report with exactly: "Generated by Forensic Writer AI  Page 1 of 1"
<|eot_id|><|start_header_id|>user<|end_header_id|>
Generate a forensic investigation report using this case information and evidence data:

CASE INFORMATION:
- Case Name: ${caseName || caseId}
- Case ID: ${caseId}
- Date: ${date}
- Investigator: ${investigatorName}
- Evidence Type: ${evidenceType.replace(/_/g, " ")}
${evidenceSections}

Write the report in this EXACT format with these EXACT section headings:

FORENSIC INVESTIGATION REPORT
Case Name: [case name]
Case ID: [case id]
Date: [date]
Investigator: [name]

Report Findings:

**Case Report: [case name]**
**Case Name:** [case name]
**Incident Date:** [date]

**Introduction:**
[2-3 sentences. State what was analyzed, who conducted the analysis, and the purpose. Reference the exact filename(s) and SHA-256 hash(es).]

**Evidence Summary:**
[Bullet list of all evidence items. For each: filename, SHA-256 hash, file type, and integrity status.]

**Technical Findings:**
[Detailed findings from the analysis. For image: scene detected, confidence, objects found, model results. For file: line count, timestamps, IPs, errors, user actions. Use bullet points. Only state what the data shows.]

**Timeline:**
[List any timestamps found in chronological order. If no timestamps, write: "No timestamps were found in the provided evidence."]

**Conclusion:**
[2-3 sentences summarizing what was found. Neutral tone. No accusations. Based only on evidence.]

**Recommendations:**
[3 bullet point recommendations based on the findings — storage, review, backup, or further investigation steps.]

**Note:**
This report is based solely on the provided data and does not include any additional information or assumptions. The findings of this analysis are limited to the technical information contained within the evidence.

Generated by Forensic Writer AI  Page 1 of 1
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
}

// ─────────────────────────────────────────────
//  STEP 6 — Call LLaMA 3 to Generate Report
// ─────────────────────────────────────────────
async function generateReport(prompt) {
  if (!HF_TOKEN) return null;

  try {
    const response = await axios.post(
      MODELS.LLAMA3,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens:     1800,
          temperature:        0.1,
          top_p:              0.9,
          repetition_penalty: 1.1,
          return_full_text:   false,
        },
      },
      {
        headers: {
          Authorization:  `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 90000,
      }
    );

    const reportText =
      response.data?.[0]?.generated_text ||
      response.data?.generated_text ||
      null;

    return reportText ? reportText.trim() : null;
  } catch (err) {
    const status = err.response?.status;
    if (status === 503 || status === 504) return null; // handled by fallback
    throw new Error("Report generation failed: " + err.message);
  }
}

// ─────────────────────────────────────────────
//  FALLBACK — Structured report without LLaMA
// ─────────────────────────────────────────────
function generateFallbackReport(combinedJSON, caseId, investigatorName, caseName) {
  const date = new Date().toISOString().split("T")[0];
  const img  = combinedJSON.image_evidence;
  const file = combinedJSON.file_evidence;
  const name = caseName || caseId;

  let technicalFindings = "";
  let timeline          = "No timestamps were found in the provided evidence.";
  let evidenceSummary   = "";

  if (img) {
    evidenceSummary   += `* File Name: ${img.filename}\n* SHA-256 Hash Value: ${img.sha256_hash}\n`;
    technicalFindings += `* The image was analyzed using 4 AI models (ViT, ResNet-50, DETR, anomaly detection).\n`;
    technicalFindings += `* Dominant scene detected: ${img.dominant_scene?.scene_type} (${img.dominant_scene?.confidence} confidence).\n`;
    if (img.model_results?.object_detection?.detected_objects?.length > 0) {
      technicalFindings += `* Objects detected: ${img.model_results.object_detection.detected_objects.map(o => o.label).join(", ")}.\n`;
    }
  }

  if (file) {
    evidenceSummary   += `* File Name: ${file.filename}\n* SHA-256 Hash Value: ${file.sha256_hash}\n`;
    technicalFindings += `* The file contains ${file.total_lines} lines of text data.\n`;
    technicalFindings += `* IP addresses found: ${file.ip_addresses_found?.join(", ") || "None"}.\n`;
    technicalFindings += `* Error events identified: ${file.error_events?.length || 0}.\n`;
    if (file.timestamps_found?.length > 0) {
      timeline = file.timestamps_found.slice(0, 10).map((t, i) => `${i + 1}. ${t}`).join("\n");
    }
  }

  return `FORENSIC INVESTIGATION REPORT
Case Name: ${name}
Case ID: ${caseId}
Date: ${date}
Investigator: ${investigatorName}

Report Findings:

**Case Report: ${name}**
**Case Name:** ${name}
**Incident Date:** ${date}

**Introduction:**
This digital forensic analysis was conducted on the submitted evidence with Case ID: ${caseId}. The investigation was performed by ${investigatorName} on ${date}. The purpose of this analysis is to identify and document any relevant technical findings related to the submitted evidence.

**Evidence Summary:**
${evidenceSummary || "* No evidence items found."}

**Technical Findings:**
${technicalFindings || "* No technical findings could be extracted from the evidence."}

**Timeline:**
${timeline}

**Conclusion:**
The analysis of the submitted evidence has been completed and findings are documented above. All SHA-256 hash values have been recorded to ensure evidence integrity. The report presents only factual findings derived from the submitted data.

**Recommendations:**
* The evidence should be reviewed by a qualified forensic investigator for further analysis.
* All evidence files should be stored in a secure, access-controlled location to prevent tampering.
* The evidence should be backed up regularly to prevent data loss in case of a system failure.

**Note:**
This report is based solely on the provided data and does not include any additional information or assumptions. The findings of this analysis are limited to the technical information contained within the evidence.

Generated by Forensic Writer AI  Page 1 of 1`;
}

// ─────────────────────────────────────────────
//  MAIN ROUTE — POST /api/analyze
// ─────────────────────────────────────────────
router.post(
  "/",
  upload.fields([
    { name: "image",    maxCount: 1 },
    { name: "dataFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { caseId, investigatorName, caseName } = req.body;
      const imageFile = req.files?.image?.[0];
      const dataFile  = req.files?.dataFile?.[0];

      if (!imageFile && !dataFile) {
        return res.status(400).json({ error: "At least one file required." });
      }
      if (!caseId) {
        return res.status(400).json({ error: "caseId is required." });
      }

      const imageDataJSON = imageFile
        ? await analyzeImage(imageFile.path, imageFile.originalname)
        : null;

      const fileDataJSON = dataFile
        ? parseForensicFile(dataFile.path, dataFile.originalname)
        : null;

      const combinedEvidence = mergeEvidenceJSON(imageDataJSON, fileDataJSON);
      const prompt           = buildForensicPrompt(combinedEvidence, caseId, investigatorName || "Investigator", caseName);
      let   reportText       = await generateReport(prompt);

      if (!reportText) {
        reportText = generateFallbackReport(combinedEvidence, caseId, investigatorName || "Investigator", caseName);
      }

      // Cleanup temp files
      if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
      if (dataFile  && fs.existsSync(dataFile.path))  fs.unlinkSync(dataFile.path);

      return res.status(200).json({
        success:           true,
        caseId,
        evidence_type:     combinedEvidence.evidence_type,
        image_analysis:    imageDataJSON,
        file_analysis:     fileDataJSON,
        combined_evidence: combinedEvidence,
        forensic_report:   reportText,
        generated_at:      new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  EXTRA ROUTE — POST /api/analyze/image-only
// ─────────────────────────────────────────────
router.post(
  "/image-only",
  upload.single("image"),
  async (req, res) => {
    try {
      const { caseId, investigatorName, caseName } = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(400).json({ error: "Image file is required." });
      }

      const imageDataJSON    = await analyzeImage(imageFile.path, imageFile.originalname);
      const combinedEvidence = mergeEvidenceJSON(imageDataJSON, null);
      const prompt           = buildForensicPrompt(combinedEvidence, caseId || "IMG-" + Date.now(), investigatorName || "Investigator", caseName);
      let   reportText       = await generateReport(prompt);

      if (!reportText) {
        reportText = generateFallbackReport(combinedEvidence, caseId, investigatorName || "Investigator", caseName);
      }

      if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);

      return res.status(200).json({
        success:         true,
        caseId,
        evidence_type:   "image_only",
        image_analysis:  imageDataJSON,
        forensic_report: reportText,
        generated_at:    new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

// idscanner.js - Lightweight OCR ID & Vehicle Info Extractor Plugin

const IDScanner = (() => {
  const GOOGLE_VISION_API_KEY = 'PASTE_YOUR_API_KEY_HERE'; // Replace in your usage

  async function parseFromImage(file, mode = 'auto') {
    const base64 = await toBase64(file);
    let text = '';

    if (mode === 'online') {
      text = await useVisionAPI(base64);
    } else if (mode === 'offline') {
      text = await useTesseract(base64);
    } else {
      try {
        text = await useVisionAPI(base64);
      } catch {
        text = await useTesseract(base64);
      }
    }
    return parseIDText(text);
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function useVisionAPI(base64) {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ image: { content: base64 }, features: [{ type: "TEXT_DETECTION" }] }]
      })
    });
    const data = await response.json();
    if (!data.responses[0]?.fullTextAnnotation?.text) {
      throw new Error("No text found by Vision API");
    }
    return data.responses[0].fullTextAnnotation.text;
  }

  async function useTesseract(base64) {
    const { createWorker } = Tesseract;
    const result = await Tesseract.recognize("data:image/jpeg;base64," + base64, 'eng');
    return result.data.text;
  }

  function parseIDText(text) {
    const data = { rawText: text.trim() };
    const aadhaarMatch = text.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
    const panMatch = text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/);
    const dlMatch = text.match(/\b[A-Z]{2}[\s-]?\d{2}[\s-]?\d{4,14}\b/);
    const regMatch = text.match(/\b[A-Z]{2}\d{2}[A-Z]{0,2}\d{4}\b/);

    if (aadhaarMatch) {
      data.aadhaarNumber = aadhaarMatch[0];
      const dob = text.match(/\b(\d{2}[\/-]\d{2}[\/-]\d{4}|\d{4})\b/i);
      data.aadhaarDOB = dob ? dob[0] : null;
      const gender = text.match(/\bMale|Female|Other\b/i);
      data.aadhaarGender = gender ? gender[0] : null;
    }

    if (panMatch) {
      data.panNumber = panMatch[0];
    }

    if (dlMatch) {
      data.drivingLicense = { number: dlMatch[0] };
      const validTill = text.match(/Valid Till[:\s]*([\d\/-]{8,10})/i);
      if (validTill) data.drivingLicense.validTill = validTill[1];
    }

    if (regMatch) {
      data.vehicle = { regNumber: regMatch[0] };
      const model = text.match(/\b(Maruti|Tata|Honda|Hyundai|Toyota|Kia)\s+\w+/i);
      if (model) data.vehicle.model = model[0];
      const pollution = text.match(/Pollution.*Valid.*([\d\/-]{8,10})/i);
      if (pollution) data.vehicle.pollutionValidTill = pollution[1];
    }

    return data;
  }

  return { parseFromImage };
})();

if (typeof window !== 'undefined') {
  window.IDScanner = IDScanner;
}

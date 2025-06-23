# 📷 ELI IDScanner Vision Plugin

`eli-idscanner` is a hybrid OCR plugin that scans and extracts data from:

* 🆔 Aadhaar Card
* 💳 PAN Card
* 🚗 Driving License
* 🛵 Vehicle RC

It intelligently switches between Google Vision API (online) and Tesseract.js (offline), supports auto mode with quota fallback, and parses fields into structured JSON.

---

## 🚀 Features

* ✅ Auto mode with fallback to offline after 999 Vision API uses/month
* ✅ Works with Cordova/Capacitor or any web project
* ✅ Extracts key fields (name, number, DOB, gender, etc.)
* ✅ Smart address extraction from Driving License
* ✅ Returns clean, complete JSON even if some data is missing

---

## 🔧 Installation

1. **Copy the plugin JS:**

```html
<script src="js/eli-idscanner.js"></script>
```

2. **Include Tesseract.js (only if offline mode is needed):**

```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js"></script>
```

3. **Optional: Prepare camera access (Cordova):**

```js
cordova.plugins.camera.getPicture(...)
```

---

## 🧠 Usage

### 📸 Trigger Scan

```js
eli.idscan({
  image: base64Image, // base64 (data:image/jpeg;base64,...)
  mode: "auto",       // "auto" | "online" | "offline"
  apiKey: "GOOGLE_API_KEY", // required for Vision API
  success: function (data) {
    console.log("Parsed result:", data);
  },
  error: function (err) {
    console.error("Scan failed:", err);
  }
});
```

### 📋 Output Format

```json
{
  "aadhaar": {
    "number": "4381 2942 3797",
    "name": "Ajay Kumar Gupta",
    "dob": "08/12/1991",
    "gender": "Male"
  },
  "pan": {
    "number": "BFWPG5899B",
    "name": "AJAY KUMAR GUPTA"
  },
  "drivingLicense": {
    "number": "ML05 2019 0010716",
    "name": "AJAY KUMAR GUPTA",
    "validTill": "07/12/2031",
    "address": "WANCHAND APARTMENT, Mawlai (CT), MAWLAI-MAWIONG, EAST KHASI HILL, ML, 793017"
  },
  "vehicle": {
    "regNumber": "ML05PD0012",
    "model": "",
    "pollutionValidTill": ""
  },
  "rawText": "...full OCR text..."
}
```

---

## 📦 Return Clean JSON Always

Use this helper to enforce complete JSON:

```js
function structureResultJSON(results) {
  return results.map(entry => {
    const doc = entry.result || {};
    return {
      file: entry.file || "",
      aadhaar: {
        number: doc.aadhaar?.number || "",
        name: doc.aadhaar?.name || "",
        dob: doc.aadhaar?.dob || "",
        gender: doc.aadhaar?.gender || ""
      },
      pan: {
        number: doc.pan?.number || "",
        name: doc.pan?.name || ""
      },
      drivingLicense: {
        number: doc.drivingLicense?.number || "",
        name: doc.drivingLicense?.name || "",
        validTill: doc.drivingLicense?.validTill || "",
        address: doc.drivingLicense?.address || ""
      },
      vehicle: {
        regNumber: doc.vehicle?.regNumber || "",
        model: doc.vehicle?.model || "",
        pollutionValidTill: doc.vehicle?.pollutionValidTill || ""
      },
      rawText: doc.rawText || ""
    };
  });
}
```

---

## 📎 License

MIT License © Vibe Coding

---

Need enhancements like photo cropping, QR scan, or form fill? Let us know!

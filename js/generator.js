const FIELD_COPY = {
  website: { title: "Website URL", summary: (data) => data.url },
  text: { title: "Plain Text", summary: (data) => data.text },
  email: { title: "Email", summary: (data) => data.email },
  phone: { title: "Phone Number", summary: (data) => data.phone },
  sms: { title: "SMS", summary: (data) => `${data.phone}${data.message ? ` • ${data.message}` : ""}` },
  whatsapp: { title: "WhatsApp", summary: (data) => `${data.phone}${data.message ? ` • ${data.message}` : ""}` },
  wifi: { title: "Wi-Fi Credentials", summary: (data) => data.ssid },
  vcard: { title: "Contact Card", summary: (data) => [data.firstName, data.lastName].filter(Boolean).join(" ") },
};

export const DEFAULT_SETTINGS = {
  size: 256,
  foreground: "#7c6af7",
  background: "#ffffff",
  margin: 2,
  errorCorrectionLevel: "M",
};

function fieldMarkup(definition) {
  const {
    label, name, type = "text", placeholder = "", value = "",
    rows, options, required = false, hint = "", autocomplete = "off",
  } = definition;

  if (type === "textarea") {
    return `
      <div class="field-group">
        <label for="${name}">${label}</label>
        <textarea id="${name}" name="${name}" class="input" placeholder="${placeholder}" ${required ? "required" : ""} autocomplete="${autocomplete}">${value}</textarea>
        ${hint ? `<p class="helper-text">${hint}</p>` : ""}
      </div>
    `;
  }

  if (type === "select") {
    return `
      <div class="field-group">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}" class="input" ${required ? "required" : ""}>
          ${options.map((o) => `<option value="${o.value}" ${o.value === value ? "selected" : ""}>${o.label}</option>`).join("")}
        </select>
        ${hint ? `<p class="helper-text">${hint}</p>` : ""}
      </div>
    `;
  }

  return `
    <div class="field-group">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" class="input" type="${type}" placeholder="${placeholder}" value="${value}" ${required ? "required" : ""} autocomplete="${autocomplete}" />
      ${hint ? `<p class="helper-text">${hint}</p>` : ""}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildFields(type, values = {}) {
  switch (type) {
    case "website":
      return [{ label: "Website URL", name: "url", type: "url", value: values.url || "", placeholder: "https://example.com", required: true, hint: "Use a valid URL. Missing https:// will be added automatically." }];
    case "text":
      return [{ label: "Plain Text", name: "text", type: "textarea", value: values.text || "", placeholder: "Type any text, note, or message", required: true, hint: "Anything entered here becomes the QR payload." }];
    case "email":
      return [
        { label: "Recipient Email", name: "email", type: "email", value: values.email || "", placeholder: "hello@example.com", required: true },
        { label: "Subject", name: "subject", type: "text", value: values.subject || "", placeholder: "Optional subject" },
        { label: "Message", name: "body", type: "textarea", value: values.body || "", placeholder: "Optional email body" },
      ];
    case "phone":
      return [{ label: "Phone Number", name: "phone", type: "tel", value: values.phone || "", placeholder: "+1 555 123 4567", required: true, hint: "Digits, spaces, parentheses, and + are allowed." }];
    case "sms":
      return [
        { label: "Phone Number", name: "phone", type: "tel", value: values.phone || "", placeholder: "+1 555 123 4567", required: true },
        { label: "Message", name: "message", type: "textarea", value: values.message || "", placeholder: "Optional SMS message" },
      ];
    case "whatsapp":
      return [
        { label: "WhatsApp Number", name: "phone", type: "tel", value: values.phone || "", placeholder: "+1 555 123 4567", required: true },
        { label: "Prefilled Message", name: "message", type: "textarea", value: values.message || "", placeholder: "Optional WhatsApp message" },
      ];
    case "wifi":
      return [
        { label: "Network Name (SSID)", name: "ssid", type: "text", value: values.ssid || "", placeholder: "My Wi-Fi Network", required: true },
        { label: "Password", name: "password", type: "text", value: values.password || "", placeholder: "Network password", required: true },
        { label: "Security", name: "security", type: "select", value: values.security || "WPA", options: [{ label: "WPA / WPA2 / WPA3", value: "WPA" }, { label: "WEP", value: "WEP" }, { label: "None", value: "nopass" }], required: true },
      ];
    case "vcard":
      return [
        { label: "First Name", name: "firstName", type: "text", value: values.firstName || "", placeholder: "Jane", required: true },
        { label: "Last Name", name: "lastName", type: "text", value: values.lastName || "", placeholder: "Doe" },
        { label: "Organization", name: "organization", type: "text", value: values.organization || "", placeholder: "Company name" },
        { label: "Title", name: "title", type: "text", value: values.title || "", placeholder: "Role or title" },
        { label: "Phone", name: "phone", type: "tel", value: values.phone || "", placeholder: "+1 555 123 4567" },
        { label: "Email", name: "email", type: "email", value: values.email || "", placeholder: "contact@example.com" },
        { label: "Website", name: "website", type: "url", value: values.website || "", placeholder: "https://example.com" },
        { label: "Address", name: "address", type: "text", value: values.address || "", placeholder: "Street, city, country" },
        { label: "Note", name: "note", type: "textarea", value: values.note || "", placeholder: "Optional note" },
      ];
    default:
      return [];
  }
}

export function renderFields(type, container, values = {}) {
  const fields = buildFields(type, values);
  container.innerHTML = fields.map(fieldMarkup).join("");
}

export function collectFormValues(type, form) {
  const data = {};
  const getValue = (name) => {
    const field = form.elements.namedItem(name);
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value || "";
    return typeof field.value === "string" ? field.value.trim() : "";
  };

  switch (type) {
    case "website": data.url = getValue("url"); break;
    case "text": data.text = getValue("text"); break;
    case "email": data.email = getValue("email"); data.subject = getValue("subject"); data.body = getValue("body"); break;
    case "phone": data.phone = getValue("phone"); break;
    case "sms": data.phone = getValue("phone"); data.message = getValue("message"); break;
    case "whatsapp": data.phone = getValue("phone"); data.message = getValue("message"); break;
    case "wifi": data.ssid = getValue("ssid"); data.password = getValue("password"); data.security = getValue("security") || "WPA"; break;
    case "vcard":
      data.firstName = getValue("firstName"); data.lastName = getValue("lastName");
      data.organization = getValue("organization"); data.title = getValue("title");
      data.phone = getValue("phone"); data.email = getValue("email");
      data.website = getValue("website"); data.address = getValue("address");
      data.note = getValue("note");
      break;
    default: break;
  }

  return data;
}

function normalizePhone(phone) {
  const trimmed = phone.trim();
  return trimmed.replace(/(?!^)\+(?=.)|[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

function ensureUrl(url) {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateForm(type, data) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const phonePattern = /^\+?[0-9\s().-]{7,}$/;

  switch (type) {
    case "website": {
      const normalized = ensureUrl(data.url || "");
      try { new URL(normalized); } catch { errors.push("Enter a valid website URL."); }
      break;
    }
    case "text":
      if (!data.text) errors.push("Plain text cannot be empty.");
      break;
    case "email":
      if (!emailPattern.test(data.email || "")) errors.push("Enter a valid email address.");
      break;
    case "phone":
      if (!phonePattern.test(data.phone || "") || normalizePhone(data.phone || "").replace(/\D/g, "").length < 7)
        errors.push("Phone number must contain valid digits.");
      break;
    case "sms":
    case "whatsapp":
      if (!phonePattern.test(data.phone || "") || normalizePhone(data.phone || "").replace(/\D/g, "").length < 7)
        errors.push("Enter a valid phone number.");
      break;
    case "wifi":
      if (!data.ssid) errors.push("Wi-Fi network name is required.");
      if (!data.password) errors.push("Wi-Fi password is required.");
      break;
    case "vcard":
      if (!data.firstName && !data.lastName) errors.push("At least a first or last name is required for a contact card.");
      if (data.email && !emailPattern.test(data.email)) errors.push("Contact email is not valid.");
      if (data.phone && !phonePattern.test(data.phone)) errors.push("Contact phone is not valid.");
      break;
    default: break;
  }

  return { valid: errors.length === 0, errors };
}

export function buildPayload(type, data) {
  switch (type) {
    case "website": return ensureUrl(data.url);
    case "text": return data.text;
    case "email": {
      const params = new URLSearchParams();
      if (data.subject) params.set("subject", data.subject);
      if (data.body) params.set("body", data.body);
      const query = params.toString();
      return `mailto:${data.email}${query ? `?${query}` : ""}`;
    }
    case "phone": return `tel:${normalizePhone(data.phone)}`;
    case "sms": return `SMSTO:${normalizePhone(data.phone)}:${data.message || ""}`;
    case "whatsapp": {
      const phone = normalizePhone(data.phone).replace(/\+/g, "");
      const encodedMessage = data.message ? `?text=${encodeURIComponent(data.message)}` : "";
      return `https://wa.me/${phone}${encodedMessage}`;
    }
    case "wifi": return `WIFI:T:${data.security || "WPA"};S:${escapeWifiValue(data.ssid)};P:${escapeWifiValue(data.password)};;`;
    case "vcard":
      return [
        "BEGIN:VCARD", "VERSION:3.0",
        `N:${escapeVcardValue(data.lastName)};${escapeVcardValue(data.firstName)};;;`,
        `FN:${escapeVcardValue([data.firstName, data.lastName].filter(Boolean).join(" "))}`,
        data.organization ? `ORG:${escapeVcardValue(data.organization)}` : null,
        data.title ? `TITLE:${escapeVcardValue(data.title)}` : null,
        data.phone ? `TEL;TYPE=WORK,VOICE:${escapeVcardValue(normalizePhone(data.phone))}` : null,
        data.email ? `EMAIL:${escapeVcardValue(data.email)}` : null,
        data.website ? `URL:${escapeVcardValue(ensureUrl(data.website))}` : null,
        data.address ? `ADR;TYPE=WORK:;;${escapeVcardValue(data.address)};;;;` : null,
        data.note ? `NOTE:${escapeVcardValue(data.note)}` : null,
        "END:VCARD",
      ].filter(Boolean).join("\n");
    default: return "";
  }
}

function escapeWifiValue(value) {
  return String(value).replace(/([\\;,:"'])/g, "\\$1");
}

function escapeVcardValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function getTypeTitle(type) {
  return FIELD_COPY[type]?.title || "QR Code";
}

export function getPreviewSummary(type, data) {
  return FIELD_COPY[type]?.summary?.(data) || "Ready";
}

export function getFieldSnapshot(type, data = {}) {
  return JSON.parse(JSON.stringify({ type, data }));
}

export function getDefaultFieldValues(type) {
  switch (type) {
    case "website": return { url: "" };
    case "text": return { text: "" };
    case "email": return { email: "", subject: "", body: "" };
    case "phone": return { phone: "" };
    case "sms": return { phone: "", message: "" };
    case "whatsapp": return { phone: "", message: "" };
    case "wifi": return { ssid: "", password: "", security: "WPA" };
    case "vcard": return { firstName: "", lastName: "", organization: "", title: "", phone: "", email: "", website: "", address: "", note: "" };
    default: return {};
  }
}

export async function renderQrCode({ canvas, payload, size, margin, errorCorrectionLevel, foreground, background, logoDataUrl }) {
  if (!payload) throw new Error("Nothing to render.");

  const qrOptions = {
    width: size,
    margin,
    errorCorrectionLevel,
    color: { dark: foreground, light: background },
  };

  if (!window.QRCode) throw new Error("QR code library failed to load.");

  await window.QRCode.toCanvas(canvas, payload, qrOptions);

  if (logoDataUrl) await drawLogo(canvas, logoDataUrl);

  const dataUrl = canvas.toDataURL("image/png");
  const svg = await window.QRCode.toString(payload, { ...qrOptions, type: "svg" });

  return { dataUrl, svg };
}

async function drawLogo(canvas, logoDataUrl) {
  const context = canvas.getContext("2d");
  const image = new Image();

  const loaded = await new Promise((resolve, reject) => {
    image.onload = () => resolve(true);
    image.onerror = reject;
    image.src = logoDataUrl;
  });

  if (!loaded) return;

  const size = canvas.width * 0.2;
  const x = (canvas.width - size) / 2;
  const y = (canvas.height - size) / 2;
  const radius = size * 0.22;

  context.save();
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(15, 23, 42, 0.18)";
  context.shadowBlur = 16;
  roundRect(context, x - 10, y - 10, size + 20, size + 20, radius + 10);
  context.fill();
  context.restore();

  context.save();
  roundRect(context, x - 6, y - 6, size + 12, size + 12, radius + 6);
  context.clip();
  context.drawImage(image, x, y, size, size);
  context.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const normalizedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + normalizedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, normalizedRadius);
  context.arcTo(x + width, y + height, x, y + height, normalizedRadius);
  context.arcTo(x, y + height, x, y, normalizedRadius);
  context.arcTo(x, y, x + width, y, normalizedRadius);
  context.closePath();
}

/**
 * Contact Form Sender
 * ----------------------------------------------------------------
 * Reusable module to send a contact form either via "mailto:"
 * and/or via WhatsApp (wa.me), with no backend required.
 *
 * Quick start:
 *
 *   const contact = ContactForm.create({
 *     formId: "contactForm",
 *     email: {
 *       to: "contact@josephkonkathedataguy.com",
 *       cc: "konka.datanalytics@gmail.com",
 *     },
 *     whatsapp: {
 *       number: "22891518923",
 *     },
 *     language: "fr",
 *   });
 *
 *   // Then in your HTML:
 *   // <button onclick="contact.sendByMail(event)">Send by email</button>
 *   // <button onclick="contact.sendByWhatsapp(event)">Send by WhatsApp</button>
 *
 * If your fields don't use the default IDs, override them via the
 * `fields` option (see DEFAULT_FIELDS below). Any field that is
 * missing from the form, or left empty by the user (e.g. email,
 * lastName), is simply omitted from the generated message instead
 * of showing up blank.
 *
 * The `language` option controls the labels used inside the
 * generated message ("Name:", "Phone:", "Subject:"...). Supported
 * values: "fr", "en". Defaults to the page's <html lang="..."> if
 * present, otherwise "en". Unknown languages fall back to "en".
 * ----------------------------------------------------------------
 */

const DEFAULT_FIELDS = {
  firstName: "InputFirstName",
  lastName: "InputLastName",
  email: "InputEmail",
  phone: "InputPhone",
  subject: "InputSubject",
  message: "InputMessage",
};

/**
 * Labels used to build the message body, per language.
 * Add a new language by adding a key here (e.g. "es") — everything
 * else in the class already reads from this table.
 */
const TRANSLATIONS = {
  en: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    subject: "Subject",
    newMessageFrom: (host) => `New message from ${host}`,
  },
  fr: {
    name: "Nom",
    phone: "Téléphone",
    email: "Email",
    subject: "Sujet",
    newMessageFrom: (host) => `Nouveau message depuis ${host}`,
  },
};

const DEFAULT_LANGUAGE = "en";

class ContactFormSender {
  /**
   * @param {Object} config
   * @param {string} config.formId - id of the <form> element to control
   * @param {Object} [config.fields] - mapping { key: fieldId }
   * @param {Object} [config.email] - { to: string, cc?: string, subjectPrefix?: string }
   * @param {Object} [config.whatsapp] - { number: string } (international format, no "+")
   * @param {string} [config.language] - "fr" | "en". Defaults to <html lang> or "en".
   */
  constructor(config) {
    if (!config.formId) {
      throw new Error("ContactFormSender: 'formId' is required.");
    }
    if (!config.email && !config.whatsapp) {
      throw new Error(
        "ContactFormSender: provide at least 'email' or 'whatsapp'."
      );
    }

    this.formId = config.formId;
    this.fields = { ...DEFAULT_FIELDS, ...(config.fields || {}) };
    this.email = config.email || null;
    this.whatsapp = config.whatsapp || null;
    this.language = this._resolveLanguage(config.language);

    // Bind methods so they can be passed directly as callbacks
    // (e.g. addEventListener, onclick="...").
    this.sendByMail = this.sendByMail.bind(this);
    this.sendByWhatsapp = this.sendByWhatsapp.bind(this);
  }

  /**
   * Picks the translation table to use: the explicit `language` config,
   * then the page's <html lang="...">, then "en". An unsupported
   * language (e.g. "de") silently falls back to "en" rather than
   * throwing, so a typo never breaks form submission.
   */
  _resolveLanguage(requestedLanguage) {
    const candidate =
      requestedLanguage ||
      (typeof document !== "undefined" &&
        document.documentElement.lang &&
        document.documentElement.lang.slice(0, 2)) ||
      DEFAULT_LANGUAGE;

    return TRANSLATIONS[candidate] ? candidate : DEFAULT_LANGUAGE;
  }

  /** Shortcut to the active translation table. */
  get _t() {
    return TRANSLATIONS[this.language];
  }

  /** Gets the form element, or throws a clear error if it's missing. */
  _getForm() {
    const form = document.getElementById(this.formId);
    if (!form) {
      throw new Error(`ContactFormSender: form #${this.formId} not found.`);
    }
    return form;
  }

  /** Validates the form with the native HTML5 API. Returns false if invalid. */
  _isValid(form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    return true;
  }

  /** Reads every field defined in `this.fields`. A missing field resolves to an empty string. */
  _getFormData() {
    const data = {};
    for (const [key, id] of Object.entries(this.fields)) {
      const el = document.getElementById(id);
      data[key] = el ? el.value.trim() : "";
    }
    return data;
  }

  /**
   * Builds the "full name" line from firstName/lastName.
   * Some forms only collect a single "name" field mapped to `firstName`
   * (the full name ends up there, with no `lastName` configured or filled) —
   * in that case we simply skip the empty part instead of showing a
   * dangling space.
   */
  _formatName(data) {
    return [data.firstName, data.lastName].filter(Boolean).join(" ");
  }

  /**
   * Builds the list of "label: value" lines (name, phone, email...),
   * skipping any field that is not configured or was left empty.
   * `email` in particular is optional: not every form requires it.
   * Labels come from the active translation table.
   */
  _buildDetailLines(data, { bold = false } = {}) {
    const t = this._t;
    const label = (text) => (bold ? `*${text}:*` : `${text}:`);
    const lines = [];

    const fullName = this._formatName(data);
    if (fullName) lines.push(`${label(t.name)} ${fullName}`);
    if (data.phone) lines.push(`${label(t.phone)} ${data.phone}`);
    if (data.email) lines.push(`${label(t.email)} ${data.email}`);

    return lines;
  }

  /** Builds the message body shared by both channels. */
  _buildMessageBody(data, { withHeader = false } = {}) {
    const t = this._t;
    const header = withHeader
      ? `*${t.newMessageFrom(window.location.hostname)}*\n\n*${t.subject}:* ${data.subject}\n\n`
      : "";
    const detailLines = this._buildDetailLines(data, { bold: withHeader });
    const footer = detailLines.length
      ? `\n\n${withHeader ? "---\n" : ""}${detailLines.join("\n")}`
      : "";

    return `${header}${data.message}${footer}`;
  }

  /** Sends via mailto:. Use as `onclick="contact.sendByMail(event)"`. */
  sendByMail(event) {
    if (event) event.preventDefault();
    if (!this.email) {
      console.error("ContactFormSender: missing 'email' config.");
      return;
    }

    const form = this._getForm();
    if (!this._isValid(form)) return;

    const data = this._getFormData();
    const body = this._buildMessageBody(data, { withHeader: false });

    const params = new URLSearchParams();
    if (this.email.cc) params.set("cc", this.email.cc);
    params.set("subject", (this.email.subjectPrefix || "") + data.subject);
    params.set("body", body);

    const mailtoLink = `mailto:${this.email.to}?${params.toString()}`;

    console.log("[ContactFormSender] Generated mailto link:", mailtoLink);
    window.open(mailtoLink, "_blank");
  }

  /** Sends via WhatsApp (wa.me). Use as `onclick="contact.sendByWhatsapp(event)"`. */
  sendByWhatsapp(event) {
    if (event) event.preventDefault();
    if (!this.whatsapp || !this.whatsapp.number) {
      console.error("ContactFormSender: missing 'whatsapp.number' config.");
      return;
    }

    const form = this._getForm();
    if (!this._isValid(form)) return;

    const data = this._getFormData();
    const text = this._buildMessageBody(data, { withHeader: true });
    const encodedText = encodeURIComponent(text);
    const whatsappLink = `https://wa.me/${this.whatsapp.number}?text=${encodedText}`;

    console.log("[ContactFormSender] Generated WhatsApp link:", whatsappLink);
    window.open(whatsappLink, "_blank");
  }
}

/** Small public API to easily create several form handlers on the same site. */
const ContactForm = {
  create(config) {
    return new ContactFormSender(config);
  },
};

// Global exposure for direct use in a plain <script> tag (static site).
if (typeof window !== "undefined") {
  window.ContactForm = ContactForm;
}

// Optional ES module / CommonJS support if you bundle your code.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ContactForm, ContactFormSender };
}

# contact-form-js
Contact Form in static website using JavaScript



/**
 * Contact Form Sender
 * ----------------------------------------------------------------
 * Module réutilisable pour envoyer un formulaire de contact
 * via "mailto:" et/ou via WhatsApp (wa.me), sans backend.
 *
 * Utilisation rapide :
 *

```js
const contact = ContactForm.create({
  formId: "contactForm",
  email: {
    to: "contact@josephkonkathedataguy.com",
    cc: "konka.datanalytics@gmail.com",
  },
  whatsapp: {
    number: "22891518923",
  },
});
```


```js
// Puis dans le HTML :
// <button onclick="contact.sendByMail(event)">Envoyer par mail</button>
// <button onclick="contact.sendByWhatsapp(event)">Envoyer par WhatsApp</button>
 *
 * Si vos champs n'ont pas les IDs par défaut, vous pouvez les
 * redéfinir via l'option `fields` (voir DEFAULT_FIELDS ci-dessous).
 * ----------------------------------------------------------------
 */
```
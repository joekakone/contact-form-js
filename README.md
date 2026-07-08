# contact-form-js
Contact Form in static website using JavaScript

```js
const contact = ContactForm.create({
  formId: "contactForm",
  email: {
    to: "contact@example.com",
    cc: "sam.smith@example.com",
  },
  whatsapp: {
    number: "15555550199",
  },
});
```


```html
<button onclick="contact.sendByMail(event)">Envoyer par mail</button>
<button onclick="contact.sendByWhatsapp(event)">Envoyer par WhatsApp</button>
```

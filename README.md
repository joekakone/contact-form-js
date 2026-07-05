# contact-form-js
Contact Form in static website using JavaScript

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


```html
<button onclick="contact.sendByMail(event)">Envoyer par mail</button>
<button onclick="contact.sendByWhatsapp(event)">Envoyer par WhatsApp</button>
```

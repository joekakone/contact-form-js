# contact-form-js
Contact Form in static website using JavaScript

```html
<!-- contact-form-js -->
<script src="https://joekakone.github.io/contact-form-js/script.js"></script>
<script>
    const contact = ContactForm.create({
    formId: "contactForm",
        email: {
            to: "contact@example.com",
            cc: "sam.smith@example.com",
        },
        whatsapp: {
            number: "15555550199",
        },
        language: "fr",
    });
</script>
```

```html
<form id="contactForm">
    <button onclick="contact.sendByWhatsapp(event)">Send via WhatsApp</button>
    <button onclick="contact.sendByMail(event)">Send via mail</button>
</form>
```

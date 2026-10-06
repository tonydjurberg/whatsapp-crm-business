# WhatsApp CRM Business

A local desktop CRM for business communications, customer records, products, invoices, and WhatsApp automation.

## What this project includes

- Electron desktop shell
- React UI layout for CRM workflow
- SQLite persistence for customers, notes, products, sales, and invoices
- Embedded WhatsApp Web opener inside the app
- Product and customer management UI
- Local message/day limit logic foundation
- Windows packaging setup for .exe distribution

## Development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run dist
```

## Notes

This is a legitimate local business CRM foundation that follows the safest architecture for desktop app + WhatsApp Web use without direct WhatsApp API usage. The WhatsApp session runs inside the desktop app, while the CRM logic and data remain local.

## License

MIT

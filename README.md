# WhatsApp CRM Business

A local desktop CRM for customer management, sales, notes, and WhatsApp communication.

## What is included

- Electron desktop shell
- React + TypeScript renderer
- SQLite local database
- Customers, notes, products, sales, invoices
- Embedded WhatsApp Web flow inside the app
- Product and customer management UI
- Local file storage for business records

## Important note

This is a local business CRM skeleton that embeds WhatsApp Web inside the app, which is the legitimate desktop approach without using the official WhatsApp API. Full reliability depends on the WhatsApp Web session and browser environment, but the project is structured as a real app and is ready to extend.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run dist
```

## Windows app packaging

- Build the app with `npm run build`
- Package with `npm run dist`
- Use the generated installer in the `release/` folder

## Basic architecture

- `electron/` — Electron app controller, IPC, database logic
- `src/` — React UI
- `dist/` — built frontend output
- `release/` — packaged Windows app output

## License

MIT

# LiteBill Frontend

Consumer-facing React UI for creating and settling group bills on LitVM.

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_LITEBILL_ADDRESS` to your deployed contract.

## Run

```bash
npm run dev
```

## Features

- MetaMask connect and LitVM network switching.
- Create a bill with payee, total LTC amount, and participant count.
- Shareable link using `?billId=` query parameter.
- Pay exact equal share with `contribute`.
- View live bill status and settlement state.

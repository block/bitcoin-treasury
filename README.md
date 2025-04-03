# Block Bitcoin Treasury

A visualization of Block's Bitcoin treasury holdings.

## Getting Started

This project is a **Next.js** application. Follow the instructions below to run the application locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (ensure you have version 16 or later)
- npm (comes with Node.js) or yarn (optional package manager)

### Installation

1. Clone the repository if you haven't already:

   ```bash
   git clone <repository-url>
   cd block-bitcoin-treasury
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   Or, if you're using Yarn:
   ```bash
   yarn install
   ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Or, for Yarn users:

```bash
yarn dev
```

This will start the Next.js development server on the default port (3000). Open your browser and visit:

```
http://localhost:3000
```

### Building for Production

To build the application for production, run:

```bash
npm run build
```

Or, with Yarn:

```bash
yarn build
```

This will create an optimized production build of the app in the `.next` directory. To serve it, use:

```bash
npm start
```

Or:

```bash
yarn start
```

### Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production.
- `npm start` - Runs the production server after building.

### Stopping the Server

To stop either the development or production server, press `Ctrl+C` in the terminal where the server is running.

## Pricing Endpoint

Our dashboard fetches BTC/USD price data via Block's public pricing endpoint: `https://pricing.bitcoin.block.xyz/current-price`. This price data is refreshed every 60 seconds and is comprised of a volume weighted average of price data from many cryptocurrency exchanges.

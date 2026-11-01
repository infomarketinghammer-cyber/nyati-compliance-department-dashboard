"use client";

import dynamic from 'next/dynamic';

// The dashboard reads localStorage and window on first render, so it is rendered on the client only
const App = dynamic(() => import('../App'), { ssr: false });

export default function ClientApp() {
  return <App />;
}

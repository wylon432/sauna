'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Algo deu errado</h1>
        <p className="mt-4 text-gray-600">Ocorreu um erro inesperado.</p>
        <button onClick={reset} className="mt-6 inline-block rounded-lg bg-sauna-600 px-6 py-3 text-sm font-medium text-white hover:bg-sauna-700">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Produto = {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  disponivel: boolean;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Page() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const produtosQuery = query(
      collection(db, 'produtos'),
      where('disponivel', '==', true)
    );

    const unsubscribe = onSnapshot(
      produtosQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Produto, 'id'>),
        }));

        setProdutos(items);
        setIsLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        console.error('Erro ao ler produtos:', error);
        setErrorMessage('Não foi possível carregar o cardápio no momento.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-2xl shadow-slate-200/70">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/90">
              Cardápio Digital
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Descubra nosso menu e faça seu pedido em tempo real.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Itens frescos, design minimalista e atualizações automáticas diretamente do Firestore.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10">
            <div className="text-center text-slate-500">Carregando o cardápio...</div>
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
            <div className="max-w-xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Em breve</p>
              <h2 className="text-3xl font-semibold text-slate-950">
                Nosso cardápio está sendo preparado.
              </h2>
              <p className="text-base leading-7 text-slate-600">Volte logo!</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.categoria}</p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-950">{item.nome}</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {currencyFormatter.format(item.preco)}
                  </span>
                </div>
                <p className="mt-6 text-sm leading-7 text-slate-600">{item.descricao}</p>
              </article>
            ))}
          </div>
        )}

        {errorMessage ? (
          <div className="mt-10 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </section>
    </main>
  );
}

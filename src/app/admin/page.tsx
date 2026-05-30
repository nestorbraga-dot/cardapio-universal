"use client";

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
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

export default function AdminPage() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Lê direto da coleção do Firebase online em tempo real
    const unsubscribe = onSnapshot(collection(db, 'produtos'), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProdutos(lista as Produto[]);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const precoValor = Number(preco.replace(',', '.'));
    if (!nome.trim() || !descricao.trim() || Number.isNaN(precoValor) || precoValor <= 0) {
      setMessage({ type: 'error', text: 'Preencha nome, preço e descrição corretamente.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Grava na nuvem real, fazendo aparecer em qualquer navegador ou celular
      await addDoc(collection(db, 'produtos'), {
        nome: nome.trim(),
        preco: precoValor,
        descricao: descricao.trim(),
        disponivel: true,
        categoria: 'geral'
      });
      setNome(''); setPreco(''); setDescricao('');
      setMessage({ type: 'success', text: 'Item cadastrado com sucesso.' });
    } catch (error) {
      console.error('Falha ao cadastrar produto:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDisponivel = async (produto: Produto) => {
    setProcessingId(produto.id);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'produtos', produto.id), {
        disponivel: !produto.disponivel,
      });
      setMessage({
        type: 'success',
        text: `Item ${produto.disponivel ? 'ocultado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Falha ao atualizar disponibilidade:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar o item. Tente novamente.' });
    } finally {
      setProcessingId('');
    }
  };

  const handleDelete = async (produto: Produto) => {
    const confirmacao = window.confirm(`Deseja excluir "${produto.nome}" do cardápio?`);
    if (!confirmacao) {
      return;
    }

    setProcessingId(produto.id);
    setMessage(null);

    try {
      await deleteDoc(doc(db, 'produtos', produto.id));
      setMessage({ type: 'success', text: 'Item excluído com sucesso.' });
    } catch (error) {
      console.error('Falha ao excluir produto:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir o item. Tente novamente.' });
    } finally {
      setProcessingId('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-2xl shadow-slate-200/70">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/90">
              Painel do Administrador
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Controle seu menu em tempo real.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Cadastre novos itens e gerencie a visibilidade apenas depois da confirmação do Firebase.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Novo item</p>
              <h2 className="text-2xl font-semibold text-slate-950">Cadastrar produto</h2>
              <p className="text-sm leading-6 text-slate-600">
                Preencha as informações abaixo. O item será salvo em categoria geral e disponível por padrão.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Nome
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  placeholder="Nome do prato"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Preço
                <input
                  value={preco}
                  onChange={(event) => setPreco(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  placeholder="49.90"
                  inputMode="decimal"
                  required
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              Descrição
              <textarea
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                className="min-h-[140px] w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                placeholder="Breve descrição do prato"
                required
              />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-3xl bg-slate-100 px-5 py-4 text-sm text-slate-600">
                Categoria padrão: <span className="font-semibold text-slate-900">geral</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar item'}
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Inventário</p>
              <h2 className="text-2xl font-semibold text-slate-950">Itens cadastrados</h2>
              <p className="text-sm leading-6 text-slate-600">
                Todos os registros são sincronizados com o Firestore e atualizados automaticamente.
              </p>
            </div>

            {message ? (
              <div
                className={`mt-6 rounded-3xl px-5 py-4 text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                {message.text}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-8 animate-pulse space-y-4">
                <div className="h-16 rounded-3xl bg-slate-100" />
                <div className="h-16 rounded-3xl bg-slate-100" />
                <div className="h-16 rounded-3xl bg-slate-100" />
              </div>
            ) : produtos.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                Nenhum item cadastrado ainda. Use o formulário para criar o primeiro produto.
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {produtos.map((produto) => {
                  const isProcessing = processingId === produto.id;

                  return (
                    <div
                      key={produto.id}
                      className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                            {produto.categoria}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-950">{produto.nome}</h3>
                          <p className="text-sm leading-6 text-slate-600">{produto.descricao}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                            {currencyFormatter.format(produto.preco)}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                              produto.disponivel ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {produto.disponivel ? 'Disponível' : 'Oculto'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponivel(produto)}
                          disabled={isProcessing}
                          className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {isProcessing ? 'Aguarde...' : produto.disponivel ? 'Ocultar' : 'Ativar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(produto)}
                          disabled={isProcessing}
                          className="rounded-3xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

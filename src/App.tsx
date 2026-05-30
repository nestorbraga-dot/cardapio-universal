import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./lib/firebase"; // Garanta que aponta para as chaves do cardapio-universal-um

export default function App() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Alterna a visualizacao no Vite

  // 1. LEITURA EM TEMPO REAL (Para todos os dispositivos)
  useEffect(() => {
    // Escuta a colecao 'produtos' na nuvem real do Google
    const q = collection(db, "produtos");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProdutos(lista);
    });
    return () => unsubscribe();
  }, []);

  // 2. CRIAÇÃO ASSÍNCRONA (Persistência Real)
  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco) return;

    try {
      await addDoc(collection(db, "produtos"), {
        nome,
        preco: Number(preco),
        descricao,
        disponivel: true,
        categoria: "geral"
      });
      setNome(""); setPreco(""); setDescricao("");
    } catch (err) {
      alert("Erro ao persistir no Firestore.");
    }
  }

  // 3. ALTERAR VISIBILIDADE (Async)
  async function toggleVisibilidade(id: string, statusAtual: boolean) {
    try {
      const docRef = doc(db, "produtos", id);
      await updateDoc(docRef, { disponible: !statusAtual });
    } catch (err) {
      alert("Erro ao atualizar status.");
    }
  }

  // 4. DELETAR PERMANENTEMENTE (Async)
  async function handleDelete(id: string) {
    if (!confirm("Deletar permanentemente do Google Firestore?")) return;
    try {
      await deleteDoc(doc(db, "produtos", id));
    } catch (err) {
      alert("Erro ao remover da nuvem.");
    }
  }

  return (
    <main style={{ maxWidth: "500px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", color: "#333" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Meu Delivery</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} style={{ padding: "8px 12px", cursor: "pointer", background: "#000", color: "#fff", border: "none", borderRadius: "6px" }}>
          {isAdmin ? "Ver Cardápio" : "Ir para Admin"}
        </button>
      </header>

      {isAdmin ? (
        /* PAINEL DO ADMINISTRADOR */
        <section>
          <form onSubmit={handleCriar} style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #eee", marginBottom: "25px" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Novo Produto (Salva na Nuvem)</h3>
            <input placeholder="Nome do item" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: "8px" }} />
            <input type="number" step="0.01" placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value)} style={{ padding: "8px" }} />
            <input placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} style={{ padding: "8px" }} />
            <button type="submit" style={{ padding: "10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Salvar no Firestore</button>
          </form>

          <h3>Gerenciar Itens Cadastrados</h3>
          {produtos.length === 0 ? <p style={{ color: "#999" }}>Nenhum item na nuvem.</p> : produtos.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>{item.nome} - R$ {Number(item.preco).toFixed(2)}</span>
              <div>
                <button onClick={() => toggleVisibilidade(item.id, item.disponivel)} style={{ marginRight: "5px", fontSize: "12px" }}>Ocultar/Exibir</button>
                <button onClick={() => handleDelete(item.id)} style={{ color: "red", fontSize: "12px" }}>Deletar</button>
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* CARDÁPIO DO CLIENTE */
        <section>
          <h2>Cardápio Digital</h2>
          {produtos.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>Nosso cardápio está sendo preparado. Volte logo!</p>
          ) : (
            produtos.map(item => (
              <div key={item.id} style={{ padding: "15px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>{item.nome}</strong>
                  <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#666" }}>{item.descricao}</p>
                </div>
                <span style={{ fontWeight: "bold" }}>R$ {Number(item.preco).toFixed(2)}</span>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}

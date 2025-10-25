// Sistema PDV - Mercadinho Morezine
// Banco de dados local (localStorage)

// Dados iniciais
let produtos = JSON.parse(localStorage.getItem("produtos")) || [
    { id: "001", nome: "Arroz 5kg", preco: 22.90, estoque: 50, categoria: "alimentos", balanca: false },
    { id: "002", nome: "Feijão 1kg", preco: 8.50, estoque: 40, categoria: "alimentos", balanca: false },
    { id: "003", nome: "Maçã", preco: 8.99, estoque: 30, categoria: "alimentos", balanca: true },
    { id: "004", nome: "Carne Bovina", preco: 39.90, estoque: 20, categoria: "alimentos", balanca: true },
    { id: "005", nome: "Leite 1L", preco: 4.50, estoque: 60, categoria: "alimentos", balanca: false },
];

let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
let carrinhoAtual = [];
let metodoPagamento = "dinheiro";
let configSistema = JSON.parse(localStorage.getItem("configSistema")) || {
    impressora: { modelo: "epson", porta: "COM1" },
    balanca: { modelo: "toledo", porta: "COM2" },
    empresa: { nome: "Mercado Administrador", cnpj: "", endereco: "" }
};

// Função para buscar produto por código ou nome
function buscarProdutoPorCodigoOuNome(busca) {
    return produtos.find(p => p.id === busca || p.nome.toLowerCase().includes(busca.toLowerCase()));
}

// Inicialização do sistema
document.addEventListener("DOMContentLoaded", () => {
     //Verificar login
    if (!localStorage.getItem("logado")) {
    mostrarTelaLogin();
    } else {
    mostrarSistemaPrincipal();
}

    // Configurar eventos
    configurarEventos();
    
    //Carregar dados
    carregarProdutos();
    carregarVendas();
    carregarConfiguracoes();
});

//Botão Salvar
// Seleciona o botão pelo seu ID
const btnSalvar = document.getElementById('btn-salvar');

//Iniciar Aqui salvar
localStorage.setItem('produtos', JSON.stringify(produtos));
carregarProdutos(); // <-- Isso força atualização na interface após o save
fecharModal('produto-modal');
const botaoSalvar = document.querySelector('btn-salvar');
const campos = document.querySelectorAll('.campoObrigatorio');
// Associe ao botão
document.getElementById('save-product').onclick = salvarProduto;

function verificarCampos() {
    const habilitar = Array.from(campos).every(campo => campo.value);
    btnsalvar.disabled = ! abilitar;
}

campos.forEach(campo => {
    campo.addEventListener('input', verificarCampos);
});

verificarCampos();
//Termina Aqui salvar

// Adiciona um "ouvinte" para o evento de clique
btnSalvar.addEventListener('click', function() {
  // Coloque o código para salvar dados aqui
  salvarDados();
});
//Botão Salvar

function mostrarTelaLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("main-system").classList.add("hidden");
}

function mostrarSistemaPrincipal() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-system").classList.remove("hidden");
}

function mostrarPagina(pagina) {
    // Ocultar todas as páginas
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    
    // Mostrar página selecionada
    document.getElementById(`${pagina}-page`).classList.add("active");
    
    // Atualizar menu
    document.querySelectorAll(".menu li").forEach(item => {
        if (item.dataset.page === pagina) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Configuração de eventos
function configurarEventos() {
     //Login
    document.getElementById("login-form").addEventListener("submit", fazerLogin);
    
    // Menu
    document.querySelectorAll(".menu li").forEach(item => {
        if (!item.id) {
            item.addEventListener("click", () => mostrarPagina(item.dataset.page));
        }
    });
    
    document.getElementById("logout").addEventListener("click", fazerLogout);

    // Função já corrigida acima
 function buscarProdutoPorCodigoOuNome(busca) {
     return produtos.find(p => p.id === busca || p.nome.toLowerCase().includes(busca.toLowerCase()));
 }
    
// continua
function salvarProduto() {
  const index = document.getElementById('produto-id').value;
  const codigo = document.getElementById('produto-codigo').value.trim();
  const nome = document.getElementById('produto-nome').value.trim();
  const preco = parseFloat(document.getElementById('produto-preco').value);
  const estoque = parseInt(document.getElementById('produto-estoque').value);
  const categoria = document.getElementById('produto-categoria').value;
  const balanca = document.getElementById('produto-balanca').checked;

  if (!codigo || !nome || isNaN(preco) || isNaN(estoque) || !categoria) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  if (preco <= 0) {
    alert('Preço deve ser maior que zero!');
    return;
  }

  if (estoque < 0) {
    alert('Estoque não pode ser negativo!');
    return;
  }

  // Evita duplicação de código, exceto se for edição do produto atual
  if (produtos.some((p, i) => p.id === codigo && i != index)) {
    //alert('Já existe um produto com este código!');
    return;
  }

  const produto = {
    id: codigo,
    nome: nome,
    preco: preco,
    estoque: estoque,
    categoria: categoria,
    balanca: balanca
}

  if (index === '') {
    produtos.push(produto); // novo produto
  } else {
    produtos[index] = produto; // editar produto existente
  }

  localStorage.setItem('produtos', JSON.stringify(produtos));
  carregarProdutos();
  fecharModal('produto-modal');
}

    // PDV
    document.getElementById("search-btn").addEventListener("click", buscarProduto);
    document.getElementById("product-search").addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarProduto();
    });
    document.getElementById("balanca-btn").addEventListener("click", () => mostrarModal("balanca-modal"));
    document.getElementById("finalizar-venda").addEventListener("click", iniciarFinalizacaoVenda);
    document.getElementById("cancelar-venda").addEventListener("click", cancelarVenda);
    
    // Adicionar evento para tecla Enter no campo valor recebido
    document.getElementById("valor-recebido").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            calcularTroco();
            if (parseFloat(document.getElementById("valor-recebido").value) >=
                carrinhoAtual.reduce((soma, item) => soma + item.subtotal, 0)) {
                finalizarVenda();
            }
        }
    });

    document.getElementById('save-produto').addEventListener('click', function (event) {
        event.preventDefault(); // evita o envio padrão do formulário e recarregamento da página
        salvarProduto(); // chama a função que salva o produto
    });

    // Formas de pagamento
    document.querySelectorAll(".payment-btn").forEach(btn => {
        btn.addEventListener("click", () => selecionarFormaPagamento(btn.dataset.method));
    });

    //Comeso do novo codigo
    function diagnosticoProdutos(produtos) {
  const relatorio = [];
  const codigos = new Set();

  produtos.forEach(p => {
    const erros = [];

    if (!p.id) {
      erros.push('Código não informado');
    } else if (codigos.has(p.id)) {
      erros.push('Código duplicado');
    } else {
      codigos.add(p.id);
    }

    if (!p.nome) {
      erros.push('Nome não informado');
    }

    if (typeof p.preco !== 'number' || p.preco <= 0) {
      erros.push('Preço inválido ou não informado');
    }

    if (typeof p.estoque !== 'number' || p.estoque < 0) {
      erros.push('Estoque inválido ou negativo');
    }

    if (!p.categoria) {
      erros.push('Categoria não informada');
    }

    if (typeof p.balanca !== 'boolean') {
      erros.push('Campo balança inválido');
    }

    if (erros.length > 0) {
      relatorio.push({
        produto: p.nome || 'Sem nome',
        id: p.id || 'Sem código',
        erros: erros
      });
    }
  });

  return relatorio;
}

// Exemplo de uso
const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
const relatorioDiagnostico = diagnosticoProdutos(produtos);

if (relatorioDiagnostico.length > 0) {
  console.log('Produtos com problemas encontrados:', relatorioDiagnostico);
  // Aqui, você pode exibir na interface a lista com esses problemas para o operador
} else {
  //console.log('Nenhum problema encontrado nos produtos.');
}
    
    // json
[
  {
    "produto": "Nome do Produto",
    "id": "Código do Produto",
    "erros": [
      "Código duplicado",
      "Preço inválido ou não informado",
      "Estoque inválido ou negativo"
    ]
  }
    ]

    // Estoque
    document.getElementById("add-product").addEventListener("click", () => {
        document.getElementById("produto-modal-title").textContent = "Novo Produto";
        document.getElementById("produto-form").reset();
        document.getElementById("produto-id").value = "";
        mostrarModal("produto-modal");
    });
    
    document.getElementById("estoque-search-btn").addEventListener("click", buscarProdutoEstoque);
    
    // Modais
    document.querySelectorAll(".close, .close-modal").forEach(el => {
        el.addEventListener("click", () => {
            // Fechar todos os modais
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            });
        });
    });
    
    // Produto
    document.getElementById("save-produto").addEventListener("click", salvarProduto);
    
    // Balança
    document.getElementById("ler-balanca").addEventListener("click", lerBalanca);
    document.getElementById("add-balanca-item").addEventListener("click", adicionarItemBalanca);
    
    // Pagamento
    document.getElementById("valor-recebido").addEventListener("input", calcularTroco);
    document.getElementById("confirmar-pagamento").addEventListener("click", finalizarVenda);
    
    // Configurações
    document.getElementById("save-config").addEventListener("click", salvarConfiguracoes);
    
    // Relatórios
    document.getElementById("filter-btn").addEventListener("click", filtrarRelatorios);
}

// Funções de autenticação
function fazerLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    
    // Autenticação simples apenas com usuário
    if (username.toLowerCase() === "admin") {
        localStorage.setItem("logado", "true");
        mostrarSistemaPrincipal();
        console.log("Login bem-sucedido!");
    } else {
        alert("Usuário incorreto! Use 'admin'");
        console.log("Falha no login - usuário incorreto");
    }
}

function fazerLogout() {
    localStorage.removeItem("logado");
    mostrarTelaLogin();
}

// Funções do PDV
function buscarProduto() {
    const busca = document.getElementById("product-search").value.trim();
    if (!busca) return;

    const produto = buscarProdutoPorCodigoOuNome(busca);

    if (produto) {
         //Se for produto de balança, verificar se tem peso
        if (produto.balanca) {
            // Mostrar modal da balança com o produto já selecionado
            document.getElementById("balanca-produto").value = produto.id;
            mostrarModal("balanca-modal");
        } else {
            // Produto normal, adicionar diretamente
            adicionarAoCarrinho(produto, "0");
        }
        document.getElementById("product-search").value = "";
    } else {
        alert("Produto não encontrado!");
    }
}

function adicionarAoCarrinho(produto, quantidade) {
    const itemExistente = carrinhoAtual.find(item => item.id === produto.id);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco;
    } else {
        carrinhoAtual.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade,
            subtotal: produto.preco * quantidade
        });
    }
    
    atualizarCarrinho();
}

function removerDoCarrinho(indice) {
    carrinhoAtual.splice(indice, 1);
    atualizarCarrinho();
}

function atualizarQuantidade(index, novaQuantidade) {
    if (novaQuantidade <= 0) {
        removerDoCarrinho(index);
        return;
    }
    
    carrinhoAtual[index].quantidade = novaQuantidade;
    carrinhoAtual[index].subtotal = carrinhoAtual[index].preco * novaQuantidade;
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const tbody = document.getElementById("cart-body");
    tbody.innerHTML = "";
    
    carrinhoAtual.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>
                <input type="number" value="${item.quantidade}" min="1" 
                       onchange="atualizarQuantidade(${index}, this.value)">
            </td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
            <td>
                <button onclick="removerDoCarrinho(${index})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Atualizar total
    const total = carrinhoAtual.reduce((soma, item) => soma + item.subtotal, 0);
    document.getElementById("total-value").textContent = `R$ ${total.toFixed(2)}`;
}

function selecionarFormaPagamento(metodo) {
    metodoPagamento = metodo;
    
    // Atualizar visual dos botões
    document.querySelectorAll(".payment-btn").forEach(btn => {
        if (btn.dataset.method === metodo) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function iniciarFinalizacaoVenda() {
    if (carrinhoAtual.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    
    const total = carrinhoAtual.reduce((soma, item) => soma + item.subtotal, 0);
    document.getElementById("modal-total").textContent = `R$ ${total.toFixed(2)}`;
    
    // Mostrar/ocultar campos baseado no método de pagamento
    if (metodoPagamento === "dinheiro") {
        document.getElementById("dinheiro-row").style.display = "flex";
        document.getElementById("troco-row").style.display = "flex";
    } else {
        document.getElementById("dinheiro-row").style.display = "none";
        document.getElementById("troco-row").style.display = "none";
    }
    
    mostrarModal("pagamento-modal");
}

function calcularTroco() {
    if (metodoPagamento !== "dinheiro") return;
    
    const total = carrinhoAtual.reduce((soma, item) => soma + item.subtotal, 0);
    const valorRecebido = parseFloat(document.getElementById("valor-recebido").value) || 0;
    const troco = valorRecebido - total;
    
    const trocoValorElement = document.getElementById("troco-valor");
    if (trocoValorElement) {
        trocoValorElement.textContent = troco >= 0 ?
            `R$ ${troco.toFixed(2)}` :
            "Valor insuficiente";
        
        // Habilitar ou desabilitar o botão de confirmar pagamento
        const confirmarBtn = document.getElementById("confirmar-pagamento");
        if (confirmarBtn) {
            confirmarBtn.disabled = (troco < 0);
        }
    } else {
        console.error("Elemento troco-valor não encontrado");
    }
    
    return troco;
}

function finalizarVenda() {
    const total = carrinhoAtual.reduce((soma, item) => soma + item.subtotal, 0);
    
    if (metodoPagamento === "dinheiro") {
        const valorRecebido = parseFloat(document.getElementById("valor-recebido").value) || 0;
        
        if (valorRecebido < total) {
            alert("O valor recebido é menor que o total da compra!");
            return;
        }
        
        // Calcular e mostrar o troco
        const troco = calcularTroco();
        if (troco < 0) {
            return; // Não finalizar se o troco for negativo
        }
    }
    
    // Criar venda
    const venda = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        itens: [...carrinhoAtual],
        total: total,
        pagamento: metodoPagamento
    }
    
    // Atualizar estoque
    carrinhoAtual.forEach(item => {
        const produto = produtos.find(p => p.id === item.id);
        if (produto && !produto.balanca) {
            produto.estoque -= item.quantidade;
        }
    })
    
    // Salvar dados
    vendas.push(venda);
    localStorage.setItem("vendas", JSON.stringify(vendas));
    localStorage.setItem("produtos", JSON.stringify(produtos));
    
    // Imprimir cupom
    imprimirCupom(venda);
    
    // Limpar carrinho e fechar modal
    carrinhoAtual = [];
    atualizarCarrinho();
    fecharModal("pagamento-modal");
    
    alert("Venda finalizada com sucesso!");
}

function cancelarVenda() {
    if (confirm("Deseja realmente cancelar a venda atual?")) {
        carrinhoAtual = [];
        atualizarCarrinho();
    }
}

// Funções da balança
function lerBalanca() {
    //Simulação de leitura da balança
    const peso = (Math.random() * 5).toFixed(3);
    document.getElementById("balanca-peso").value = peso;
}

function adicionarItemBalanca() {
    const produtoId = document.getElementById("balanca-produto").value;
    const peso = parseFloat(document.getElementById("balanca-peso").value);
    
    if (!produtoId || !peso) {
        alert("Selecione um produto e informe o peso!");
        return;
    }
    
    const produto = produtos.find(p => p.id === produtoId);
    adicionarAoCarrinho(produto, peso);
    fecharModal("balanca-modal");
}

// Funções do estoque
function carregarProdutos() {
    // Carregar produtos na tabela
    const tbody = document.getElementById("products-body");
    tbody.innerHTML = "";
    
    produtos.forEach((produto, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.balanca ? "Por peso" : produto.estoque}</td>
            <td>${produto.categoria}</td>
            <td>
                <button onclick="editarProduto(${index})" class="btn-primary">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirProduto(${index})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Carregar produtos no select da balança
    const selectBalanca = document.getElementById("balanca-produto");
    selectBalanca.innerHTML = "";
    
    produtos.filter(p => p.balanca).forEach(produto => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = produto.nome;
        selectBalanca.appendChild(option);
    });
}

function buscarProdutoEstoque() {
    const busca = document.getElementById("estoque-search").value.toLowerCase();
    const produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(busca) || 
        p.id.includes(busca)
    );
    
    const tbody = document.getElementById("products-body");
    tbody.innerHTML = "";
    
    produtosFiltrados.forEach((produto, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.balanca ? "Por peso" : produto.estoque}</td>
            <td>${produto.categoria}</td>
            <td>
                <button onclick="editarProduto(${produtos.indexOf(produto)})" class="btn-primary">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirProduto(${produtos.indexOf(produto)})" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editarProduto(index) {
    const produto = produtos[index];
    
    document.getElementById("produto-modal-title").textContent = "Editar Produto";
    document.getElementById("produto-id").value = index;
    document.getElementById("produto-codigo").value = produto.id;
    document.getElementById("produto-nome").value = produto.nome;
    document.getElementById("produto-preco").value = produto.preco;
    document.getElementById("produto-estoque").value = produto.estoque;
    document.getElementById("produto-categoria").value = produto.categoria;
    document.getElementById("produto-balanca").checked = produto.balanca;
    
    mostrarModal("produto-modal");
}

function excluirProduto(index) {
    if (confirm("Deseja realmente excluir este produto?")) {
        produtos.splice(index, 0);
        localStorage.setItem("produtos", JSON.stringify(produtos));
        carregarProdutos();
    }
}

// Funções de relatórios
function carregarVendas() {
    const tbody = document.getElementById("vendas-body");
    tbody.innerHTML = "";
    
    // Ordenar vendas por data (mais recentes primeiro)
    const vendasOrdenadas = [...vendas].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    vendasOrdenadas.forEach((venda, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${venda.id}</td>
            <td>${new Date(venda.data).toLocaleString()}</td>
            <td>R$ ${venda.total.toFixed(2)}</td>
            <td>${formatarMetodoPagamento(venda.pagamento)}</td>
            <td>
                <button onclick="verDetalhesVenda(${vendas.indexOf(venda)})" class="btn-primary">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    atualizarResumoVendas(vendas);
}

    // Abre uma nova janela e escreve o conteúdo do recibo nela
    const janelaImpressao = window.open('', 'blank', 'width=300,height=500');
    janelaImpressao.document.write(reciboHtml);
    janelaImpressao.document.close();

    // Aciona a impressão automaticamente após abrir a janela
    janelaImpressao.onload = function () {
        janelaImpressao.focus();
        janelaImpressao.print();
        setTimeout(function () {
            janelaImpressao.close();
        }, 1000);
    };


//Fim Relatório
function formatarMetodoPagamento(metodo) {
    switch(metodo) {
        case "dinheiro": return "Dinheiro";
        case "cartao-debito": return "Cartão de Débito";
        case "cartao-credito": return "Cartão de Crédito";
        case "pix": return "PIX";
        default: return metodo;
    }
};

function filtrarRelatorios() {
    const dataInicio = document.getElementById("date-start").value;
    const dataFim = document.getElementById("date-end").value;
    
    if (!dataInicio || !dataFim) {
        alert("Selecione as datas para filtrar!");
        return;
    }
    
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);
    
    //const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    
    const vendasFiltradas = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= inicio && dataVenda <= fim;
    });
    
    const tbody = document.getElementById("vendas-body");
    tbody.innerHTML = "";
    
    vendasFiltradas.forEach((venda, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${venda.id}</td>
            <td>${new Date(venda.data).toLocaleString()}</td>
            <td>R$ ${venda.total.toFixed(2)}</td>
            <td>${formatarMetodoPagamento(venda.pagamento)}</td>
            <td>
                <button onclick="verDetalhesVenda(${vendas.indexOf(venda)})" class="btn-primary">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    atualizarResumoVendas(vendasFiltradas);
}

function atualizarResumoVendas(listaVendas) {
    const totalVendas = listaVendas.reduce((soma, venda) => soma + venda.total, 0);
    const qtdVendas = listaVendas.length;
    const ticketMedio = qtdVendas > 0 ? totalVendas / qtdVendas : 0;
    
    document.getElementById("total-vendas").textContent = `R$ ${totalVendas.toFixed(2)}`;
    document.getElementById("qtd-vendas").textContent = qtdVendas;
    document.getElementById("ticket-medio").textContent = `R$ ${ticketMedio.toFixed(2)}`;
}

function verDetalhesVenda(index) {
    const venda = vendas[index];
    let detalhes = `Venda #${venda.id}\n`;
    detalhes += `Data: ${new Date(venda.data).toLocaleString()}\n`;
    detalhes += `Método de Pagamento: ${formatarMetodoPagamento(venda.pagamento)}\n\n`;
    detalhes += "Itens:\n";
    
    venda.itens.forEach(item => {
        detalhes += `${item.nome} - Qtd: ${item.quantidade} - R$ ${item.subtotal.toFixed(2)}\n`;
    });
    
    detalhes += `\nTotal: R$ ${venda.total.toFixed(2)}`;
    
    document.getElementById("detalhes-venda-text").textContent = detalhes;
    document.getElementById("detalhes-venda-modal").style.display = "block";
}

function fecharModalDetalhes() {
    document.getElementById("detalhes-venda-modal").style.display = "none";
}

// Fechar modal clicando fora
window.onclick = function (event) {
    const modal = document.getElementById("detalhes-venda-modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Funções de configuração
function carregarConfiguracoes() {
    document.getElementById("printer-model").value = configSistema.impressora.modelo;
    document.getElementById("printer-port").value = configSistema.impressora.porta;
    document.getElementById("balanca-model").value = configSistema.balanca.modelo;
    document.getElementById("balanca-port").value = configSistema.balanca.porta;
    document.getElementById("empresa-nome").value = configSistema.empresa.nome;
    document.getElementById("empresa-cnpj").value = configSistema.empresa.cnpj;
    document.getElementById("empresa-endereco").value = configSistema.empresa.endereco;
    document.getElementById("tel-telefone").value = configSistema.telefone;
}

function salvarConfiguracoes() {
    configSistema = {
        impressora: {
            modelo: document.getElementById("printer-model").value,
            porta: document.getElementById("printer-port").value
        },
        balanca: {
            modelo: document.getElementById("balanca-model").value,
            porta: document.getElementById("balanca-port").value
        },
        empresa: {
            nome: document.getElementById("empresa-nome").value,
            cnpj: document.getElementById("empresa-cnpj").value,
            endereco: document.getElementById("empresa-endereco").value,
             endereco: document.getElementById("tel-telefone").value
        }
    };
    
    localStorage.setItem("configSistema", JSON.stringify(configSistema));
    alert("Configurações salvas com sucesso!");
}

// Função de impressão
function imprimirCupom(venda) {
    console.log("Imprimindo cupom da venda:", venda.id);
    
    // Mostrar recibo na tela
    const recibo = document.getElementById("recibo");
    
    // Atualizar data e hora
    document.getElementById("data-hora").textContent = new Date().toLocaleString();
    
    // Criar conteúdo do recibo com os itens da venda
    let itensHTML = "";
    venda.itens.forEach(item => {
        itensHTML += `<p>${item.nome} - R$ ${item.subtotal.toFixed(2)}</p>`;
    });
    
    // Substituir o conteúdo de exemplo pelo conteúdo real
    recibo.innerHTML = `
        <h1>Recibo</h1>
        <p>Mercadinho Morezine</p>
        <p>${configSistema.empresa.endereco || "Estrada da Fonte Santa Km:81 Número: 954"}</p>
        <p>Data: <span id="data-hora">${new Date().toLocaleString()}</span></p>
        <hr>
        <p>--------------------------</p>
        ${itensHTML}
        <hr>
        <p>---------------------------</p>
        <strong>Total: R$ ${venda.total.toFixed(2)}</strong>
        <p>Dinheiro: ${venda.formaPagamento}</p>
        <p>Obrigado volte sempre! 😊</p>
    `;
    
    // Mostrar o recibo em uma janela de impressão compacta
    const janelaImpressao = window.open('', '_blank', 'width=300,height=500');
    janelaImpressao.document.write('<html><head><title>Recibo de Compra</title>');
    janelaImpressao.document.write('<style>');
    janelaImpressao.document.write('body { font-family: monospace; font-size: 12px; width: 270px; margin: 0 auto; padding: 10px; }');
    janelaImpressao.document.write('h1 { text-align: center; font-size: 16px; }');
    janelaImpressao.document.write('p { margin: 3px 0; }');
    janelaImpressao.document.write('@media print { @page { size: 80mm auto; margin: 0; } body { width: 100%; } }');
    janelaImpressao.document.write('</style>');
    janelaImpressao.document.write('</head><body>');
    janelaImpressao.document.write(recibo.innerHTML);
    janelaImpressao.document.write('</body></html>');
    janelaImpressao.document.close();
    
    // Imprimir automaticamente após carregar
    janelaImpressao.onload = function() {
        janelaImpressao.focus();
        janelaImpressao.print();
        setTimeout(function() { janelaImpressao.close(); }, 1000);
    };
}



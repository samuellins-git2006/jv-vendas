// Banco de dados local do navegador
let vendas = JSON.parse(localStorage.getItem('jv_vendas')) || [];
let despesas = JSON.parse(localStorage.getItem('jv_despesas')) || [];
let clientes = JSON.parse(localStorage.getItem('jv_clientes')) || [];

// 🔒 FUNÇÃO DE LOGIN
function executarLogin() {
    const emailInformado = document.getElementById('login-email').value.trim();
    const senhaInformada = document.getElementById('login-senha').value;

    // Credenciais definidas por você
    if (emailInformado === 'joaovictor.7z' && senhaInformada === 'jvendas') {
        // Esconde a tela de login e mostra o painel principal
        document.getElementById('tela-login').classList.add('oculto');
        document.getElementById('conteudo-sistema').classList.remove('oculto');
        
        // Inicializa as tabelas e dados na tela
        atualizarFinanceiro();
        renderizarClientes();
    } else {
        alert("E-mail ou Senha incorretos. Verifique os dados!");
    }
}

// Alternar Abas do Painel
function mudarAba(aba) {
    document.getElementById('aba-inicio').classList.add('oculto');
    document.getElementById('aba-clientes').classList.add('oculto');
    document.getElementById('btn-nav-inicio').classList.remove('ativo');
    document.getElementById('btn-nav-clientes').classList.remove('ativo');

    if (aba === 'inicio') {
        document.getElementById('aba-inicio').classList.remove('oculto');
        document.getElementById('btn-nav-inicio').classList.add('ativo');
    } else if (aba === 'clientes') {
        document.getElementById('aba-clientes').classList.remove('oculto');
        document.getElementById('btn-nav-clientes').classList.add('ativo');
    }
}

// 📊 CÁLCULOS FINANCEIROS INTELIGENTES
function atualizarFinanceiro() {
    let faturamentoBruto = 0; // Total que entrou das vendas

    vendas.forEach(v => {
        faturamentoBruto += parseFloat(v.valor);
    });

    let custoBebidasEstoque = 0; // Gastos específicos com reposição de bebidas
    let totalDespesasGerais = 0; // Soma de tudo (Bebidas, Gasolina, Manutenção)

    despesas.forEach(d => {
        totalDespesasGerais += parseFloat(d.valor);
        // Se a despesa for compra de estoque, o JavaScript soma no indicador de custo do produto automaticamente
        if (d.descricao === 'Compra de Bebidas') {
            custoBebidasEstoque += parseFloat(d.valor);
        }
    });

    // Lucro Bruto = O faturamento bruto menos o que gastou comprando bebidas
    let lucroBruto = faturamentoBruto - custoBebidasEstoque;
    // Lucro Líquido = Desconta absolutamente TUDO (incluindo combustível e manutenção)
    let lucroLiquido = faturamentoBruto - totalDespesasGerais;

    // Atualiza os números nos respectivos painéis visuais
    document.getElementById('card-vitrine').innerText = `R$ ${faturamentoBruto.toFixed(2)}`;
    document.getElementById('card-lucro-dia').innerText = `R$ ${lucroBruto.toFixed(2)}`;
    document.getElementById('card-gasto-unidade').innerText = `R$ ${custoBebidasEstoque.toFixed(2)}`;
    document.getElementById('card-gasto-total').innerText = `R$ ${totalDespesasGerais.toFixed(2)}`;
    document.getElementById('card-lucro-liquido-val').innerText = `R$ ${lucroLiquido.toFixed(2)}`;

    renderizarHistorico();
}

// Registrar uma nova Venda (Sem o campo de custo unitário)
function adicionarVenda() {
    const clienteSelecionado = document.getElementById('venda-cliente').value;
    const ponto = document.getElementById('venda-ponto').value;
    const valor = document.getElementById('venda-valor').value;

    if(!valor) return alert("Por favor, informe o valor da venda.");

    const novaVenda = {
        tipo: 'Venda',
        descricao: `${ponto ? ponto : 'Entrega'} - Cli: ${clienteSelecionado}`,
        valor: parseFloat(valor)
    };

    vendas.push(novaVenda);
    localStorage.setItem('jv_vendas', JSON.stringify(vendas));
    
    document.getElementById('venda-ponto').value = '';
    document.getElementById('venda-valor').value = '';

    atualizarFinanceiro();
}

// Registrar Despesa (Gasolina, Peças, Estoque)
function adicionarDespesa() {
    const categoria = document.getElementById('despesa-categoria').value;
    const valor = document.getElementById('despesa-valor').value;

    if(!valor) return alert("Insira o valor do gasto.");

    const novaDespesa = {
        tipo: 'Despesa',
        descricao: categoria,
        valor: parseFloat(valor)
    };

    despesas.push(novaDespesa);
    localStorage.setItem('jv_despesas', JSON.stringify(despesas));
    document.getElementById('despesa-valor').value = '';

    atualizarFinanceiro();
}

// Histórico com opção de Remoção para Correções
function renderizarHistorico() {
    const corpoTabela = document.getElementById('lista-historico');
    corpoTabela.innerHTML = '';

    // Mapeia guardando a posição original no banco de dados para não apagar a linha errada
    const vMapeadas = vendas.map((v, i) => ({ ...v, idx: i, tabela: 'venda' }));
    const dMapeadas = despesas.map((d, i) => ({ ...d, idx: i, tabela: 'despesa' }));

    const feedUnico = [...vMapeadas, ...dMapeadas];
    feedUnico.reverse(); // Mais recente no topo

    feedUnico.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="color: ${item.tipo === 'Venda' ? '#10B981' : '#EF4444'}"><strong>${item.tipo}</strong></td>
            <td>${item.descricao}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
            <td>
                <button onclick="removerItemDoHistorico('${item.tabela}', ${item.idx})" class="btn-deletar-linha">🗑️</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Função para APAGAR lançamentos incorretos
function removerItemDoHistorico(tabela, posicaoOriginal) {
    if (confirm("Quer mesmo remover este item do histórico? Os lucros serão recalculados.")) {
        if (tabela === 'venda') {
            vendas.splice(posicaoOriginal, 1);
            localStorage.setItem('jv_vendas', JSON.stringify(vendas));
        } else if (tabela === 'despesa') {
            despesas.splice(posicaoOriginal, 1);
            localStorage.setItem('jv_despesas', JSON.stringify(despesas));
        }
        atualizarFinanceiro();
    }
}

// Gestão de Clientes e sincronia com o formulário de Vendas
function adicionarCliente() {
    const nome = document.getElementById('cliente-nome').value.trim();
    const fone = document.getElementById('cliente-fone').value;
    const demanda = document.getElementById('cliente-demanda').value;

    if(!nome) return alert("Digite o nome do cliente.");

    const novoCliente = { nome, fone, demanda };
    clientes.push(novoCliente);
    localStorage.setItem('jv_clientes', JSON.stringify(clientes));

    document.getElementById('cliente-nome').value = '';
    document.getElementById('cliente-fone').value = '';

    renderizarClientes();
}

function renderizarClientes() {
    const tabela = document.getElementById('lista-clientes');
    tabela.innerHTML = '';

    clientes.forEach(c => {
        const classeBadge = c.demanda === 'Alta' ? 'badge-alta' : 'badge-baixa';
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td>${c.fone || 'Sem Tel'}</td>
            <td><span class="badge ${classeBadge}">${c.demanda}</span></td>
        `;
        tabela.appendChild(linha);
    });

    atualizarDropdownClientes();
}

function atualizarDropdownClientes() {
    const selectCliente = document.getElementById('venda-cliente');
    selectCliente.innerHTML = '<option value="Geral">👤 Cliente Geral</option>';
    
    clientes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nome;
        opt.innerText = `👤 ${c.nome}`;
        selectCliente.appendChild(opt);
    });
}
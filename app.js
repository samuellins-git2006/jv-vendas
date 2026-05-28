// Inicializando os dados vindos do Banco de Dados local (LocalStorage)
let vendas = JSON.parse(localStorage.getItem('jv_vendas')) || [];
let despesas = JSON.parse(localStorage.getItem('jv_despesas')) || [];
let clientes = JSON.parse(localStorage.getItem('jv_clientes')) || [];

// Função para alternar entre as telas (Abas)
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

// Executar cálculos financeiros na tela
function atualizarFinanceiro() {
    let faturamentoBruto = 0;
    let custoBebidasAdquiridas = 0;
    let lucroDoDia = 0;

    vendas.forEach(v => {
        faturamentoBruto += parseFloat(v.valor);
        custoBebidasAdquiridas += parseFloat(v.custo || 0);
    });

    let totalDespesasGerais = 0;
    despesas.forEach(d => {
        totalDespesasGerais += parseFloat(d.valor);
    });

    // O Lucro Líquido desconta o custo do produto e os gastos com combustível/manutenção
    let lucroLiquido = faturamentoBruto - custoBebidasAdquiridas - totalDespesasGerais;

    // Atualiza os painéis na tela
    document.getElementById('card-vitrine').innerText = `R$ ${faturamentoBruto.toFixed(2)}`;
    document.getElementById('card-lucro-dia').innerText = `R$ ${(faturamentoBruto - custoBebidasAdquiridas).toFixed(2)}`;
    document.getElementById('card-gasto-unidade').innerText = `R$ ${custoBebidasAdquiridas.toFixed(2)}`;
    document.getElementById('card-gasto-total').innerText = `R$ ${totalDespesasGerais.toFixed(2)}`;
    document.getElementById('card-lucro-liquido-val').innerText = `R$ ${lucroLiquido.toFixed(2)}`;

    renderizarHistorico();
}

// Registrar uma Venda
function adicionarVenda() {
    const cliente = document.getElementById('venda-cliente').value;
    const ponto = document.getElementById('venda-ponto').value;
    const valor = document.getElementById('venda-valor').value;
    const custo = document.getElementById('venda-custo').value;

    if(!valor || !custo) return alert("Por favor, preencha os valores de venda e custo.");

    const novaVenda = {
        tipo: 'Venda',
        descricao: `${ponto ? ponto : 'Direta'} - Cliente: ${cliente || 'Geral'}`,
        valor: parseFloat(valor),
        custo: parseFloat(custo)
    };

    vendas.push(novaVenda);
    localStorage.setItem('jv_vendas', JSON.stringify(vendas));
    
    // Limpar campos
    document.getElementById('venda-cliente').value = '';
    document.getElementById('venda-ponto').value = '';
    document.getElementById('venda-valor').value = '';
    document.getElementById('venda-custo').value = '';

    atualizarFinanceiro();
}

// Registrar uma Despesa (Combustível, Peças da Moto, etc)
function adicionarDespesa() {
    const categoria = document.getElementById('despesa-categoria').value;
    const valor = document.getElementById('despesa-valor').value;

    if(!valor) return alert("Insira o valor da despesa.");

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

// Mostrar Histórico na Tela
function renderizarHistorico() {
    const corpoTabela = document.getElementById('lista-historico');
    corpoTabela.innerHTML = '';

    // Unir as duas listas para mostrar no mesmo feed
    const tudo = [
        ...vendas.map(v => ({...v, classe: 'card-verde'})), 
        ...despesas.map(d => ({...d, classe: 'card-vermelho'}))
    ];

    tudo.reverse().forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td style="color: ${item.tipo === 'Venda' ? '#10B981' : '#EF4444'}"><strong>${item.tipo}</strong></td>
            <td>${item.descricao}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Controle de Clientes
function adicionarCliente() {
    const nome = document.getElementById('cliente-nome').value;
    const fone = document.getElementById('cliente-fone').value;
    const demanda = document.getElementById('cliente-demanda').value;

    if(!nome) return alert("Preencha o nome do cliente.");

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
}

// Inicialização automática ao abrir o App
atualizarFinanceiro();
renderizarClientes();
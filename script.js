// Elementos do DOM
const creditsScreen = document.getElementById('credits-screen');
const drawButton = document.getElementById('draw-button');
const downloadPdfBtn = document.getElementById('download-pdf');
const namesContainer = document.getElementById('names-container');
const resultsSection = document.getElementById('results-section');
const confirmationModal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
const configSection = document.querySelector('.config-section');
const topicsInput = document.getElementById('topics-input');
const namesPerGroupValue = document.getElementById('names-per-group-value');
const decreaseNamesPerGroupBtn = document.getElementById('decrease-names-per-group');
const increaseNamesPerGroupBtn = document.getElementById('increase-names-per-group');

// Novos elementos para switch e analytics
const forceDistributionSwitch = document.getElementById('force-distribution-switch');
const totalNamesElement = document.getElementById('total-names');
const namesPerGroupDisplayElement = document.getElementById('names-per-group-display');
const completeGroupsElement = document.getElementById('complete-groups');
const remainingPeopleElement = document.getElementById('remaining-people');
const totalGroupsElement = document.getElementById('total-groups');

// Elementos para líder chefe
// const leaderSection = document.getElementById('leader-section');
// const groupSelector = document.getElementById('group-selector');
// const drawLeaderBtn = document.getElementById('draw-leader-btn');
// const leaderResult = document.getElementById('leader-result');
// const leaderNameElement = document.getElementById('leader-name');

// Elementos para histórico
const saveToHistoryBtn = document.getElementById('save-to-history');
const historySection = document.getElementById('history-section');
const historyContainer = document.getElementById('history-container');
const clearHistoryBtn = document.getElementById('clear-history');

// === Chatbot Flutuante ===
const chatbotFab = document.getElementById('chatbot-fab');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');

let currentNamesPerGroup = 2;
let currentGroups = []; // Para armazenar os grupos atuais
let groupLeaders = {}; // Para armazenar os líderes de cada grupo
let historyPage = 0;
let grupoTagsSorteadas = [];

// Estado do chat
let chatbotOpen = false;

// Funções de Utilidade
function showLoading() {
    creditsScreen.classList.remove('hidden');
}

function hideLoading() {
    creditsScreen.classList.add('hidden');
}

function showModal(message) {
    modalMessage.textContent = message;
    confirmationModal.classList.add('show');
}

function hideModal() {
    confirmationModal.classList.remove('show');
}

function processInput(input) {
    return input
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => item.toUpperCase());
}

// Gerenciamento de Tópicos

// Gerenciamento de Nomes

// Processamento de Nomes e Tópicos
function getAllNames() {
    const nameInput = document.querySelector('#names-container .name-input');
    if (nameInput) {
        return processInput(nameInput.value);
    } else {
        console.error('Elemento de nomes não encontrado.');
        return [];
    }
}

function getAllTopics() {
    const topicsInput = document.getElementById('topics-input');
    return topicsInput.value.split(/[\n,]/)
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);
}

// Controle da quantidade de nomes por grupo
decreaseNamesPerGroupBtn.addEventListener('click', () => {
    if (currentNamesPerGroup > 1) {
        currentNamesPerGroup--;
        namesPerGroupValue.textContent = currentNamesPerGroup;
        updateAnalytics();
    }
});

increaseNamesPerGroupBtn.addEventListener('click', () => {
    currentNamesPerGroup++;
    namesPerGroupValue.textContent = currentNamesPerGroup;
    updateAnalytics();
});

// Função para atualizar analytics
function updateAnalytics() {
    const names = getAllNames();
    const totalNames = names.length;
    const namesPerGroup = currentNamesPerGroup;
    const forceDistribution = forceDistributionSwitch.checked;

    // Calcular grupos completos
    const completeGroups = Math.floor(totalNames / namesPerGroup);
    // Calcular pessoas restantes
    let remainingPeople = totalNames % namesPerGroup;
    // Calcular total de grupos estimados
    let totalGroups = completeGroups;
    if (remainingPeople > 0) {
        if (forceDistribution) {
            // Distribuir as pessoas restantes entre os grupos existentes
            totalGroups = completeGroups;
            remainingPeople = 0;
        } else {
            // Criar um grupo adicional para as pessoas restantes
            totalGroups = completeGroups + 1;
        }
    }

    // Atualizar elementos na tela
    totalNamesElement.textContent = totalNames;
    namesPerGroupDisplayElement.textContent = namesPerGroup;
    completeGroupsElement.textContent = completeGroups;
    remainingPeopleElement.textContent = remainingPeople;
    totalGroupsElement.textContent = totalGroups;

    // Atualizar sugestões matemáticas
    updateAnalyticsMath();
}

// Event listeners para atualizar analytics
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('name-input')) {
        updateAnalytics();
    }
});

forceDistributionSwitch.addEventListener('change', updateAnalytics);

// Função para obter o filtro selecionado
function getFiltroSorteio() {
    const checked = document.querySelector('input[name="filtro-sorteio"]:checked');
    return checked ? checked.value : 'aleatorio';
}

// Função para processar nomes conforme o filtro
async function processarNomesFiltro(nomes) {
    const filtro = getFiltroSorteio();
    let lista = [...nomes];
    if (filtro === 'genero') {
        // Mostra animação de sorteio enquanto espera IA
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Detectando gênero e equilibrando grupos com IA... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        return await sortearPorGeneroIA(lista);
    }
    if (filtro === 'genero_exclusivo') {
        // IA separa homens e mulheres
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Separando grupos só de homens e só de mulheres... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        return await sortearPorGeneroExclusivoIA(lista);
    }
    if (filtro === 'proporcao_genero') {
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Montando grupos com proporção de gênero... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        const homens = parseInt(document.getElementById('input-homens-grupo').value) || 0;
        const mulheres = parseInt(document.getElementById('input-mulheres-grupo').value) || 0;
        return await sortearPorProporcaoGeneroIA(lista, homens, mulheres);
    }
    if (filtro === 'similaridade_nome') {
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Agrupando nomes parecidos... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        return await sortearPorSimilaridadeNomeIA(lista);
    }
    if (filtro === 'frequencia_participacao') {
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Evitando repetição de grupos anteriores... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        return await sortearPorFrequenciaParticipacaoIA(lista);
    }
    if (filtro === 'frequencia_letras') {
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Agrupando por frequência de letras... <span class="shuffle-dot">🤖</span></div>';
        resultsSection.classList.remove('hidden');
        await new Promise(resolve => setTimeout(resolve, 300));
        return await sortearPorFrequenciaLetrasIA(lista);
    }
    switch (filtro) {
        case 'alfabetica':
            return lista.sort((a, b) => a.localeCompare(b));
        case 'pares':
            return lista.filter((_, i) => i % 2 === 1);
        case 'impares':
            return lista.filter((_, i) => i % 2 === 0);
        case 'tamanho':
            return lista.sort((a, b) => a.length - b.length);
        case 'inicial':
            return lista.sort((a, b) => {
                const aIni = a[0].toUpperCase();
                const bIni = b[0].toUpperCase();
                return aIni.localeCompare(bIni);
            });
        case 'paridade':
            return lista.sort((a, b) => (a.length % 2) - (b.length % 2));
        case 'palavras':
            return lista.sort((a, b) => (a.split(' ').length - b.split(' ').length));
        case 'reversa':
            return lista.reverse();
        default:
            return lista.sort(() => Math.random() - 0.5);
    }
}

// Função para sortear por gênero usando IA Gemini
async function sortearPorGeneroIA(lista) {
    // Chave Gemini fornecida pelo usuário
    const GEMINI_API_KEY = 'AIzaSyAY6aPmVpc_1xw_LofwpW6x3EL5RFlKHSo';
    // Monta prompt para IA
    const prompt = `Classifique cada nome como masculino ou feminino. Responda apenas com uma lista JSON de objetos: [{nome: "NOME", genero: "masculino"|"feminino"|"indefinido"}]. Nomes: ${lista.join(', ')}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    const data = await response.json();
    let result = lista;
    try {
        const jsonText = data.candidates[0].content.parts[0].text.match(/\[.*\]/s)[0];
        const parsed = JSON.parse(jsonText);
        // Alterna masculino/feminino para equilibrar
        const masc = parsed.filter(p => p.genero === 'masculino').map(p => p.nome);
        const fem = parsed.filter(p => p.genero === 'feminino').map(p => p.nome);
        const indef = parsed.filter(p => p.genero === 'indefinido').map(p => p.nome);
        let final = [];
        while (masc.length || fem.length) {
            if (masc.length) final.push(masc.shift());
            if (fem.length) final.push(fem.shift());
        }
        final = final.concat(indef);
        return final;
    } catch {
        return lista;
    }
}

// IA: Separar homens e mulheres em grupos exclusivos
async function sortearPorGeneroExclusivoIA(lista) {
    const GEMINI_API_KEY = 'AIzaSyAY6aPmVpc_1xw_LofwpW6x3EL5RFlKHSo';
    const prompt = `Classifique cada nome como masculino ou feminino. Responda apenas com uma lista JSON de objetos: [{nome: "NOME", genero: "masculino"|"feminino"|"indefinido"}]. Nomes: ${lista.join(', ')}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    try {
        const jsonText = data.candidates[0].content.parts[0].text.match(/\[.*\]/s)[0];
        const parsed = JSON.parse(jsonText);
        const masc = parsed.filter(p => p.genero === 'masculino').map(p => p.nome);
        const fem = parsed.filter(p => p.genero === 'feminino').map(p => p.nome);
        const indef = parsed.filter(p => p.genero === 'indefinido').map(p => p.nome);
        return masc.concat(fem, indef);
    } catch {
        return lista;
    }
}

// IA: Agrupar por similaridade de nome
async function sortearPorSimilaridadeNomeIA(lista) {
    // Agrupa nomes que começam igual ou rimam (simplificado)
    // Aqui usamos apenas o início do nome para agrupar (exemplo prático)
    lista.sort((a, b) => {
        const aIni = a.split(' ')[0].slice(0, 3).toLowerCase();
        const bIni = b.split(' ')[0].slice(0, 3).toLowerCase();
        return aIni.localeCompare(bIni);
    });
    return lista;
}

// IA: Evitar repetição de grupos anteriores
async function sortearPorFrequenciaParticipacaoIA(lista) {
    // Busca histórico e tenta não repetir grupos
    const history = getHistory();
    if (history.length === 0) return lista;
    // Cria um mapa de pares que já estiveram juntos
    let pares = {};
    history.forEach(item => {
        item.groups.forEach(g => {
            for (let i = 0; i < g.names.length; i++) {
                for (let j = i + 1; j < g.names.length; j++) {
                    const key = [g.names[i], g.names[j]].sort().join('|');
                    pares[key] = (pares[key] || 0) + 1;
                }
            }
        });
    });
    // Ordena para tentar separar quem mais já esteve junto
    lista.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        lista.forEach(x => {
            if (x !== a) scoreA += pares[[a, x].sort().join('|')] || 0;
            if (x !== b) scoreB += pares[[b, x].sort().join('|')] || 0;
        });
        return scoreA - scoreB;
    });
    return lista;
}

// IA: Agrupar por frequência de letras
async function sortearPorFrequenciaLetrasIA(lista) {
    // Conta frequência de cada letra nos nomes
    let freq = {};
    lista.forEach(nome => {
        for (let c of nome.replace(/[^A-Za-z]/g, '').toLowerCase()) {
            freq[c] = (freq[c] || 0) + 1;
        }
    });
    // Soma frequência total de cada nome
    lista.sort((a, b) => {
        const fa = a.replace(/[^A-Za-z]/g, '').toLowerCase().split('').reduce((s, c) => s + (freq[c] || 0), 0);
        const fb = b.replace(/[^A-Za-z]/g, '').toLowerCase().split('').reduce((s, c) => s + (freq[c] || 0), 0);
        return fb - fa;
    });
    return lista;
}

// Modificar drawNames para aplicar o filtro antes do sorteio
function drawNames() {
    const names = getAllNames();
    const topics = getAllTopics();
    const namesPerGroup = currentNamesPerGroup;
    const forceDistribution = forceDistributionSwitch.checked;

    if (names.length === 0) {
        showModal('Por favor, adicione pelo menos um nome para realizar o sorteio.');
        return;
    }

    // Não mostrar mais o modal de créditos durante o sorteio
    // showLoading();

    // Oculta a seção de configuração antes de sortear
    configSection.classList.add('hidden');

    // Aplica filtro antes de embaralhar
    processarNomesFiltro(names).then(nomesFiltrados => {
        animateShuffle(nomesFiltrados, topics, namesPerGroup, forceDistribution);
    });
}

// Nova função de animação de embaralhamento
function animateShuffle(names, topics, namesPerGroup, forceDistribution) {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = '<div class="shuffle-animation" style="text-align:center;padding:2rem;font-size:1.5rem;">Embaralhando nomes... <span class="shuffle-dot">🔄</span></div>';
    resultsSection.classList.remove('hidden');

    let shuffleCount = 0;
    const maxShuffles = 15;
    let tempNames = [...names];

    const interval = setInterval(() => {
        // Embaralha nomes temporariamente
        tempNames = tempNames.sort(() => Math.random() - 0.5);
        // Mostra uma tabela temporária
        let tableHTML = '<table class="results-table"><thead><tr>';
        tableHTML += '<th>TÓPICO</th><th>GRUPO</th>';
        for (let i = 1; i <= namesPerGroup; i++) tableHTML += `<th>NOME ${i}</th>`;
        tableHTML += '<th class="acao-col">AÇÃO</th></tr></thead><tbody>';
        let idx = 0;
        for (let g = 0; g < Math.ceil(tempNames.length / namesPerGroup); g++) {
            tableHTML += `<tr><td>-</td><td>Grupo ${g + 1}</td>`;
            for (let n = 0; n < namesPerGroup; n++) {
                tableHTML += `<td>${tempNames[idx] ? tempNames[idx] : '-'}</td>`;
                idx++;
            }
            tableHTML += '<td class="acao-col"><button class="btn-sortear-lider" disabled>Sortear Líder</button></td></tr>';
        }
        tableHTML += '</tbody></table>';
        resultsContainer.innerHTML = tableHTML;
        shuffleCount++;
        if (shuffleCount >= maxShuffles) {
            clearInterval(interval);
            // Exibe o resultado final
    setTimeout(() => {
                // ... código de sorteio final ...
        const groups = [];
        const shuffledNames = [...names].sort(() => Math.random() - 0.5);
        const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);
        if (shuffledTopics.length > 0) {
            const numTopics = shuffledTopics.length;
            let currentNameIndex = 0;
                    for (let i = 0; i < numTopics && currentNameIndex < shuffledNames.length; i++) {
                const topic = shuffledTopics[i];
                const groupNames = shuffledNames.slice(currentNameIndex, currentNameIndex + namesPerGroup);
                groups.push({ topic: topic, names: groupNames });
                        currentNameIndex += groupNames.length;
                    }
                    const remainingNames = shuffledNames.slice(currentNameIndex);
                    if (remainingNames.length > 0) {
                        if (forceDistribution) {
                            const remainingNamesShuffled = [...remainingNames].sort(() => Math.random() - 0.5);
                            remainingNamesShuffled.forEach((name, index) => {
                                const targetGroupIndex = index % groups.length;
                                groups[targetGroupIndex].names.push(name);
                            });
                        } else {
                            for (let i = 0; i < remainingNames.length; i += namesPerGroup) {
                                const groupNames = remainingNames.slice(i, i + namesPerGroup);
                                const topicIndex = (groups.length + Math.floor(i / namesPerGroup)) % shuffledTopics.length;
                                const topic = shuffledTopics[topicIndex] || '';
                groups.push({ topic: topic, names: groupNames });
                            }
                        }
                    }
            for (let i = groups.length; i < numTopics; i++) {
                groups.push({ topic: shuffledTopics[i], names: [] });
            }
        } else {
                    const totalNames = shuffledNames.length;
                    const completeGroups = Math.floor(totalNames / namesPerGroup);
                    const remainingPeople = totalNames % namesPerGroup;
                    for (let i = 0; i < completeGroups; i++) {
                        const groupNames = shuffledNames.slice(i * namesPerGroup, (i + 1) * namesPerGroup);
                groups.push({ topic: '', names: groupNames });
            }
                    if (remainingPeople > 0) {
                        if (forceDistribution) {
                            const remainingNames = shuffledNames.slice(completeGroups * namesPerGroup);
                            const remainingNamesShuffled = [...remainingNames].sort(() => Math.random() - 0.5);
                            remainingNamesShuffled.forEach((name, index) => {
                                const targetGroupIndex = index % groups.length;
                                groups[targetGroupIndex].names.push(name);
                            });
                        } else {
                            const remainingNames = shuffledNames.slice(completeGroups * namesPerGroup);
                            groups.push({ topic: '', names: remainingNames });
                        }
                    }
                }
        displayResults(groups);
                currentGroups = groups;
                groupLeaders = {};
                saveToHistory();
            }, 300);
        }
    }, 60);
}

// Exibição dos Resultados
function displayResults(groups) {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = '';

    if (groups.length === 0) {
        resultsContainer.innerHTML = '<p>Nenhum resultado para exibir.</p>';
        resultsSection.classList.remove('hidden');
        addDragToTable();
        return;
    }

    const maxNames = Math.max(0, ...groups.map(group => group.names.length));

    let tableHTML = '<table class="results-table"><thead><tr>';
    tableHTML += '<th>TÓPICO</th>';
    tableHTML += '<th>GRUPO</th>';
    tableHTML += '<th class="grupo-tag-col">TAG</th>';
    for (let i = 1; i <= maxNames; i++) {
        tableHTML += `<th>NOME ${i}</th>`;
    }
    tableHTML += '<th class="acao-col">AÇÃO</th>';
    tableHTML += '</tr></thead><tbody>';

    groups.forEach((group, index) => {
        const groupNumber = index + 1;
        tableHTML += `<tr class="group-row group-row-${index}">`;
        tableHTML += `<td>${group.topic || '-'}</td>`;
        tableHTML += `<td>Grupo ${groupNumber}</td>`;
        // Tag sorteada
        let tag = '';
        if (grupoTagsSorteadas && grupoTagsSorteadas.length === groups.length) {
            tag = `<span class='grupo-tag-badge'>${grupoTagsSorteadas[index]}</span>`;
        }
        tableHTML += `<td class="grupo-tag-col">${tag}</td>`;
        // Nomes
        for (let i = 0; i < maxNames; i++) {
            const name = group.names[i] || '-';
            if (groupLeaders[groupNumber] && name === groupLeaders[groupNumber]) {
                tableHTML += `<td><div class='lider-tag-stack'><span class="leader-badge"><i class='fas fa-crown'></i> Líder</span><span class="rgb-leader">${name}</span></div></td>`;
            } else {
                tableHTML += `<td>${name}</td>`;
            }
        }
        // Coluna ação
        tableHTML += `<td class="acao-col">
            <button class="btn-sortear-lider" data-group="${groupNumber}">${groupLeaders[groupNumber] ? 'Resortear Líder' : 'Sortear Líder'}</button>
        </td>`;
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';

    resultsContainer.innerHTML = tableHTML;
    resultsSection.classList.remove('hidden');

    document.querySelectorAll('.btn-sortear-lider').forEach(btn => {
        btn.addEventListener('click', function() {
            const groupNumber = parseInt(this.getAttribute('data-group'));
            // Não desabilita mais o botão, apenas muda o texto
            const group = groups[groupNumber - 1];
            const availableMembers = group.names.filter(name => name && name.trim() !== '-');
            if (availableMembers.length === 0) {
                showPushNotification('Não há membros válidos neste grupo!', 'error');
                return;
            }
            this.classList.add('sorteando');
            const row = this.closest('tr');
            const nameCells = Array.from(row.querySelectorAll('td')).slice(3, 3 + group.names.length);
            nameCells.forEach(cell => cell.classList.add('pisca-lider'));
            setTimeout(() => {
                this.classList.remove('sorteando');
                nameCells.forEach(cell => cell.classList.remove('pisca-lider'));
                const randomIndex = Math.floor(Math.random() * availableMembers.length);
                const leaderName = availableMembers[randomIndex];
                groupLeaders[groupNumber] = leaderName;
                displayResults(groups);
                showPushNotification(`Líder sorteado: ${leaderName}!`, 'success');
                // Troca o texto do botão para 'Resortear Líder'
                setTimeout(() => {
                    const btnAtual = document.querySelector(`.btn-sortear-lider[data-group='${groupNumber}']`);
                    if (btnAtual) btnAtual.textContent = 'Resortear Líder';
                }, 100);
            }, 1000);
        });
    });

    addDragToTable();
}

// Função para adicionar a funcionalidade de arrastar à tabela
function addDragToTable() {
    const resultsTable = document.querySelector('.results-table');

    if (resultsTable && resultsTable.dataset.dragListenersAdded) {
         return;
    }

    if (resultsTable) {
        let mouseDown = false;
        let startX, scrollLeft;

        resultsTable.addEventListener('mousedown', (e) => {
            mouseDown = true;
            resultsTable.classList.add('active-drag');
            startX = e.pageX - resultsTable.offsetLeft;
            scrollLeft = resultsTable.scrollLeft;
        });

        resultsTable.addEventListener('mouseleave', () => {
            mouseDown = false;
            resultsTable.classList.remove('active-drag');
        });

        resultsTable.addEventListener('mouseup', () => {
            mouseDown = false;
            resultsTable.classList.remove('active-drag');
        });

        resultsTable.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            e.preventDefault();
            const x = e.pageX - resultsTable.offsetLeft;
            const walk = (x - startX) * 2;
            resultsTable.scrollLeft = scrollLeft - walk;
        });

        resultsTable.dataset.dragListenersAdded = 'true';
    }
}

// Event Listeners
drawButton.addEventListener('click', drawNames);

downloadPdfBtn.addEventListener('click', () => {
    downloadResultsAsPDF();
});

// Adicionar listener para o novo botão de copiar
const copyToSpreadsheetBtn = document.getElementById('copy-to-spreadsheet');
copyToSpreadsheetBtn.addEventListener('click', copyResultsToSpreadsheet);

// Event listeners para histórico
// saveToHistoryBtn.addEventListener('click', saveToHistory);
clearHistoryBtn.addEventListener('click', clearHistory);

// Event listener para líder chefe
// drawLeaderBtn.addEventListener('click', drawLeader);

// Funções do Modal (ainda pode ser usado para outras mensagens)
// modalConfirm.addEventListener('click', hideModal);
// modalCancel.addEventListener('click', hideModal);

// Função para exibir a notificação push/toast
function showPushNotification(message, type = 'info') { // type pode ser 'success', 'error', 'info'
    const notificationElement = document.getElementById('push-notification');
    notificationElement.textContent = message;
    notificationElement.className = 'push-notification show'; // Reset classes e mostra
    if (type) {
        notificationElement.classList.add(type);
    }

    // Ocultar após alguns segundos
    setTimeout(() => {
        notificationElement.classList.remove('show');
         // Remover classes de tipo após ocultar
        setTimeout(() => {
             notificationElement.className = 'push-notification hidden'; // Oculta totalmente e remove classes
        }, 300); // Tempo igual à transição CSS
    }, 3000); // Exibir por 3 segundos (ajuste conforme necessário)
}

// Função para copiar resultados para planilha
function copyResultsToSpreadsheet() {
    const table = document.querySelector('.results-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    let textToCopy = '';

    if (rows.length === 0) {
        showPushNotification('Nenhum resultado para copiar.', 'info');
        return;
    }

    rows.forEach((row, index) => {
        const cells = Array.from(row.querySelectorAll('td'));
        const topic = cells[0].textContent.trim() || '-';
        const groupNumber = cells[1].textContent.trim(); // Ex: Grupo 1
        const names = cells.slice(2)
                           .map(td => td.textContent.trim())
                           .filter(name => name.length > 0 && name !== '-');

        // Formato: Grupo X - Tópico
        textToCopy += `${groupNumber}${topic !== '-' ? ' - ' + topic : ''}\n`;

        // Formato: - Nome
        if (names.length > 0) {
            names.forEach(name => {
                textToCopy += `- ${name}\n`;
            });
        } else {
            textToCopy += `- Nenhum nome neste grupo\n`;
        }
        textToCopy += '\n'; // Linha em branco entre grupos
    });

    // Usar a API Clipboard para copiar
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showPushNotification('Resultados copiados!', 'success');
        })
        .catch(err => {
            console.error('Erro ao copiar resultados: ', err);
            showPushNotification('Erro ao copiar.', 'error');
        });
}

// Função para baixar resultados como PDF
function downloadResultsAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(); // Voltar para layout retrato, mais adequado para listas

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Adicionar título e informações
    doc.setFontSize(18);
    doc.text('Resultados da Roleta da Sorte', 10, 10);
    doc.setFontSize(12);
    doc.text(`Data: ${date}`, 10, 20);
    doc.text(`Hora: ${time}`, 10, 27);

    let yPos = 40; // Posição inicial y para o conteúdo dos resultados

    // Obter dados da tabela HTML (agora em formato de lista, uma linha por grupo)
    const table = document.querySelector('.results-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    if (rows.length === 0) {
        doc.setFontSize(12);
        doc.text('Nenhum resultado para exibir.', 10, yPos);
        yPos += 10;
    } else {
        rows.forEach((row, index) => {
            // Extrair dados da linha (Tópico, Grupo, Nomes)
            const cells = Array.from(row.querySelectorAll('td'));
            const topic = cells[0].textContent.trim() || '-';
            const groupNumber = cells[1].textContent.trim(); // Ex: Grupo 1
            const names = cells.slice(2) // Nomes começam da terceira célula
                               .map(td => td.textContent.trim())
                               .filter(name => name.length > 0 && name !== '-'); // Filtrar células vazias/tracinhos

            // Verificar se precisa adicionar nova página antes de adicionar o grupo
            if (yPos > doc.internal.pageSize.height - 30) { // 30 é uma margem de segurança para o rodapé e próximo grupo
                doc.addPage();
                yPos = 10; // Reiniciar yPos no topo da nova página
                 // O rodapé será adicionado no final
            }

            // Adicionar Tópico e Grupo
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${groupNumber}${topic !== '-' ? ' - ' + topic : ''}:`, 10, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 7; // Espaço após Tópico/Grupo

            // Adicionar Nomes em lista
            if (names.length > 0) {
                doc.setFontSize(10);
                names.forEach(name => {
                     if (yPos > doc.internal.pageSize.height - 25) { // Verificar quebra de página para nomes
                        doc.addPage();
                        yPos = 10; // Reiniciar yPos
                         // O rodapé será adicionado no final
                     }
                    doc.text(`• ${name}`, 15, yPos); // Indentar nomes
                    yPos += 6; // Espaço entre nomes
                });
            } else {
                 if (yPos > doc.internal.pageSize.height - 25) { // Verificar quebra de página para o indicador de vazio
                    doc.addPage();
                    yPos = 10; // Reiniciar yPos
                     // O rodapé será adicionado no final
                 }
                doc.setFontSize(10);
                doc.text('• Nenhum nome neste grupo', 15, yPos);
                yPos += 6;
            }

            yPos += 5; // Espaço extra entre grupos
        });
    }

    // Adicionar rodapé na última página
    doc.setFontSize(8);
    doc.text('© 2024 Roniere Marques. Todos os direitos reservados.', 10, doc.internal.pageSize.height - 10);

    // Salvar o PDF
    doc.save('resultados_roleta_sorte.pdf');
}

// Funções para gerenciar histórico
function saveToHistory() {
    const historyData = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
        groups: currentGroups,
        groupLeaders: groupLeaders,
        totalNames: getAllNames().length,
        namesPerGroup: currentNamesPerGroup,
        forceDistribution: forceDistributionSwitch.checked,
        topics: getAllTopics()
    };

    const history = getHistory();
    history.unshift(historyData); // Adicionar no início
    
    // Manter apenas os últimos 20 sorteios
    if (history.length > 20) {
        history.splice(20);
    }
    
    localStorage.setItem('roletaHistory', JSON.stringify(history));
    showPushNotification('Sorteio salvo no histórico!', 'success');
    loadHistory();
}

function getHistory() {
    const history = localStorage.getItem('roletaHistory');
    return history ? JSON.parse(history) : [];
}

function loadHistory(page = 0) {
    const history = getHistory();
    historyContainer.innerHTML = '';
    const nextBtn = document.getElementById('history-next');
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum sorteio salvo no histórico.</p>';
        nextBtn.style.display = 'none';
        return;
    }
    // Mostra apenas um sorteio por vez (paginado)
    const item = history[page];
    if (!item) return;
    const totalGroups = item.groups.length;
    const totalLeaders = Object.keys(item.groupLeaders).length;
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-item-header">
            <div>
                <div class="history-date">${item.date}</div>
                <div class="history-time">${item.time}</div>
            </div>
            <div class="history-actions">
                <button class="history-btn history-btn-restore" onclick="restoreFromHistory(${item.id})">
                    <i class="fas fa-undo"></i> Restaurar
                </button>
                <button class="history-btn history-btn-delete" onclick="deleteFromHistory(${item.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
        <div class="history-details">
            <div class="history-detail">
                <span class="history-detail-label">Total de nomes:</span>
                <span class="history-detail-value">${item.totalNames}</span>
            </div>
            <div class="history-detail">
                <span class="history-detail-label">Nomes por grupo:</span>
                <span class="history-detail-value">${item.namesPerGroup}</span>
            </div>
            <div class="history-detail">
                <span class="history-detail-label">Total de grupos:</span>
                <span class="history-detail-value">${totalGroups}</span>
            </div>
            <div class="history-detail">
                <span class="history-detail-label">Líderes sorteados:</span>
                <span class="history-detail-value">${totalLeaders}</span>
            </div>
            <div class="history-detail">
                <span class="history-detail-label">Distribuição forçada:</span>
                <span class="history-detail-value">${item.forceDistribution ? 'Sim' : 'Não'}</span>
            </div>
        </div>
    `;
    historyContainer.appendChild(historyItem);
    // Paginação
    if (history.length > page + 1) {
        nextBtn.style.display = '';
    } else {
        nextBtn.style.display = 'none';
    }
}

document.getElementById('history-next').addEventListener('click', () => {
    const history = getHistory();
    if (historyPage < history.length - 1) {
        historyPage++;
        loadHistory(historyPage);
    }
});

// Ao restaurar ou limpar, volta para a página 0
document.getElementById('clear-history').addEventListener('click', () => {
    historyPage = 0;
});

function restoreFromHistory(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    
    if (item) {
        // Restaurar configurações
        currentNamesPerGroup = item.namesPerGroup;
        namesPerGroupValue.textContent = currentNamesPerGroup;
        forceDistributionSwitch.checked = item.forceDistribution;
        
        // Restaurar nomes e tópicos
        const nameInput = document.querySelector('#names-container .name-input');
        if (nameInput) {
            nameInput.value = item.groups.flatMap(g => g.names).join('\n');
        }
        
        if (topicsInput) {
            topicsInput.value = item.topics.join('\n');
        }
        
        // Restaurar grupos e líderes
        currentGroups = item.groups;
        groupLeaders = item.groupLeaders;
        
        // Exibir resultados
        displayResults(currentGroups);
        
        // Atualizar analytics
        updateAnalytics();
        
        showPushNotification('Sorteio restaurado com sucesso!', 'success');
    }
}

function deleteFromHistory(id) {
    const history = getHistory();
    const filteredHistory = history.filter(h => h.id !== id);
    localStorage.setItem('roletaHistory', JSON.stringify(filteredHistory));
    loadHistory();
    showPushNotification('Item removido do histórico!', 'success');
}

function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        localStorage.removeItem('roletaHistory');
        loadHistory();
        showPushNotification('Histórico limpo com sucesso!', 'success');
    }
}

// Funções para líder chefe
function populateGroupSelector() {
    groupSelector.innerHTML = '<option value="">Selecione um grupo...</option>';
    if (!currentGroups || currentGroups.length === 0) return;
    currentGroups.forEach((group, index) => {
        const groupNumber = index + 1;
        const hasLeader = groupLeaders[groupNumber];
        const option = document.createElement('option');
        option.value = groupNumber;
        option.textContent = `Grupo ${groupNumber}${hasLeader ? ' (Líder: ' + hasLeader + ')' : ''}`;
        option.disabled = !!hasLeader;
        groupSelector.appendChild(option);
    });
}

function drawLeader() {
    const selectedGroup = parseInt(groupSelector.value);
    
    if (!selectedGroup) {
        showPushNotification('Por favor, selecione um grupo primeiro!', 'error');
        return;
    }
    
    if (groupLeaders[selectedGroup]) {
        showPushNotification('Este grupo já possui um líder!', 'error');
        return;
    }
    
    const group = currentGroups[selectedGroup - 1];
    if (!group || group.names.length === 0) {
        showPushNotification('Este grupo não possui membros!', 'error');
        return;
    }
    
    // Sortear líder
    const availableMembers = group.names.filter(name => name && name.trim() !== '');
    if (availableMembers.length === 0) {
        showPushNotification('Não há membros válidos neste grupo!', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableMembers.length);
    const leaderName = availableMembers[randomIndex];
    
    // Salvar líder
    groupLeaders[selectedGroup] = leaderName;
    
    // Exibir resultado
    leaderNameElement.textContent = leaderName;
    leaderResult.querySelector('.leader-group').textContent = `do Grupo ${selectedGroup}`;
    leaderResult.classList.remove('hidden');
    
    // Atualizar seletor de grupos
    populateGroupSelector();
    
    // Atualizar tabela de resultados
    displayResults(currentGroups);
    
    showPushNotification(`Líder sorteado: ${leaderName}!`, 'success');
}

function updateTableWithLeaders() {
    const table = document.querySelector('.results-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        const groupNumber = index + 1;
        const leader = groupLeaders[groupNumber];
        
        if (leader) {
            // Adicionar badge de líder na primeira célula de nome que contém o líder
            const nameCells = row.querySelectorAll('td').slice(2); // Pular tópico e número do grupo
            nameCells.forEach(cell => {
                if (cell.textContent.trim() === leader) {
                    // Remover badge existente se houver
                    const existingBadge = cell.querySelector('.leader-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }
                    
                    // Adicionar novo badge
                    const badge = document.createElement('span');
                    badge.className = 'leader-badge';
                    badge.innerHTML = '<i class="fas fa-crown"></i> Líder';
                    cell.appendChild(badge);
                }
            });
        }
    });
}

// Mostrar campos de proporção de gênero apenas quando o filtro correto estiver selecionado
const proporcaoGeneroConfig = document.getElementById('proporcao-genero-config');
document.querySelectorAll('input[name="filtro-sorteio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'proporcao_genero' && radio.checked) {
            proporcaoGeneroConfig.style.display = '';
        } else if (radio.checked) {
            proporcaoGeneroConfig.style.display = 'none';
        }
    });
});

// Botão para sortear ordem dos grupos (apenas tags)
const shuffleGroupsBtn = document.getElementById('shuffle-groups-btn');
if (shuffleGroupsBtn) {
    shuffleGroupsBtn.addEventListener('click', () => {
        if (!currentGroups || currentGroups.length === 0) return;
        // Gera uma ordem aleatória de tags
        const indices = Array.from({length: currentGroups.length}, (_, i) => i + 1);
        grupoTagsSorteadas = indices.sort(() => Math.random() - 0.5);
        displayResults(currentGroups);
        showPushNotification('Ordem dos grupos sorteada! Veja as tags.', 'success');
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        creditsScreen.classList.add('hidden');
    }, 4000);
    
    // Inicializar analytics
    updateAnalytics();
    
    // Carregar histórico
    loadHistory();
});

function updateAnalyticsMath() {
    const names = getAllNames();
    const total = names.length;
    const mathContent = document.getElementById('analytics-math-content');
    if (!mathContent) return;
    if (total === 0) {
        mathContent.innerHTML = '<span>Digite nomes para ver sugestões matemáticas de divisão de grupos.</span>';
        return;
    }
    let exatas = [];
    let quase = [];
    // Divisão exata
    for (let grupos = 2; grupos <= Math.min(10, total); grupos++) {
        if (total % grupos === 0) {
            exatas.push(`<tr class='math-exata'><td>${grupos}</td><td>${total / grupos}</td><td>Divisão exata</td></tr>`);
        }
    }
    // Divisão quase exata
    for (let grupos = 2; grupos <= Math.min(10, total); grupos++) {
        if (total % grupos !== 0) {
            const base = Math.floor(total / grupos);
            const resto = total % grupos;
            quase.push(`<tr class='math-quase'><td>${grupos}</td><td>${base} ou ${base + 1}</td><td>Restam ${resto}</td></tr>`);
        }
    }
    // Cálculos rápidos
    let calcs = `<tr class='math-calc'><td colspan='3'>
        Total ÷ 2 = <b>${(total / 2).toFixed(1)}</b> &nbsp;|&nbsp; Total ÷ 3 = <b>${(total / 3).toFixed(1)}</b> &nbsp;|&nbsp; Total ÷ 4 = <b>${(total / 4).toFixed(1)}</b><br>
        Total + 1 = <b>${total + 1}</b> &nbsp;|&nbsp; Total - 1 = <b>${total - 1}</b>
    </td></tr>`;
    // Monta tabela
    let table = `<table class='analytics-math-table'>
        <thead><tr><th>Grupos</th><th>Pessoas por grupo</th><th>Observação</th></tr></thead>
        <tbody>
        ${exatas.join('')}
        ${quase.slice(0, 3).join('')}
        ${calcs}
        </tbody>
    </table>`;
    mathContent.innerHTML = table;
}

// === Chatbot Flutuante ===
function toggleChatbot(open) {
    chatbotOpen = typeof open === 'boolean' ? open : !chatbotOpen;
    if (chatbotOpen) {
        chatbotWindow.classList.remove('hidden');
        chatbotInput.focus();
        // NÃO limpar o histórico do chat ao abrir
    } else {
        chatbotWindow.classList.add('hidden');
    }
}

chatbotFab.addEventListener('click', () => toggleChatbot(true));
chatbotClose.addEventListener('click', () => toggleChatbot(false));
document.addEventListener('keydown', e => {
    if (chatbotOpen && e.key === 'Escape') toggleChatbot(false);
});

// Função para converter markdown simples em HTML seguro para o chat
function markdownToHtml(text) {
    // Emojis: já são suportados nativamente
    // Negrito **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Itálico *texto* (mas não dentro de negrito)
    text = text.replace(/(^|\s)\*(?!\*)([^*]+)\*(?=\s|$)/g, '$1<i>$2</i>');
    // Listas com * ou - no início da linha
    // Marca cada item de lista
    text = text.replace(/(^|\n)[\*\-] (.*?)(?=\n|$)/g, '$1<li>$2</li>');
    // Agrupa blocos consecutivos de <li> em um único <ul>
    text = text.replace(/(<li>[\s\S]*?<\/li>)+/g, function(match) {
        return '<ul>' + match.replace(/\n/g, '') + '</ul>';
    });
    // Quebra de linha dupla vira <br>
    text = text.replace(/\n{2,}/g, '<br>');
    // Quebra de linha simples vira espaço
    text = text.replace(/\n/g, ' ');
    return text;
}

// Modificar addChatbotMessage para aceitar HTML seguro se for bot
function addChatbotMessage(text, sender = 'bot', loading = false, type = '') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-message ${sender}${type ? ' ' + type : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble';
    if (loading) {
        bubble.innerHTML = '<span class="chatbot-loading">Digitando<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>';
    } else if (sender === 'bot' && /\*|\-|<li>|<ul>|\n/.test(text)) {
        bubble.innerHTML = markdownToHtml(text);
    } else {
        bubble.textContent = text;
    }
    msgDiv.appendChild(bubble);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return bubble;
}

// Animação de loading
function animateLoadingDots(bubble) {
    let dots = 0;
    const interval = setInterval(() => {
        if (!bubble || !bubble.innerHTML.includes('Digitando')) return clearInterval(interval);
        dots = (dots + 1) % 4;
        bubble.innerHTML = 'Digitando' + '.'.repeat(dots);
    }, 400);
    return interval;
}

// Integração Gemini (simples, pode ser expandida)
async function callGemini(prompt) {
    const GEMINI_API_KEY = 'AIzaSyAY6aPmVpc_1xw_LofwpW6x3EL5RFlKHSo';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
        return 'Desculpe, não consegui entender ou responder a isso.';
    } catch (e) {
        return 'Erro ao conectar com a IA. Tente novamente.';
    }
}

// Nova função: processa intenção da IA e executa ações no sistema
async function interpretarEExecutarIA(promptUsuario) {
    // Captura o estado atual do sistema
    const nameInput = document.querySelector('#names-container .name-input');
    const nomesAtuais = nameInput ? nameInput.value.trim() : '';
    const topicosAtuais = topicsInput ? topicsInput.value.trim() : '';
    const filtroAtual = getFiltroSorteio();
    const quantidadeAtual = currentNamesPerGroup;
    const forcarDistribuicao = forceDistributionSwitch.checked;
    // Histórico do chat (últimas 10 mensagens)
    const chatMsgs = Array.from(document.querySelectorAll('.chatbot-message .chatbot-bubble')).slice(-10).map(e => e.textContent.trim());
    // Histórico de sorteios (último)
    const history = getHistory();
    const ultimoSorteio = history.length > 0 ? history[0] : null;
    // Contexto para a IA: explique o sistema, envie o estado atual e peça para responder com JSON de ação
    const contexto = `Você é um assistente virtual de atendimento ao cliente (SAC) para um sistema de sorteio de grupos. Sua missão é ajudar o usuário de forma natural, simpática, proativa e clara, como um atendente humano faria. Nunca diga que é apenas um modelo de linguagem. Sempre explique o que está fazendo, oriente o usuário, e execute ações no sistema quando possível, explicando de forma amigável e profissional.

O usuário pode pedir para:
- Preencher nomes
- Alterar quantidade de pessoas por grupo
- Escolher filtro de sorteio (alfabética, pares, ímpares, gênero, tamanho, inicial, paridade, palavras, reversa, aleatório, genero_exclusivo, similaridade_nome, frequencia_participacao, frequencia_letras)
- Sortear grupos
- Sortear líder
- Restaurar histórico
- Limpar nomes
- Adicionar nomes
- Preencher tópicos
- Ativar/desativar forçar distribuição de pessoas restantes
- Recarregar a página ou voltar para tela inicial

Sempre que possível, responda com um JSON no formato:
{"acao": "NOME_DA_ACAO", "parametros": { ... }}

Se o usuário pedir mais de uma ação, retorne um array de ações, por exemplo:
[{"acao": "setar_quantidade_grupo", "parametros": {"quantidade": 5}}, {"acao": "adicionar_nomes", "parametros": {"nomes": "Ana, João, Pedro"}}]

Exemplos:
Usuário: Quero grupos de 3 pessoas
Resposta: {"acao": "setar_quantidade_grupo", "parametros": {"quantidade": 3}}
Usuário: Filtro de gênero
Resposta: {"acao": "setar_filtro", "parametros": {"filtro": "genero"}}
Usuário: Adicione Ana, João e Pedro
Resposta: {"acao": "adicionar_nomes", "parametros": {"nomes": "Ana, João, Pedro"}}
Usuário: Limpar nomes
Resposta: {"acao": "limpar_nomes"}
Usuário: Sortear grupos
Resposta: {"acao": "sortear"}
Usuário: Sortear líder
Resposta: {"acao": "sortear_lider"}
Usuário: Restaurar sorteio
Resposta: {"acao": "restaurar_sorteio"}
Usuário: Preencher tópicos: Matemática, História
Resposta: {"acao": "preencher_topicos", "parametros": {"topicos": "Matemática, História"}}
Usuário: Ativar forçar distribuição
Resposta: {"acao": "forcar_distribuicao", "parametros": {"valor": true}}
Usuário: Desativar forçar distribuição
Resposta: {"acao": "forcar_distribuicao", "parametros": {"valor": false}}
Usuário: Recarregar página
Resposta: {"acao": "reload"}
Usuário: Voltar para tela inicial
Resposta: {"acao": "voltar_home"}

Se não for possível identificar uma ação, responda de forma natural, simpática e prestativa, oriente o usuário sobre o que ele pode pedir ou como usar o sistema. Nunca diga que é apenas um modelo de linguagem.

Estado atual do sistema:
- Nomes preenchidos: "${nomesAtuais}"
- Tópicos preenchidos: "${topicosAtuais}"
- Quantidade por grupo: ${quantidadeAtual}
- Filtro de sorteio: ${filtroAtual}
- Forçar distribuição: ${forcarDistribuicao}
- Último sorteio: ${ultimoSorteio ? JSON.stringify(ultimoSorteio) : 'nenhum'}
- Últimas mensagens do chat: ${JSON.stringify(chatMsgs)}
`;
    const promptFinal = contexto + '\nUsuário: ' + promptUsuario;
    const resposta = await callGemini(promptFinal);
    // Remove blocos markdown (```json ... ``` ou ``` ... ```)
    let respostaLimpa = resposta.replace(/```json[\s\S]*?```/gi, match => match.replace(/```json|```/gi, '').trim());
    respostaLimpa = respostaLimpa.replace(/```[\s\S]*?```/g, match => match.replace(/```/g, '').trim());
    // Tenta extrair JSON da resposta (array ou objeto), mesmo com quebras de linha
    try {
        // Extrai o maior array ou objeto JSON da resposta
        const match = respostaLimpa.match(/\[([\s\S]*?)\]|\{([\s\S]*?)\}/);
        if (match) {
            // Se for array, pega tudo entre o primeiro [ e o último ]
            if (match[0].startsWith('[')) {
                const start = respostaLimpa.indexOf('[');
                const end = respostaLimpa.lastIndexOf(']');
                const jsonStr = respostaLimpa.substring(start, end + 1);
                return JSON.parse(jsonStr);
            } else {
                // Se for objeto
                const start = respostaLimpa.indexOf('{');
                const end = respostaLimpa.lastIndexOf('}');
                const jsonStr = respostaLimpa.substring(start, end + 1);
                return JSON.parse(jsonStr);
            }
        }
    } catch (e) {
        return 'Erro ao interpretar a resposta da IA. Tente novamente ou refine o comando.';
    }
    return resposta;
}

// Executa uma ação (ou array de ações) retornada pela IA
async function handleChatbotPrompt(prompt) {
    if (prompt.trim().toLowerCase().startsWith('@web')) {
        return await callGemini('Responda em português do Brasil, seja objetivo e simpático. O usuário pediu: ' + prompt.replace(/@web/i, '').trim());
    }
    const acaoOuTexto = await interpretarEExecutarIA(prompt);
    if (typeof acaoOuTexto === 'string') return acaoOuTexto;
    if (Array.isArray(acaoOuTexto)) {
        let resumos = [];
        for (const acao of acaoOuTexto) {
            const resumo = await executarAcaoChatbot(acao);
            resumos.push(resumo);
        }
        // Mostra um resumo final das ações
        addChatbotMessage('Ações realizadas: ' + resumos.filter(Boolean).join(' | '), 'bot', false, 'status');
        return resumos.filter(Boolean).join(' | ');
    } else {
        return await executarAcaoChatbot(acaoOuTexto);
    }
}

// Função para executar uma ação individual com feedback visual
async function executarAcaoChatbot(acaoOuTexto) {
    let statusMsg = '';
    let processingMsg = '';
    switch (acaoOuTexto.acao) {
        case 'setar_quantidade_grupo':
            processingMsg = 'Alterando quantidade de pessoas por grupo...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            if (acaoOuTexto.parametros && acaoOuTexto.parametros.quantidade) {
                const qtd = parseInt(acaoOuTexto.parametros.quantidade);
                if (!isNaN(qtd) && qtd > 0) {
                    currentNamesPerGroup = qtd;
                    namesPerGroupValue.textContent = qtd;
                    namesPerGroupDisplayElement.textContent = qtd;
                    updateAnalytics();
                    statusMsg = `Quantidade de pessoas por grupo alterada para ${qtd}.`;
                } else {
                    statusMsg = 'Não foi possível alterar a quantidade.';
                }
            } else {
                statusMsg = 'Não foi possível alterar a quantidade.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'setar_filtro':
            processingMsg = 'Alterando filtro de sorteio...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            if (acaoOuTexto.parametros && acaoOuTexto.parametros.filtro) {
                const filtro = acaoOuTexto.parametros.filtro.toLowerCase();
                const radios = document.querySelectorAll('input[name="filtro-sorteio"]');
                let found = false;
                radios.forEach(radio => {
                    if (radio.value.toLowerCase().includes(filtro)) {
                        radio.checked = true;
                        found = true;
                    }
                });
                if (found) {
                    statusMsg = 'Filtro de sorteio alterado para: ' + filtro;
                } else {
                    statusMsg = 'Filtro não encontrado.';
                }
            } else {
                statusMsg = 'Não foi possível alterar o filtro.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'adicionar_nomes':
            processingMsg = 'Inserindo nomes...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            if (acaoOuTexto.parametros && acaoOuTexto.parametros.nomes) {
                const nameInput = document.querySelector('#names-container .name-input');
                if (nameInput) {
                    if (nameInput.value.trim() !== acaoOuTexto.parametros.nomes.trim()) {
                        nameInput.value = acaoOuTexto.parametros.nomes;
                    } else {
                        nameInput.value += (nameInput.value ? '\n' : '') + acaoOuTexto.parametros.nomes;
                    }
                    updateAnalytics();
                    statusMsg = 'Nome(s) adicionados/preenchidos.';
                } else {
                    statusMsg = 'Não foi possível adicionar nomes.';
                }
            } else {
                statusMsg = 'Não foi possível adicionar nomes.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'limpar_nomes':
            processingMsg = 'Limpando lista de nomes...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            const nameInputLimpar = document.querySelector('#names-container .name-input');
            if (nameInputLimpar) {
                nameInputLimpar.value = '';
                updateAnalytics();
                statusMsg = 'Lista de nomes limpa.';
            } else {
                statusMsg = 'Não foi possível limpar nomes.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'sortear':
            processingMsg = 'Realizando sorteio de grupos...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 600));
            drawNames();
            statusMsg = 'Sorteio de grupos realizado conforme as configurações atuais.';
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'sortear_lider':
            processingMsg = 'Sorteando líder do grupo...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            const btn = document.querySelector('.btn-sortear-lider:not(:disabled)');
            if (btn) {
                btn.click();
                statusMsg = 'Líder sorteado para o grupo.';
            } else {
                statusMsg = 'Nenhum grupo disponível para sortear líder.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'restaurar_sorteio':
            processingMsg = 'Restaurando último sorteio...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            const history = getHistory();
            if (history.length > 0) {
                restoreFromHistory(history[0].id);
                statusMsg = 'Último sorteio restaurado.';
            } else {
                statusMsg = 'Nenhum sorteio encontrado no histórico.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'preencher_topicos':
            processingMsg = 'Preenchendo tópicos...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            if (acaoOuTexto.parametros && acaoOuTexto.parametros.topicos) {
                if (topicsInput) {
                    if (topicsInput.value.trim() !== acaoOuTexto.parametros.topicos.trim()) {
                        topicsInput.value = acaoOuTexto.parametros.topicos;
                    } else {
                        topicsInput.value += (topicsInput.value ? '\n' : '') + acaoOuTexto.parametros.topicos;
                    }
                    updateAnalytics();
                    statusMsg = 'Tópicos preenchidos/adicionados.';
                } else {
                    statusMsg = 'Não foi possível preencher tópicos.';
                }
            } else {
                statusMsg = 'Não foi possível preencher tópicos.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'forcar_distribuicao':
            processingMsg = 'Alterando opção de forçar distribuição de pessoas restantes...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 400));
            if (typeof acaoOuTexto.parametros?.valor !== 'undefined') {
                forceDistributionSwitch.checked = !!acaoOuTexto.parametros.valor;
                updateAnalytics();
                statusMsg = acaoOuTexto.parametros.valor ? 'Forçar distribuição ativado.' : 'Forçar distribuição desativado.';
            } else {
                statusMsg = 'Não foi possível alterar a opção de forçar distribuição.';
            }
            addChatbotMessage(statusMsg, 'bot', false, 'status');
            return statusMsg;
        case 'reload':
            processingMsg = 'Recarregando a página...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 600));
            location.reload();
            return 'Página recarregada.';
        case 'voltar_home':
            processingMsg = 'Voltando para a tela inicial...';
            addChatbotMessage(processingMsg, 'bot', false, 'processing');
            await new Promise(r => setTimeout(r, 600));
            window.location.href = window.location.pathname;
            return 'Tela inicial carregada.';
        default:
            return typeof acaoOuTexto === 'string' ? acaoOuTexto : 'Ação não reconhecida.';
    }
}

// Envio de mensagem: Enter+Ctrl (ou Cmd) envia, Enter sozinho quebra linha
chatbotInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            chatbotForm.dispatchEvent(new Event('submit', {cancelable: true}));
        }
        // Senão, permite quebra de linha normal
    }
});

chatbotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMsg = chatbotInput.value.trim();
    if (!userMsg) return;
    addChatbotMessage(userMsg, 'user');
    chatbotInput.value = '';
    // Adiciona loading
    const bubble = addChatbotMessage('', 'bot', true);
    const loadingInterval = animateLoadingDots(bubble);
    // Processa prompt
    const resposta = await handleChatbotPrompt(userMsg);
    clearInterval(loadingInterval);
    bubble.innerHTML = resposta;
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
});

// Mensagem de boas-vindas só se o chat estiver vazio
function chatbotWelcome() {
    if (!chatbotMessages.innerHTML.trim()) {
        addChatbotMessage('Olá, sou um modelo de IA inteligente que posso interpretar textos e configurar para você do jeito que pedir!\n\nExemplo: "Sorteie para mim 6 grupos com 3 pessoas em cada grupo, os nomes são: Ana, João, Pedro, Maria, Joana, Paulo, Ana, João, Pedro, Maria, Joana, Paulo"');
    }
}
chatbotFab.addEventListener('click', chatbotWelcome); 

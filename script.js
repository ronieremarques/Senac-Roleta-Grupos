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

let currentNamesPerGroup = 2;

// Efeito de cursor personalizado
const cursor = document.createElement('div');
cursor.className = 'cursor-effect';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.classList.add('active'));
document.addEventListener('mouseup', () => cursor.classList.remove('active'));

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
    }
});

increaseNamesPerGroupBtn.addEventListener('click', () => {
    currentNamesPerGroup++;
    namesPerGroupValue.textContent = currentNamesPerGroup;
});

// Função de Sorteio
function drawNames() {
    const names = getAllNames();
    const topics = getAllTopics();
    const namesPerGroup = currentNamesPerGroup;

    if (names.length === 0) {
        showModal('Por favor, adicione pelo menos um nome para realizar o sorteio.');
        return;
    }

    showLoading();

    // Oculta a seção de configuração antes de sortear
    configSection.classList.add('hidden');

    // Simulação de animação de sorteio
    setTimeout(() => {
        const groups = [];
        const shuffledNames = [...names].sort(() => Math.random() - 0.5);
        const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);

        if (shuffledTopics.length > 0) {
            // Distribuição dos nomes em grupos baseados nos tópicos, respeitando namesPerGroup
            const numTopics = shuffledTopics.length;
            let currentNameIndex = 0;

            for (let i = 0; i < numTopics; i++) {
                const topic = shuffledTopics[i];
                // Pegar exatamente namesPerGroup nomes ou menos se não houver nomes suficientes restantes
                const groupNames = shuffledNames.slice(currentNameIndex, currentNameIndex + namesPerGroup);

                groups.push({ topic: topic, names: groupNames });

                currentNameIndex += groupNames.length; // Avança pelo número de nomes realmente adicionados

                // Se não houver mais nomes, parar de criar grupos COM nomes
                if (currentNameIndex >= shuffledNames.length) {
                    break;
                }
            }

            // Adicionar tópicos restantes sem nomes (se houver)
            for (let i = groups.length; i < numTopics; i++) {
                groups.push({ topic: shuffledTopics[i], names: [] });
            }

        } else {
            // Se não houver tópicos, agrupar apenas por namesPerGroup
            for (let i = 0; i < shuffledNames.length; i += namesPerGroup) {
                const groupNames = shuffledNames.slice(i, i + namesPerGroup);
                groups.push({ topic: '', names: groupNames });
            }
        }

        displayResults(groups);
        hideLoading();
    }, 2000);
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
    tableHTML += '<th>Tópico</th>';
    tableHTML += '<th>Grupo</th>';
    for (let i = 1; i <= maxNames; i++) {
        tableHTML += `<th>Nome ${i}</th>`;
    }
    tableHTML += '</tr></thead><tbody>';

    groups.forEach((group, index) => {
        tableHTML += `<tr class="group-row group-row-${index}">`;
        tableHTML += `<td>${group.topic || '-'}</td>`;
        tableHTML += `<td>Grupo ${index + 1}</td>`;

        for (let i = 0; i < maxNames; i++) {
            tableHTML += `<td>${group.names[i] || '-'}</td>`;
        }

        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';

    resultsContainer.innerHTML = tableHTML;

    resultsSection.classList.remove('hidden');

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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        creditsScreen.classList.add('hidden');
    }, 4000);
}); 

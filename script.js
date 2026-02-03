const ADMIN_PASSWORD = 'admin123';

/* ===================== TABS ===================== */
function showTab(tab, event) {
    document.querySelectorAll('.tab-content').forEach(t =>
        t.classList.remove('active')
    );
    document.querySelectorAll('.tab-btn').forEach(b =>
        b.classList.remove('active')
    );

    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
}

/* ===================== STORAGE ===================== */
function carregarInscritos() {
    return JSON.parse(localStorage.getItem('inscritosOffsite')) || [];
}

function salvarInscritos(lista) {
    localStorage.setItem('inscritosOffsite', JSON.stringify(lista));
    atualizarDashboard();
}

/* ===================== FORM (INSCRIÇÃO → PENDENTE) ===================== */
document.getElementById('inscricaoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();

    // validação simples
    if (!nome || !telefone || !endereco || !email.includes('@') || !email.includes('.')) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    // cria inscrição pendente
    const novoInscrito = {
        id: Date.now(),
        nome,
        email,
        telefone,
        endereco,
        status: 'Pendente'
    };

    // salva no "banco"
    const inscritos = carregarInscritos();
    inscritos.push(novoInscrito);
    salvarInscritos(inscritos);

    // trava botão para evitar duplicidade
    const btnSubmit = this.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Aguardando pagamento...';

    // mostra PIX
    document.getElementById('pixInfo').style.display = 'block';

    // monta WhatsApp
    const mensagem = `
Olá! 👋

Segue o comprovante do pagamento via PIX
referente ao *Curso de Comunicação e Oratória – II Turma*.

💰 Valor pago: R$ 0,10

📌 Nome: ${nome}
📧 E-mail: ${email}
📞 Telefone: ${telefone}

Obrigado!
`.trim();

    const whatsappUrl =
        `https://wa.me/559391719306?text=${encodeURIComponent(mensagem)}`;

    document.getElementById('btnWhatsapp').href = whatsappUrl;
});

/* ===================== ADMIN ===================== */
function checkAdminPassword() {
    if (adminPassword.value === ADMIN_PASSWORD) {
        adminPanel.style.display = 'block';
        atualizarDashboard();
    } else {
        alert('Senha incorreta');
    }
}

function atualizarDashboard() {
    const inscritos = carregarInscritos();
    totalInscritos.textContent = inscritos.length;

    if (inscritos.length === 0) {
        listaInscritos.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#999;">
                    Nenhuma inscrição registrada ainda
                </td>
            </tr>`;
        return;
    }

    listaInscritos.innerHTML = inscritos.map(i => `
        <tr>
            <td>${i.nome}</td>
            <td>${i.email}</td>
            <td>${i.telefone}</td>
            <td>
                <span class="status-badge ${i.status === 'Pago' ? 'status-pago' : 'status-pendente'}">
                    ${i.status}
                </span>
            </td>
            <td style="display:flex;gap:6px;">
                <button class="admin-btn admin-btn-toggle"
    onclick="toggleStatus(${i.id})">
    ${i.status === 'Pago' ? '↩️ Pendente' : '✅ Pago'}
</button>

<button class="admin-btn admin-btn-delete"
    onclick="excluirInscrito(${i.id})">
    🗑️ Excluir
</button>

            </td>
        </tr>
    `).join('');
}

/* ===================== AÇÕES ADMIN ===================== */
function toggleStatus(id) {
    const inscritos = carregarInscritos();
    const inscrito = inscritos.find(i => i.id === id);
    if (!inscrito) return;

    inscrito.status = inscrito.status === 'Pendente' ? 'Pago' : 'Pendente';
    salvarInscritos(inscritos);
}

function excluirInscrito(id) {
    if (!confirm('Deseja realmente excluir esta inscrição?')) return;

    const inscritos = carregarInscritos().filter(i => i.id !== id);
    salvarInscritos(inscritos);
}

/* ===================== PIX ===================== */
document.getElementById('copyPixBtn').addEventListener('click', () => {
    const texto = `PIX: melkg7@hotmail.com | Valor: R$ 0,10`;

    navigator.clipboard.writeText(texto).then(() => {
        const feedback = document.getElementById('copyFeedback');
        feedback.style.display = 'block';

        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#habilidades-chips");
  const buscaHabilidades = document.querySelector("#busca-habilidades");

  if (!container) {
    return;
  }

  fetch("../Model/habilidades.json")
    .then((resposta) => {
      if (!resposta.ok) throw new Error("Falha ao carregar habilidades");
      return resposta.json();
    })
    .then((categorias) => {
      container.innerHTML = "";

      categorias.forEach((categoria) => {
        const grupo = document.createElement("div");
        grupo.className = "habilidades-categoria";

        const titulo = document.createElement("h4");
        titulo.className = "habilidades-categoria-titulo";
        titulo.textContent = categoria.categoria;

        const chipsWrap = document.createElement("div");
        chipsWrap.className = "habilidades-categoria-chips";

        categoria.habilidades.forEach((habilidade) => {
          const label = document.createElement("label");
          label.className = "chip";
          label.dataset.texto = habilidade.toLowerCase();

          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = habilidade;

          label.appendChild(input);
          label.appendChild(document.createTextNode(habilidade));
          chipsWrap.appendChild(label);
        });

        grupo.appendChild(titulo);
        grupo.appendChild(chipsWrap);
        container.appendChild(grupo);
      });

      const semResultado = document.createElement("p");
      semResultado.className = "habilidades-sem-resultado";
      semResultado.hidden = true;
      semResultado.textContent = "Nenhuma habilidade encontrada.";
      container.appendChild(semResultado);

      if (buscaHabilidades) {
        buscaHabilidades.addEventListener("input", () => {
          const termo = buscaHabilidades.value.trim().toLowerCase();
          let algumVisivel = false;

          container.querySelectorAll(".habilidades-categoria").forEach((grupo) => {
            let grupoTemVisivel = false;
            grupo.querySelectorAll(".chip").forEach((chip) => {
              const visivel = !termo || chip.dataset.texto.includes(termo);
              chip.hidden = !visivel;
              if (visivel) grupoTemVisivel = true;
            });
            grupo.hidden = !grupoTemVisivel;
            if (grupoTemVisivel) algumVisivel = true;
          });

          semResultado.hidden = algumVisivel;
        });
      }
    })
    .catch(() => {
      container.innerHTML =
        '<p class="habilidades-carregando">Não foi possível carregar a lista de habilidades. Use o campo "Outras habilidades" abaixo.</p>';
    });
});

function mascararCNPJ(digitos) {
  let resultado = digitos;
  if (digitos.length > 2) resultado = `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
  if (digitos.length > 5)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  if (digitos.length > 8)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
  if (digitos.length > 12)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
  return resultado;
}

function mascararCPF(digitos) {
  let resultado = digitos;
  if (digitos.length > 3) resultado = `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length > 6)
    resultado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  if (digitos.length > 9)
    resultado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  return resultado;
}

document.addEventListener("DOMContentLoaded", () => {
  const abas = document.querySelectorAll(".login-tab");
  const formularios = document.querySelectorAll(".form-contratante");

  if (!abas.length) {
    return;
  }

  abas.forEach((aba) => {
    aba.addEventListener("click", () => {
      abas.forEach((item) => item.classList.toggle("active", item === aba));
      formularios.forEach((form) => {
        form.hidden = form.id !== aba.dataset.formAlvo;
      });
    });
  });

  const camposTipoDocumento = document.querySelectorAll('input[name="tipo-documento"]');
  const campoDocumento = document.querySelector("#cadastro-documento");
  const feedbackDocumento = document.querySelector("#cadastro-documento-feedback");

  function tipoDocumentoSelecionado() {
    const marcado = document.querySelector('input[name="tipo-documento"]:checked');
    return marcado ? marcado.value : "cnpj";
  }

  function validarDocumentoAtual() {
    if (!campoDocumento) return true;

    const digitos = campoDocumento.value.replace(/\D/g, "");
    const tipo = tipoDocumentoSelecionado();
    const tamanhoCompleto = tipo === "cnpj" ? 14 : 11;

    campoDocumento.classList.remove("campo-valido", "campo-invalido");
    if (feedbackDocumento) feedbackDocumento.textContent = "";
    if (feedbackDocumento) feedbackDocumento.classList.remove("valido", "invalido");

    if (digitos.length === 0) {
      return false;
    }

    if (digitos.length < tamanhoCompleto) {
      return false;
    }

    const valido =
      tipo === "cnpj"
        ? window.ValidacaoModel.validarCNPJ(digitos)
        : window.ValidacaoModel.validarCPF(digitos);

    campoDocumento.classList.add(valido ? "campo-valido" : "campo-invalido");
    if (feedbackDocumento) {
      feedbackDocumento.textContent = valido
        ? `${tipo.toUpperCase()} válido`
        : `${tipo.toUpperCase()} inválido`;
      feedbackDocumento.classList.add(valido ? "valido" : "invalido");
    }

    return valido;
  }

  if (campoDocumento) {
    camposTipoDocumento.forEach((radio) => {
      radio.addEventListener("change", () => {
        const tipo = tipoDocumentoSelecionado();
        campoDocumento.value = "";
        campoDocumento.placeholder =
          tipo === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00";
        campoDocumento.maxLength = tipo === "cnpj" ? 18 : 14;
        campoDocumento.classList.remove("campo-valido", "campo-invalido");
        if (feedbackDocumento) {
          feedbackDocumento.textContent = "";
          feedbackDocumento.classList.remove("valido", "invalido");
        }
      });
    });

    campoDocumento.addEventListener("input", () => {
      const tipo = tipoDocumentoSelecionado();
      const digitos = campoDocumento.value
        .replace(/\D/g, "")
        .slice(0, tipo === "cnpj" ? 14 : 11);
      campoDocumento.value = tipo === "cnpj" ? mascararCNPJ(digitos) : mascararCPF(digitos);
      validarDocumentoAtual();
    });
  }

  function mostrarFeedbackFormulario(id, mensagem, tipo) {
    const elemento = document.querySelector(`#${id}`);
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.remove("valido", "invalido");
    if (tipo) elemento.classList.add(tipo);
  }

  function supabaseConfigurado() {
    if (!window.supabaseClient) {
      mostrarFeedbackFormulario(
        "cadastro-feedback",
        "Supabase ainda não configurado (veja Model/supabase-config.js).",
        "invalido"
      );
      mostrarFeedbackFormulario(
        "entrar-feedback",
        "Supabase ainda não configurado (veja Model/supabase-config.js).",
        "invalido"
      );
      return false;
    }
    return true;
  }

  const formEntrar = document.querySelector("#form-entrar");
  if (formEntrar) {
    formEntrar.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      mostrarFeedbackFormulario("entrar-feedback", "", null);

      if (!supabaseConfigurado()) return;

      const email = document.querySelector("#entrar-email").value;
      const senha = document.querySelector("#entrar-senha").value;

      const { error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        mostrarFeedbackFormulario("entrar-feedback", error.message, "invalido");
        return;
      }

      window.location.href = "contratante.html";
    });
  }

  const formCadastro = document.querySelector("#form-cadastro");
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      mostrarFeedbackFormulario("cadastro-feedback", "", null);

      if (campoDocumento && !validarDocumentoAtual()) {
        campoDocumento.focus();
        return;
      }

      const senha = document.querySelector("#cadastro-senha").value;
      const confirmar = document.querySelector("#cadastro-confirmar").value;
      if (senha !== confirmar) {
        mostrarFeedbackFormulario("cadastro-feedback", "As senhas não coincidem.", "invalido");
        return;
      }

      if (!supabaseConfigurado()) return;

      const botaoCriar = document.querySelector("#btn-criar-conta");
      if (botaoCriar) botaoCriar.disabled = true;

      const nome = document.querySelector("#cadastro-empresa").value;
      const email = document.querySelector("#cadastro-email").value;
      const tipo = tipoDocumentoSelecionado();
      const documento = campoDocumento.value.replace(/\D/g, "");

      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, tipo_documento: tipo, documento },
        },
      });

      if (botaoCriar) botaoCriar.disabled = false;

      if (error) {
        mostrarFeedbackFormulario("cadastro-feedback", error.message, "invalido");
        return;
      }

      if (!data.session) {
        mostrarFeedbackFormulario(
          "cadastro-feedback",
          "Conta criada! Verifique seu e-mail para confirmar antes de entrar.",
          "valido"
        );
        return;
      }

      window.location.href = "contratante.html";
    });
  }
});

function renderizarVagaContratante(vaga) {
  const artigo = document.createElement("article");
  artigo.className = "vaga-contratante-card";
  artigo.dataset.vagaId = vaga.id;

  const statusClasse =
    { Ativa: "status-ativa", Pausada: "status-pausada", Encerrada: "status-encerrada" }[
      vaga.status
    ] || "status-ativa";
  const acaoStatus = vaga.status === "Pausada" ? "Ativar" : "Pausar";
  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  artigo.innerHTML = `
    <div class="vaga-contratante-info">
      <div class="vaga-contratante-topo">
        <h3></h3>
        <span class="status-badge ${statusClasse}">${vaga.status}</span>
      </div>
      <p class="vaga-local"></p>
      <div class="vaga-contratante-meta">
        <span class="vaga-salario">R$ ${salarioFormatado}</span>
      </div>
    </div>
    <div class="vaga-contratante-acoes">
      <button type="button" class="btn-acao" data-acao="pausar">${acaoStatus}</button>
      <button type="button" class="btn-acao btn-acao-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  artigo.querySelector("h3").textContent = vaga.cargo;
  artigo.querySelector(".vaga-local").textContent = `${vaga.cidade} · ${vaga.modalidade}`;

  return artigo;
}

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.querySelector("#vagas-contratante-list");
  if (!listContainer) {
    return;
  }

  const saudacao = document.querySelector("#dashboard-saudacao");
  const buscaInput = document.querySelector(".dashboard-toolbar .busca-input");
  const filtroStatus = document.querySelector("#filtro-status");
  const btnSair = document.querySelector("#btn-sair");

  if (!window.supabaseClient) {
    listContainer.innerHTML =
      '<p class="habilidades-carregando">Supabase ainda não configurado (veja Model/supabase-config.js).</p>';
    if (saudacao) saudacao.textContent = "Configuração pendente";
    return;
  }

  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "contratante-login.html";
    return;
  }

  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await window.supabaseClient.auth.signOut();
      window.location.href = "contratante-login.html";
    });
  }

  const { data: empresa } = await window.supabaseClient
    .from("empresas")
    .select("nome")
    .eq("id", session.user.id)
    .single();

  if (saudacao) saudacao.textContent = empresa ? empresa.nome : session.user.email;

  const { data: vagas, error } = await window.supabaseClient
    .from("vagas")
    .select("*")
    .eq("empresa_id", session.user.id)
    .order("criado_em", { ascending: false });

  if (error) {
    listContainer.innerHTML = `<p class="habilidades-carregando">Erro ao carregar vagas: ${error.message}</p>`;
    return;
  }

  function renderizarLista() {
    const termo = buscaInput ? buscaInput.value.trim().toLowerCase() : "";
    const status = filtroStatus ? filtroStatus.value : "";

    const filtradas = vagas.filter((vaga) => {
      const combinaTexto = !termo || vaga.cargo.toLowerCase().includes(termo);
      const combinaStatus = !status || vaga.status === status;
      return combinaTexto && combinaStatus;
    });

    listContainer.innerHTML = "";

    if (filtradas.length === 0) {
      listContainer.innerHTML = '<p class="habilidades-carregando">Nenhuma vaga encontrada.</p>';
      return;
    }

    filtradas.forEach((vaga) => listContainer.appendChild(renderizarVagaContratante(vaga)));
  }

  renderizarLista();

  if (buscaInput) buscaInput.addEventListener("input", renderizarLista);
  if (filtroStatus) filtroStatus.addEventListener("change", renderizarLista);

  listContainer.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const card = botao.closest(".vaga-contratante-card");
    const vagaId = card.dataset.vagaId;
    const vaga = vagas.find((item) => item.id === vagaId);
    if (!vaga) return;

    if (botao.dataset.acao === "pausar") {
      const novoStatus = vaga.status === "Pausada" ? "Ativa" : "Pausada";
      const { error: erroUpdate } = await window.supabaseClient
        .from("vagas")
        .update({ status: novoStatus })
        .eq("id", vagaId);

      if (erroUpdate) {
        alert(`Erro ao atualizar a vaga: ${erroUpdate.message}`);
        return;
      }

      vaga.status = novoStatus;
      renderizarLista();
    }

    if (botao.dataset.acao === "excluir") {
      if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

      const { error: erroDelete } = await window.supabaseClient
        .from("vagas")
        .delete()
        .eq("id", vagaId);

      if (erroDelete) {
        alert(`Erro ao excluir a vaga: ${erroDelete.message}`);
        return;
      }

      const indice = vagas.findIndex((item) => item.id === vagaId);
      if (indice !== -1) vagas.splice(indice, 1);
      renderizarLista();
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("#form-nova-vaga");
  if (!form) {
    return;
  }

  const feedback = document.querySelector("#nova-vaga-feedback");

  function mostrarFeedbackVaga(mensagem, tipo) {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.classList.remove("valido", "invalido");
    if (tipo) feedback.classList.add(tipo);
  }

  if (!window.supabaseClient) {
    mostrarFeedbackVaga("Supabase ainda não configurado (veja Model/supabase-config.js).", "invalido");
    return;
  }

  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "contratante-login.html";
    return;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarFeedbackVaga("", null);

    const habilidadesSelecionadas = [
      ...document.querySelectorAll("#habilidades-chips input:checked"),
    ].map((input) => input.value);

    const outrasHabilidades = document
      .querySelector("#vaga-habilidades-outras")
      .value.split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    const novaVaga = {
      empresa_id: session.user.id,
      cargo: document.querySelector("#vaga-cargo").value,
      cidade: document.querySelector("#vaga-cidade").value,
      modalidade: document.querySelector("#vaga-modalidade").value,
      nivel: document.querySelector("#vaga-nivel").value,
      contratacao: document.querySelector("#vaga-contratacao").value,
      salario: Number(document.querySelector("#vaga-salario").value),
      descricao: document.querySelector("#vaga-descricao").value,
      beneficios: document.querySelector("#vaga-beneficios").value,
      habilidades: [...habilidadesSelecionadas, ...outrasHabilidades],
      telefone: document.querySelector("#vaga-tel").value,
      email: document.querySelector("#vaga-email").value,
      link_externo: document.querySelector("#vaga-link").value,
    };

    const botaoPublicar = document.querySelector("#btn-publicar-vaga");
    if (botaoPublicar) botaoPublicar.disabled = true;

    const { error } = await window.supabaseClient.from("vagas").insert(novaVaga);

    if (botaoPublicar) botaoPublicar.disabled = false;

    if (error) {
      mostrarFeedbackVaga(`Erro ao publicar a vaga: ${error.message}`, "invalido");
      return;
    }

    window.location.href = "contratante.html";
  });
});

function atualizarBotaoSalvar(botao, salva) {
  botao.classList.toggle("salvo", salva);
  botao.setAttribute("aria-pressed", String(salva));
  botao.textContent = salva ? botao.dataset.textoSalvo : botao.dataset.textoSalvar;
}

function configurarBotaoSalvar(botao) {
  if (!botao.dataset.textoSalvar) {
    botao.dataset.textoSalvar = botao.textContent;
    botao.dataset.textoSalvo = botao.textContent.replace("☆", "★");
  }

  atualizarBotaoSalvar(botao, window.VagasModel.isVagaSalva(botao.dataset.salvarVaga));

  if (botao.dataset.wired) return;
  botao.dataset.wired = "true";

  botao.addEventListener("click", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    const vagaId = botao.dataset.salvarVaga;
    window.VagasModel.toggleVagaSalva(vagaId);

    document
      .querySelectorAll(`[data-salvar-vaga="${vagaId}"]`)
      .forEach((item) => atualizarBotaoSalvar(item, window.VagasModel.isVagaSalva(vagaId)));

    if (window.aplicarFiltrosVagas) {
      window.aplicarFiltrosVagas();
    }
  });
}

function configurarBotoesSalvar(raiz) {
  (raiz || document).querySelectorAll("[data-salvar-vaga]").forEach(configurarBotaoSalvar);
}

function formatarDataRelativa(dataIso) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataIso + "T00:00:00");
  const diffDias = Math.round((hoje - data) / 86400000);

  if (diffDias <= 0) return "Publicada hoje";
  if (diffDias === 1) return "Publicada ontem";
  if (diffDias < 30) return `Publicada há ${diffDias} dias`;
  const diffMeses = Math.floor(diffDias / 30);
  return `Publicada há ${diffMeses} ${diffMeses === 1 ? "mês" : "meses"}`;
}

function configurarFiltrosEOrdenacao() {
  const buscaInput = document.querySelector(".busca-input");
  const filtroCidade = document.querySelector("#filtro-cidade");
  const filtroModalidade = document.querySelector("#filtro-modalidade");
  const filtroNivel = document.querySelector("#filtro-nivel");
  const filtroContratacao = document.querySelector("#filtro-contratacao");
  const filtroSalario = document.querySelector("#filtro-salario");
  const filtroSalvas = document.querySelector("#filtro-salvas");
  const filtroOrdenar = document.querySelector("#filtro-ordenar");
  const btnLimpar = document.querySelector(".btn-limpar-filtros");
  const btnFiltrosToggle = document.querySelector(".btn-filtros-toggle");
  const painelFiltros = document.querySelector("#painel-filtros");
  const vagasList = document.querySelector(".vagas-list");
  const cards = document.querySelectorAll(".vaga-card");
  const semResultado = document.querySelector(".vagas-sem-resultado");

  if (!buscaInput || !vagasList || !filtroCidade) {
    return;
  }

  if (btnFiltrosToggle && painelFiltros && !btnFiltrosToggle.dataset.wired) {
    btnFiltrosToggle.dataset.wired = "true";
    btnFiltrosToggle.addEventListener("click", () => {
      const aberto = btnFiltrosToggle.getAttribute("aria-expanded") === "true";
      btnFiltrosToggle.setAttribute("aria-expanded", String(!aberto));
      painelFiltros.hidden = aberto;
    });
  }

  function ordenarPorData() {
    const ordem = filtroOrdenar ? filtroOrdenar.value : "recentes";
    const cardsOrdenados = [...cards].sort((a, b) => {
      const dataA = new Date(a.dataset.data || 0);
      const dataB = new Date(b.dataset.data || 0);
      return ordem === "antigas" ? dataA - dataB : dataB - dataA;
    });

    cardsOrdenados.forEach((card) => vagasList.insertBefore(card, semResultado));
  }

  function aplicarFiltros() {
    const termo = buscaInput.value.trim().toLowerCase();
    const cidade = filtroCidade.value;
    const modalidade = filtroModalidade.value;
    const nivel = filtroNivel.value;
    const contratacao = filtroContratacao.value;
    const [salarioMin, salarioMax] = filtroSalario.value
      ? filtroSalario.value.split("-").map(Number)
      : [null, null];
    let visiveis = 0;

    cards.forEach((card) => {
      const titulo = card.querySelector("h3").textContent.toLowerCase();
      const empresa = card.querySelector(".vaga-empresa").textContent.toLowerCase();
      const salarioCard = Number(card.dataset.salario || 0);

      const combinaTexto = !termo || titulo.includes(termo) || empresa.includes(termo);
      const combinaCidade = !cidade || card.dataset.cidade === cidade;
      const combinaModalidade = !modalidade || card.dataset.modalidade === modalidade;
      const combinaNivel = !nivel || card.dataset.nivel === nivel;
      const combinaContratacao = !contratacao || card.dataset.contratacao === contratacao;
      const combinaSalario =
        salarioMin === null || (salarioCard >= salarioMin && salarioCard <= salarioMax);
      const combinaSalva =
        !filtroSalvas ||
        !filtroSalvas.checked ||
        (window.VagasModel && window.VagasModel.isVagaSalva(card.dataset.vagaId));

      const visivel =
        combinaTexto &&
        combinaCidade &&
        combinaModalidade &&
        combinaNivel &&
        combinaContratacao &&
        combinaSalario &&
        combinaSalva;

      card.hidden = !visivel;
      if (visivel) visiveis += 1;
    });

    if (semResultado) {
      semResultado.hidden = visiveis > 0;
    }
  }

  [buscaInput, filtroCidade, filtroModalidade, filtroNivel, filtroContratacao, filtroSalario].forEach(
    (campo) => {
      const evento = campo === buscaInput ? "input" : "change";
      campo.addEventListener(evento, aplicarFiltros);
    }
  );

  if (filtroSalvas) {
    filtroSalvas.addEventListener("change", aplicarFiltros);
  }

  if (filtroOrdenar) {
    filtroOrdenar.addEventListener("change", ordenarPorData);
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      buscaInput.value = "";
      [filtroCidade, filtroModalidade, filtroNivel, filtroContratacao, filtroSalario].forEach(
        (select) => {
          select.value = "";
        }
      );
      if (filtroSalvas) filtroSalvas.checked = false;
      if (filtroOrdenar) filtroOrdenar.value = "recentes";
      aplicarFiltros();
      ordenarPorData();
    });
  }

  window.aplicarFiltrosVagas = aplicarFiltros;

  ordenarPorData();
}

function renderizarVagaCard(vaga) {
  const card = document.createElement("div");
  card.className = "vaga-card";
  card.dataset.cidade = vaga.cidade;
  card.dataset.modalidade = vaga.modalidade;
  card.dataset.nivel = vaga.nivel;
  card.dataset.contratacao = vaga.contratacao;
  card.dataset.salario = vaga.salario;
  card.dataset.data = vaga.data_publicacao;
  card.dataset.vagaId = vaga.id;

  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  card.innerHTML = `
    <button class="btn-salvar" data-salvar-vaga="${vaga.id}" aria-label="Salvar vaga">☆</button>
    <h3></h3>
    <div class="vaga-card-footer">
      <div class="vaga-info">
        <p class="vaga-local"></p>
        <p class="vaga-empresa"></p>
        <p class="vaga-data">${formatarDataRelativa(vaga.data_publicacao)}</p>
      </div>
      <span class="vaga-salario">R$ ${salarioFormatado}</span>
    </div>
  `;

  card.querySelector("h3").textContent = vaga.cargo;
  card.querySelector(".vaga-local").textContent = vaga.cidade;
  card.querySelector(".vaga-empresa").textContent = vaga.empresa_nome || "Empresa";

  return card;
}

function mostrarDetalheVaga(vaga) {
  document.querySelector("#detalhe-cargo").textContent = vaga.cargo;
  document.querySelector("#detalhe-local").textContent = vaga.cidade;
  document.querySelector("#detalhe-empresa").textContent = vaga.empresa_nome || "Empresa";

  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  document.querySelector("#detalhe-salario").textContent = `R$ ${salarioFormatado}`;

  const descricaoEl = document.querySelector("#detalhe-descricao");
  descricaoEl.innerHTML = "";
  (vaga.descricao || "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .forEach((paragrafo) => {
      const p = document.createElement("p");
      p.textContent = paragrafo;
      descricaoEl.appendChild(p);
    });

  const botaoSalvarDetalhe = document.querySelector("#detalhe-btn-salvar");
  if (botaoSalvarDetalhe) {
    botaoSalvarDetalhe.hidden = false;
    botaoSalvarDetalhe.dataset.salvarVaga = vaga.id;
  }

  document.querySelector("#dados-preco").textContent = `R$ ${salarioFormatado}`;
  document.querySelector("#dados-local-modalidade").textContent = `${vaga.cidade} ${vaga.modalidade}`;
  document.querySelector("#dados-beneficios").textContent = vaga.beneficios || "Não informado";

  const listaHabilidades = document.querySelector("#dados-habilidades");
  listaHabilidades.innerHTML = "";
  (vaga.habilidades || []).forEach((habilidade) => {
    const li = document.createElement("li");
    li.textContent = habilidade;
    listaHabilidades.appendChild(li);
  });

  const contatoTel = document.querySelector("#contato-tel");
  contatoTel.hidden = !vaga.telefone;
  if (vaga.telefone) contatoTel.textContent = `Tel: ${vaga.telefone}`;

  document.querySelector("#contato-email").textContent = `Email: ${vaga.email}`;

  const contatoLink = document.querySelector("#contato-link");
  contatoLink.hidden = !vaga.link_externo;
  if (vaga.link_externo) contatoLink.textContent = `Link Externo: ${vaga.link_externo}`;

  configurarBotoesSalvar();
}

document.addEventListener("DOMContentLoaded", async () => {
  const listaContainer = document.querySelector("#vagas-lista");
  if (!listaContainer) {
    return;
  }

  if (!window.supabaseClient) {
    listaContainer.innerHTML =
      '<p class="habilidades-carregando">Supabase ainda não configurado (veja Model/supabase-config.js).</p>';
    return;
  }

  const { data: vagas, error } = await window.supabaseClient
    .from("vagas")
    .select("*")
    .eq("status", "Ativa")
    .order("criado_em", { ascending: false });

  if (error) {
    listaContainer.innerHTML = `<p class="habilidades-carregando">Erro ao carregar vagas: ${error.message}</p>`;
    return;
  }

  if (!vagas || vagas.length === 0) {
    listaContainer.innerHTML = '<p class="habilidades-carregando">Nenhuma vaga publicada no momento.</p>';
    return;
  }

  const idsEmpresas = [...new Set(vagas.map((vaga) => vaga.empresa_id))];
  const { data: empresas } = await window.supabaseClient
    .from("empresas_publicas")
    .select("id, nome")
    .in("id", idsEmpresas);

  const nomePorEmpresa = Object.fromEntries((empresas || []).map((empresa) => [empresa.id, empresa.nome]));
  vagas.forEach((vaga) => {
    vaga.empresa_nome = nomePorEmpresa[vaga.empresa_id] || "Empresa";
  });

  listaContainer.innerHTML = "";
  vagas.forEach((vaga) => {
    listaContainer.appendChild(renderizarVagaCard(vaga));
  });

  const semResultado = document.createElement("p");
  semResultado.className = "vagas-sem-resultado";
  semResultado.hidden = true;
  semResultado.textContent = "Nenhuma vaga encontrada.";
  listaContainer.appendChild(semResultado);

  function selecionarVaga(vaga, card) {
    document.querySelectorAll(".vaga-card.active").forEach((item) => item.classList.remove("active"));
    if (card) card.classList.add("active");
    mostrarDetalheVaga(vaga);
  }

  listaContainer.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-salvar-vaga]")) return;
    const card = evento.target.closest(".vaga-card");
    if (!card) return;
    const vaga = vagas.find((item) => item.id === card.dataset.vagaId);
    if (vaga) selecionarVaga(vaga, card);
  });

  const filtroCidade = document.querySelector("#filtro-cidade");
  if (filtroCidade) {
    const cidades = [...new Set(vagas.map((vaga) => vaga.cidade))].sort();
    cidades.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade;
      option.textContent = cidade;
      filtroCidade.appendChild(option);
    });
  }

  selecionarVaga(vagas[0], listaContainer.querySelector(".vaga-card"));
  configurarFiltrosEOrdenacao();
});

document.addEventListener("DOMContentLoaded", () => {
  const botaoTema = document.querySelector("#tema-toggle");
  if (!botaoTema) {
    return;
  }

  function temaAtual() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function atualizarBotaoTema() {
    const ativo = temaAtual();
    botaoTema.textContent = ativo === "dark" ? "☀️" : "🌙";
    botaoTema.setAttribute(
      "aria-label",
      ativo === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"
    );
  }

  atualizarBotaoTema();

  botaoTema.addEventListener("click", () => {
    const novoTema = temaAtual() === "dark" ? "light" : "dark";

    if (novoTema === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    localStorage.setItem("tema", novoTema);
    atualizarBotaoTema();
  });
});

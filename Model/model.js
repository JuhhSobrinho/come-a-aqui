const CHAVE_VAGAS_SALVAS = "comecaAqui.candidato.vagasSalvas";

function getVagasSalvas() {
  try {
    const dados = localStorage.getItem(CHAVE_VAGAS_SALVAS);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    return [];
  }
}

function isVagaSalva(vagaId) {
  return getVagasSalvas().includes(vagaId);
}

function salvarVaga(vagaId) {
  const salvas = getVagasSalvas();
  if (!salvas.includes(vagaId)) {
    salvas.push(vagaId);
    localStorage.setItem(CHAVE_VAGAS_SALVAS, JSON.stringify(salvas));
  }
}

function removerVagaSalva(vagaId) {
  const salvas = getVagasSalvas().filter((id) => id !== vagaId);
  localStorage.setItem(CHAVE_VAGAS_SALVAS, JSON.stringify(salvas));
}

function toggleVagaSalva(vagaId) {
  if (isVagaSalva(vagaId)) {
    removerVagaSalva(vagaId);
    return false;
  }
  salvarVaga(vagaId);
  return true;
}

window.VagasModel = {
  getVagasSalvas,
  isVagaSalva,
  salvarVaga,
  removerVagaSalva,
  toggleVagaSalva,
};

function calcularDigitoCPF(base, pesoInicial) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

function validarCPF(valor) {
  const digitos = String(valor).replace(/\D/g, "");

  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const digito1 = calcularDigitoCPF(digitos.slice(0, 9), 10);
  const digito2 = calcularDigitoCPF(digitos.slice(0, 9) + digito1, 11);

  return digito1 === Number(digitos[9]) && digito2 === Number(digitos[10]);
}

function calcularDigitoCNPJ(base) {
  const pesos =
    base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * pesos[i];
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function validarCNPJ(valor) {
  const digitos = String(valor).replace(/\D/g, "");

  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) {
    return false;
  }

  const digito1 = calcularDigitoCNPJ(digitos.slice(0, 12));
  const digito2 = calcularDigitoCNPJ(digitos.slice(0, 12) + digito1);

  return digito1 === Number(digitos[12]) && digito2 === Number(digitos[13]);
}

window.ValidacaoModel = {
  validarCPF,
  validarCNPJ,
};

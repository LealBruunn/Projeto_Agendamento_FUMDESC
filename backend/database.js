// Database Layer - Supabase
const supabase = require('./utils/supabase/client');

// Tabela no Supabase
const TABLE_NAME = 'agendamentos';

// Garantir que a tabela existe (apenas para log)
async function initializeDatabase() {
  try {
    console.log('✓ Conectado ao Supabase');
  } catch (error) {
    console.error('Erro ao conectar ao Supabase:', error);
    throw error;
  }
}

// Buscar agendamentos de um dia
async function getAgendamentos(dia) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('horario, nome')
      .eq('dia', dia)
      .order('horario', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
}

// Adicionar novo agendamento
async function adicionarAgendamento(dia, horario, nome) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          dia,
          horario,
          nome,
          data_criacao: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('Erro ao adicionar agendamento:', error);
    throw error;
  }
}

// Remover agendamento
async function removerAgendamento(dia, horario, nome) {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('dia', dia)
      .eq('horario', horario)
      .eq('nome', nome);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao remover agendamento:', error);
    throw error;
  }
}

// Limpar todos os agendamentos de um dia
async function limparAgendamentos(dia) {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('dia', dia);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao limpar agendamentos:', error);
    throw error;
  }
}

// Buscar todos os agendamentos (admin)
async function todosAgendamentos() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('dia', { ascending: true })
      .order('horario', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar todos os agendamentos:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  getAgendamentos,
  adicionarAgendamento,
  removerAgendamento,
  limparAgendamentos,
  todosAgendamentos
};

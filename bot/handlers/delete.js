const services = require('../services/buttons');

exports.handleDelete = async (bot, supabase, chatId, id) => {
  const { data, error } = await services.remove(supabase, id);
  if (error) return { error };
  return { data };
};
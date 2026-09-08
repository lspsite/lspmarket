const services = require('../services/buttons');

exports.handleEdit = async (bot, supabase, chatId, id, label, url) => {
  const { data, error } = await services.update(supabase, id, { label, url });
  if (error) return { error };
  return { data };
};
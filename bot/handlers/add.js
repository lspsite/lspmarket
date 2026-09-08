const services = require('../services/buttons');

exports.handleAddCategory = async (bot, supabase, messageId, chatId, category) => {
  return (label, url) => services.create(supabase, { label, url, category });
};

exports.getCategoryKeyboard = () => ({
  inline_keyboard: [
    [{ text: '📦 Магазин', callback_data: 'add:magazine' }],
    [{ text: '🔄 Обменник', callback_data: 'add:exchange' }],
    [{ text: '⬅ Назад', callback_data: 'main_menu' }],
  ],
});
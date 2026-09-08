const services = require('../services/buttons');

exports.buildListKeyboard = (items, category = null) => {
  const title = category
    ? (category === 'magazine' ? '🛒 Магазины' : '💱 Обменники')
    : '📋 Все кнопки';
  const text = items.length
    ? items.map(b => `${b.id.slice(0, 8)}... - ${b.label}\n${b.url}`).join('\n\n')
    : (category
      ? `Здесь пока нет ${category === 'magazine' ? 'магазинов' : 'обменников'}`
      : 'Список пуст');
  const keyboard = {
    inline_keyboard: [
      ...items.map(b => [
        { text: '✏️', callback_data: `edit:${b.id}` },
        { text: '🗑️', callback_data: `delete:${b.id}` },
        { text: b.label.slice(0, 20), callback_data: 'noop' },
      ]),
      [{ text: '⬅ Назад', callback_data: 'main_menu' }],
    ],
  };
  return { title, text, keyboard };
};

exports.getList = async (supabase, category = null) => {
  return services.list(supabase, { category });
};
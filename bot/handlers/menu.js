function getMainMenu() {
  return {
    inline_keyboard: [
      [{ text: '🛒 Магазины', callback_data: 'list:magazine' }],
      [{ text: '💱 Обменники', callback_data: 'list:exchange' }],
      [{ text: '➕ Добавить', callback_data: 'add:choose_category' }],
      [{ text: '📋 Список всех', callback_data: 'list:all' }],
      [{ text: '⚙️ Настройки', callback_data: 'settings' }],
      [{ text: '❓ Помощь', callback_data: 'help' }],
    ],
  };
}

function getSettingsMenu() {
  return {
    inline_keyboard: [
      [{ text: '🔗 Владелец', callback_data: 'setlink:owner' }],
      [{ text: '📢 Канал', callback_data: 'setlink:channel' }],
      [{ text: '💬 Чат', callback_data: 'setlink:chat' }],
      [{ text: '⬅ Назад', callback_data: 'main_menu' }],
    ],
  };
}

function getBackButton() {
  return { inline_keyboard: [[{ text: '⬅ Назад', callback_data: 'main_menu' }]] };
}

module.exports = { getMainMenu, getSettingsMenu, getBackButton };
require('dotenv').config();
const WebSocket = require('ws');
global.WebSocket = WebSocket;
const Bot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const buttons = require('./services/buttons');
const { getMainMenu, getSettingsMenu, getBackButton } = require('./handlers/menu');
const addHandler = require('./handlers/add');
const listHandler = require('./handlers/list');
const editHandler = require('./handlers/edit');
const deleteHandler = require('./handlers/delete');

const bot = new Bot(process.env.BOT_TOKEN, { polling: true });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const userState = new Map();

const STATE_TTL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of userState) {
    if (now - val.ts > STATE_TTL) userState.delete(key);
  }
}, 60000);

function getState(chatId) {
  return userState.get(chatId);
}
function setState(chatId, data) {
  userState.set(chatId, { ...data, ts: Date.now() });
}
function clearState(chatId) {
  userState.delete(chatId);
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

async function sendMessage(chatId, text, opts) {
  try { return await bot.sendMessage(chatId, text, opts); }
  catch (e) { console.error('sendMessage error:', e.message); }
}

async function editMessage(chatId, messageId, text, opts) {
  try { bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts }); }
  catch (e) { console.error('editMessage error:', e.message); }
}

async function showMainMenu(chatId, messageId) {
  const text = 'Главное меню';
  const opts = { reply_markup: getMainMenu() };
  if (messageId) editMessage(chatId, messageId, text, opts);
  else sendMessage(chatId, text, opts);
}

async function showList(chatId, category, messageId) {
  const { data, error } = await buttons.list(supabase, { category });
  if (error) { sendMessage(chatId, `Ошибка: ${error.message}`); return; }
  const { text, keyboard } = listHandler.buildListKeyboard(data, category);
  if (messageId) editMessage(chatId, messageId, text, { reply_markup: { inline_keyboard: keyboard.inline_keyboard } });
  else sendMessage(chatId, text, { reply_markup: { inline_keyboard: keyboard.inline_keyboard } });
}

bot.onText(/\/start/, async (msg) => {
  clearState(msg.chat.id);
  sendMessage(msg.chat.id, 'Главное меню', { reply_markup: getMainMenu() });
});

bot.onText(/\/help/, async (msg) => {
  sendMessage(msg.chat.id,
    'Это бот управления кнопками на сайте.\n\n' +
    'Добавить кнопку — кнопка "➕ Добавить".\n' +
    'Изменить/удалить — выберите категорию и нажмите ✏️ или 🗑️.\n' +
    'Меню — кнопка "/start" или "⬅ Назад".',
    { reply_markup: getMainMenu() }
  );
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  if (data === 'main_menu') {
    clearState(chatId);
    showMainMenu(chatId, messageId);
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data === 'help') {
    bot.editMessageText(
      'Это бот управления кнопками на сайте.\n\nДобавить кнопку — кнопка "➕ Добавить".\nИзменить/удалить — выберите категорию и нажмите ✏️ или 🗑️.\nМеню — кнопка "/start" или "⬅ Назад".',
      { chat_id: chatId, message_id: messageId, reply_markup: getMainMenu() }
    );
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data === 'settings') {
    editMessage(chatId, messageId, 'Настройки ссылок:', { reply_markup: getSettingsMenu() });
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data.startsWith('setlink:')) {
    const key = data.split(':')[1];
    const labels = { owner: 'Владелец', channel: 'Канал', chat: 'Чат' };
    setState(chatId, { step: 'setlink', settingKey: key });
    editMessage(chatId, messageId, `Введите URL для "${labels[key]}":`, { reply_markup: getBackButton() });
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data.startsWith('list:')) {
    const cat = data.split(':')[1];
    showList(chatId, cat === 'all' ? null : cat, messageId);
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data === 'add:choose_category') {
    editMessage(chatId, messageId, 'Выберите тип:', { reply_markup: addHandler.getCategoryKeyboard() });
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data === 'add:magazine' || data === 'add:exchange') {
    setState(chatId, { step: 'label', category: data.split(':')[1] });
    editMessage(chatId, messageId, 'Введите название кнопки:', { reply_markup: getBackButton() });
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data.startsWith('edit:')) {
    const id = data.split(':')[1];
    setState(chatId, { step: 'edit_label', id });
    editMessage(chatId, messageId, 'Введите новое название:', { reply_markup: getBackButton() });
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data.startsWith('delete:')) {
    const id = data.split(':')[1];
    const { error } = await deleteHandler.handleDelete(bot, supabase, chatId, id);
    if (error) sendMessage(chatId, `Ошибка: ${error.message}`);
    else sendMessage(chatId, 'Удалено');
    showList(chatId, null, messageId);
    bot.answerCallbackQuery(query.id);
    return;
  }

  if (data === 'noop') {
    bot.answerCallbackQuery(query.id);
    return;
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const state = getState(chatId);
  if (!state) return;

  if (state.step === 'label') {
    setState(chatId, { ...state, label: msg.text.trim(), step: 'url' });
    sendMessage(chatId, 'Введите URL:', { reply_markup: getBackButton() });
    return;
  }

  if (state.step === 'url') {
    const raw = msg.text.trim();
    const url = isValidUrl(raw) ? raw : `https://${raw}`;
    if (!isValidUrl(url)) {
      sendMessage(chatId, 'Неверный URL. Попробуйте ещё раз:');
      return;
    }
    const { label, category } = state;
    const { data, error } = await buttons.create(supabase, { label, url, category });
    if (error) sendMessage(chatId, `Ошибка: ${error.message}`);
    else sendMessage(chatId, `${category === 'magazine' ? 'Магазин' : 'Обменник'} создан: ${data.label}`);
    clearState(chatId);
    showMainMenu(chatId);
    return;
  }

  if (state.step === 'edit_label') {
    setState(chatId, { ...state, label: msg.text.trim(), step: 'edit_url' });
    sendMessage(chatId, 'Введите новый URL:', { reply_markup: getBackButton() });
    return;
  }

  if (state.step === 'edit_url') {
    const raw = msg.text.trim();
    const url = isValidUrl(raw) ? raw : `https://${raw}`;
    if (!isValidUrl(url)) {
      sendMessage(chatId, 'Неверный URL. Попробуйте ещё раз:');
      return;
    }
    const { id, label } = state;
    const { error } = await editHandler.handleEdit(bot, supabase, chatId, id, label, url);
    if (error) sendMessage(chatId, `Ошибка: ${error.message}`);
    else sendMessage(chatId, 'Обновлено');
    clearState(chatId);
    showMainMenu(chatId);
    return;
  }

  if (state.step === 'setlink') {
    let url = msg.text.trim();
    if (!isValidUrl(url)) {
      sendMessage(chatId, 'Неверный URL. Попробуйте ещё раз:');
      return;
    }
    const { settingKey } = state;
    const { error } = await supabase.from('settings').upsert({ key: settingKey + '_url', value: url }, { onConflict: 'key' });
    if (error) sendMessage(chatId, `Ошибка: ${error.message}`);
    else sendMessage(chatId, `✅ Ссылка "${settingKey}" обновлена: ${url}`);
    clearState(chatId);
    showMainMenu(chatId);
    return;
  }
});

console.log('Bot started');
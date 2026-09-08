import { InlineKeyboard } from "npm:grammy@1";

export function getMainMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🛒 Магазины", "list:magazine").row()
    .text("💱 Обменники", "list:exchange").row()
    .text("➕ Добавить", "add:choose_category").row()
    .text("📋 Список всех", "list:all").row()
    .text("⚙️ Настройки", "settings").row()
    .text("❓ Помощь", "help");
}

export function getSettingsMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔗 Владелец", "setlink:owner").row()
    .text("📢 Канал", "setlink:channel").row()
    .text("💬 Чат", "setlink:chat").row()
    .text("⬅ Назад", "main_menu");
}

export function getCategoryKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("📦 Магазин", "add:magazine").row()
    .text("🔄 Обменник", "add:exchange").row()
    .text("⬅ Назад", "main_menu");
}

export function getBackButton(): InlineKeyboard {
  return new InlineKeyboard().text("⬅ Назад", "main_menu");
}
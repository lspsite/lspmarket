import { Bot, InlineKeyboard } from "npm:grammy@1";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getMainMenu, getSettingsMenu, getCategoryKeyboard, getBackButton } from "./menu.ts";
import * as buttons from "./buttons.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN")!);
await bot.init();
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface SessionData {
  chat_id: number;
  state: string;
  data: Record<string, string>;
}

async function getSession(chatId: number): Promise<SessionData | null> {
  const { data } = await supabase
    .from("bot_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .single();
  return data || null;
}

async function setSession(
  chatId: number,
  state: string,
  data: Record<string, string> = {}
) {
  await supabase.from("bot_sessions").upsert(
    { chat_id: chatId, state, data, updated_at: new Date().toISOString() },
    { onConflict: "chat_id" }
  );
}

async function clearSession(chatId: number) {
  await supabase.from("bot_sessions").delete().eq("chat_id", chatId);
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildListKeyboard(items: buttons.ButtonRow[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const b of items) {
    kb.text("✏️", `edit:${b.id}`)
      .text("🗑️", `delete:${b.id}`)
      .text(b.label.slice(0, 20), "noop")
      .row();
  }
  kb.text("⬅ Назад", "main_menu");
  return kb;
}

const CAT_TITLES: Record<string, string> = {
  magazine: "🛒 Магазины",
  exchange: "💱 Обменники",
};

const CAT_EMPTY: Record<string, string> = {
  magazine: "Здесь пока нет магазинов",
  exchange: "Здесь пока нет обменников",
};

async function showList(ctx: any, category: string | null, items: buttons.ButtonRow[]) {
  let text: string;
  if (items.length === 0) {
    text = category ? CAT_EMPTY[category] || "Список пуст" : "Список пуст";
  } else {
    const title = category ? CAT_TITLES[category] || "📋 Кнопки" : "📋 Все кнопки";
    text = `${title}\n\n${items.map((b) => `${b.id.slice(0, 8)}... - ${b.label}\n${b.url}`).join("\n\n")}`;
  }
  try {
    await ctx.editMessageText(text, { reply_markup: buildListKeyboard(items) });
  } catch {
    await ctx.reply(text, { reply_markup: buildListKeyboard(items) });
  }
}

async function showMainMenu(ctx: any, text = "Главное меню") {
  try {
    await ctx.editMessageText(text, { reply_markup: getMainMenu() });
  } catch {
    await ctx.reply(text, { reply_markup: getMainMenu() });
  }
}

bot.command("start", async (ctx) => {
  await clearSession(ctx.chat.id);
  await ctx.reply("Главное меню", { reply_markup: getMainMenu() });
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Это бот управления кнопками на сайте.\n\n" +
    'Добавить кнопку — кнопка "➕ Добавить".\n' +
    "Изменить/удалить — выберите категорию и нажмите ✏️ или 🗑️.\n" +
    'Меню — кнопка "/start" или "⬅ Назад".',
    { reply_markup: getMainMenu() }
  );
});

bot.callbackQuery("main_menu", async (ctx) => {
  await clearSession(ctx.chat!.id);
  await showMainMenu(ctx);
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("help", async (ctx) => {
  const text =
    "Это бот управления кнопками на сайте.\n\n" +
    'Добавить кнопку — кнопка "➕ Добавить".\n' +
    "Изменить/удалить — выберите категорию и нажмите ✏️ или 🗑️.\n" +
    'Меню — кнопка "/start" или "⬅ Назад".';
  try {
    await ctx.editMessageText(text, { reply_markup: getMainMenu() });
  } catch {
    await ctx.reply(text, { reply_markup: getMainMenu() });
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("settings", async (ctx) => {
  await ctx.editMessageText("Настройки ссылок:", { reply_markup: getSettingsMenu() });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^setlink:(.+)$/, async (ctx) => {
  const key = ctx.match[1];
  const labels: Record<string, string> = { owner: "Владелец", channel: "Канал", chat: "Чат" };
  await setSession(ctx.chat!.id, "setlink", { settingKey: key });
  await ctx.editMessageText(`Введите URL для "${labels[key]}":`, { reply_markup: getBackButton() });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^list:(.+)$/, async (ctx) => {
  const cat = ctx.match[1];
  const category = cat === "all" ? null : cat;
  const { data, error } = await buttons.list(supabase, { category });
  if (error) {
    await ctx.answerCallbackQuery({ text: `Ошибка: ${error.message}` });
    return;
  }
  const items = data || [];
  await showList(ctx, category, items);
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("add:choose_category", async (ctx) => {
  await ctx.editMessageText("Выберите тип:", { reply_markup: getCategoryKeyboard() });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^add:(magazine|exchange)$/, async (ctx) => {
  const category = ctx.match[1];
  await setSession(ctx.chat!.id, "label", { category });
  await ctx.editMessageText("Введите название кнопки:", { reply_markup: getBackButton() });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^edit:(.+)$/, async (ctx) => {
  const id = ctx.match[1];
  await setSession(ctx.chat!.id, "edit_label", { id });
  await ctx.editMessageText("Введите новое название:", { reply_markup: getBackButton() });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery(/^delete:(.+)$/, async (ctx) => {
  const id = ctx.match[1];
  const { error } = await buttons.remove(supabase, id);
  if (error) {
    await ctx.answerCallbackQuery({ text: `Ошибка: ${error.message}` });
    return;
  }
  const { data, error: listErr } = await buttons.list(supabase);
  if (listErr) {
    await ctx.answerCallbackQuery({ text: `Ошибка: ${listErr.message}` });
    return;
  }
  const items = data || [];
  await showList(ctx, null, items);
  await ctx.answerCallbackQuery({ text: "Удалено" });
});

bot.callbackQuery("noop", async (ctx) => {
  await ctx.answerCallbackQuery();
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  const session = await getSession(chatId);
  if (!session || !session.state) return;

  const { state, data } = session;

  if (state === "label") {
    await setSession(chatId, "url", { ...data, label: text });
    await ctx.reply("Введите URL:", { reply_markup: getBackButton() });
    return;
  }

  if (state === "url") {
    const url = isValidUrl(text) ? text : `https://${text}`;
    if (!isValidUrl(url)) {
      await ctx.reply("Неверный URL. Попробуйте ещё раз:");
      return;
    }
    const { data: created, error } = await buttons.create(supabase, {
      label: data.label,
      url,
      category: data.category,
    });
    if (error) {
      await ctx.reply(`Ошибка: ${error.message}`);
    } else {
      const lbl = (created as buttons.ButtonRow)?.label || data.label;
      await ctx.reply(
        `${data.category === "magazine" ? "Магазин" : "Обменник"} создан: ${lbl}`
      );
    }
    await clearSession(chatId);
    await ctx.reply("Главное меню", { reply_markup: getMainMenu() });
    return;
  }

  if (state === "edit_label") {
    await setSession(chatId, "edit_url", { ...data, label: text });
    await ctx.reply("Введите новый URL:", { reply_markup: getBackButton() });
    return;
  }

  if (state === "edit_url") {
    const url = isValidUrl(text) ? text : `https://${text}`;
    if (!isValidUrl(url)) {
      await ctx.reply("Неверный URL. Попробуйте ещё раз:");
      return;
    }
    const { error } = await buttons.update(supabase, data.id, {
      label: data.label,
      url,
    });
    if (error) {
      await ctx.reply(`Ошибка: ${error.message}`);
    } else {
      await ctx.reply("Обновлено");
    }
    await clearSession(chatId);
    await ctx.reply("Главное меню", { reply_markup: getMainMenu() });
    return;
  }

  if (state === "setlink") {
    if (!isValidUrl(text)) {
      await ctx.reply("Неверный URL. Попробуйте ещё раз:");
      return;
    }
    const { error } = await supabase.from("settings").upsert(
      { key: data.settingKey + "_url", value: text },
      { onConflict: "key" }
    );
    if (error) {
      await ctx.reply(`Ошибка: ${error.message}`);
    } else {
      await ctx.reply(`✅ Ссылка "${data.settingKey}" обновлена: ${text}`);
    }
    await clearSession(chatId);
    await ctx.reply("Главное меню", { reply_markup: getMainMenu() });
    return;
  }
});

async function handleUpdate(req: Request): Promise<Response> {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      await bot.handleUpdate(body);
      return new Response("OK");
    } catch (e) {
      console.error("handleUpdate error:", String(e));
      return new Response(`Error: ${String(e)}\n${(e as Error).stack || ""}`, { status: 500 });
    }
  }
  return new Response("OK");
}

Deno.serve(handleUpdate);
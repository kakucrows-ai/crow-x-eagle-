"use strict";

const fs     = require("fs");
const path   = require("path");
const config = require("../config.json");

const APP_STATE_PATH = path.resolve(__dirname, "..", config.appStatePath);

module.exports = {
  name: "appstate",
  aliases: ["cookies", "setcookies"],
  description: "تحديث كوكيز الجلسة مباشرة من المحادثة ثم إعادة التشغيل. (مشرف البوت فقط)",
  usage: "appstate <json>",
  category: "Admin",
  ownerOnly: true,
  adminOnly: true,

  async execute({ api, event, args, isOwner }) {
    if (!isOwner) {
      return api.sendMessage("👑 هذا الأمر للمالك فقط.", event.threadID);
    }
    const { threadID } = event;

    const raw = args.join(" ").trim();

    if (!raw) {
      return api.sendMessage(
        "❌ أرسل الـ appstate بهذا الشكل:\n*appstate [{\"key\":\"...\",\"value\":\"...\"}]",
        threadID
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return api.sendMessage(
        "❌ الـ JSON غلط. تأكد أنك نسخت الكوكيز كاملة بشكل صحيح.",
        threadID
      );
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return api.sendMessage(
        "❌ الـ appstate يجب أن يكون مصفوفة (array) من الكوكيز.",
        threadID
      );
    }

    try {
      fs.writeFileSync(APP_STATE_PATH, JSON.stringify(parsed, null, 2));
    } catch (e) {
      return api.sendMessage("❌ فشل حفظ الكوكيز: " + e.message, threadID);
    }

    await api.sendMessage(
      "✅ تم حفظ الكوكيز بنجاح (" + parsed.length + " cookie).\n🔄 جارٍ إعادة تشغيل البوت...",
      threadID
    ).catch(() => {});

    setTimeout(() => process.exit(0), 1500);
  },
};

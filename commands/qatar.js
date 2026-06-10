"use strict";

if (!global.qatarIntervals) global.qatarIntervals = {};

module.exports = {
  name: "قطار",
  aliases: ["qatar", "train"],
  description: "يرسل الرسالة المختارة كل 40 ثانية بلا توقف — قطار وقف لإيقافه.",
  usage: "قطار <الرسالة> | قطار وقف",
  category: "الملاك",

  async execute({ api, event, args }) {
    const { threadID } = event;
    const sub = args[0];

    // ── إيقاف ──────────────────────────────────────────────────────────────
    if (sub === "وقف" || sub === "stop") {
      if (global.qatarIntervals[threadID]) {
        clearInterval(global.qatarIntervals[threadID]);
        delete global.qatarIntervals[threadID];
        return api.sendMessage("🚂 تم إيقاف القطار. 🛑", threadID);
      }
      return api.sendMessage("⚠️ القطار غير مشغّل أصلاً!", threadID);
    }

    // ── التحقق من وجود رسالة ────────────────────────────────────────────────
    const message = args.join(" ").trim();
    if (!message) {
      return api.sendMessage(
        "❌ أرسل الرسالة بعد الأمر.\nمثال: *قطار مرحباً بالجميع!",
        threadID
      );
    }

    // ── التحقق إذا القطار شغّال بالفعل ────────────────────────────────────
    if (global.qatarIntervals[threadID]) {
      return api.sendMessage(
        "🚂 القطار مشغّل بالفعل! قل *قطار وقف لإيقافه أولاً.",
        threadID
      );
    }

    // ── تشغيل القطار ───────────────────────────────────────────────────────
    await api.sendMessage(
      `🚂 انطلق القطار! سيُرسل كل 40 ثانية:\n「 ${message} 」`,
      threadID
    );

    global.qatarIntervals[threadID] = setInterval(() => {
      api.sendMessage(message, threadID).catch(() => {});
    }, 40000);
  },
};

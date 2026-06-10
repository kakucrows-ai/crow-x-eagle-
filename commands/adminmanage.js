"use strict";

const fs   = require("fs");
const path = require("path");

const CONFIG_PATH = path.resolve(__dirname, "..", "config.json");

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

module.exports = {
  name: "addadmin",
  aliases: ["removeadmin", "deladmin", "admins"],
  description: "إدارة مشرفي البوت — إضافة أو حذف أو عرض القائمة. (المالك فقط)",
  usage: "addadmin <ID> | removeadmin <ID> | admins",
  category: "Admin",
  adminOnly: true,
  ownerOnly: true,

  async execute({ api, event, args, isOwner }) {
    if (!isOwner) {
      return api.sendMessage("👑 هذا الأمر للمالك فقط.", event.threadID);
    }

    const { threadID, senderID } = event;
    const cfg = loadConfig();
    if (!cfg.bot.adminIDs) cfg.bot.adminIDs = [];
    if (!cfg.bot.ownerIDs) cfg.bot.ownerIDs = [];

    // ── عرض القائمة ──────────────────────────────────────────────────────
    const sub = (args[0] || "").toLowerCase();

    if (!sub || sub === "list" || sub === "قائمة") {
      const lines = [
        `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛`,
        `  قائمة صلاحيات البوت`,
        `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛`,
        ``,
        `👑 المالك (Owners):`,
      ];
      for (const id of cfg.bot.ownerIDs) {
        lines.push(`  ⌁ ${id}${id === senderID ? " (أنت)" : ""}`);
      }
      lines.push(``, `🔒 المشرفون (Admins):`);
      const adminsOnly = cfg.bot.adminIDs.filter(id => !cfg.bot.ownerIDs.includes(id));
      if (adminsOnly.length === 0) {
        lines.push(`  لا يوجد مشرفون إضافيون`);
      } else {
        for (const id of adminsOnly) {
          lines.push(`  ⌁ ${id}`);
        }
      }
      lines.push(``, `🪶 *addadmin <ID> | *removeadmin <ID>`);
      return api.sendMessage(lines.join("\n"), threadID);
    }

    const targetID = args[0]?.trim();
    if (!targetID || !/^\d+$/.test(targetID)) {
      return api.sendMessage("❌ أرسل ID صحيح (أرقام فقط).\nمثال: *addadmin 123456789", threadID);
    }

    // ── إضافة مشرف ──────────────────────────────────────────────────────
    if (event.body && event.body.toLowerCase().includes("addadmin")) {
      if (cfg.bot.adminIDs.includes(targetID)) {
        return api.sendMessage(`⚠️ ${targetID} مشرف بالفعل.`, threadID);
      }
      cfg.bot.adminIDs.push(targetID);
      saveConfig(cfg);
      return api.sendMessage(
        `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛\n✅ تم إضافة ${targetID} كمشرف.\n🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛`,
        threadID
      );
    }

    // ── حذف مشرف ────────────────────────────────────────────────────────
    if (cfg.bot.ownerIDs.includes(targetID)) {
      return api.sendMessage("👑 لا يمكن حذف المالك من قائمة المشرفين.", threadID);
    }
    if (!cfg.bot.adminIDs.includes(targetID)) {
      return api.sendMessage(`⚠️ ${targetID} ليس مشرفاً أصلاً.`, threadID);
    }
    cfg.bot.adminIDs = cfg.bot.adminIDs.filter(id => id !== targetID);
    saveConfig(cfg);
    return api.sendMessage(
      `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛\n🗡️ تم حذف ${targetID} من المشرفين.\n🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛`,
      threadID
    );
  },
};

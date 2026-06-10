"use strict";

const config = require("../config.json");

module.exports = {
  name: "menu",
  aliases: ["help", "h", "قائمة"],
  description: "عرض قائمة أوامر الغراب أو تفاصيل أمر معين.",
  usage: "menu [أمر]",
  category: "General",

  async execute({ api, event, args, commands }) {
    const prefix = config.prefix;

    // ── تفاصيل أمر واحد ────────────────────────────────────────────────────
    if (args[0]) {
      const name = args[0].toLowerCase().replace(/^\*+/, "");
      const cmd  = commands.get(name) ||
        [...new Set(commands.values())].find(c => c.aliases?.includes(name));
      if (!cmd) {
        return api.sendMessage(
          `🐦‍⬛ لا يوجد أمر باسم "${name}" في مخالب الغراب.`,
          event.threadID
        );
      }
      const lines = [
        `🪶━━━━━━━━━━━━━━━━━━━━🪶`,
        `🐦‍⬛  ${prefix}${cmd.name}`,
        `🪶━━━━━━━━━━━━━━━━━━━━🪶`,
        ``,
        `📜 الوصف     : ${cmd.description}`,
        `🗡️  الاستخدام : ${prefix}${cmd.usage || cmd.name}`,
      ];
      if (cmd.aliases?.length) {
        lines.push(`🔁 الاختصارات: ${cmd.aliases.map(a => prefix + a).join("  ")}`);
      }
      if (cmd.ownerOnly)  lines.push(`👑 للمالك فقط`);
      else if (cmd.adminOnly) lines.push(`🔒 يتطلب صلاحية مشرف`);
      if (cmd.groupOnly)  lines.push(`👥 للمجموعات فقط`);
      lines.push(``, `🪶━━━━━━━━━━━━━━━━━━━━🪶`);
      return api.sendMessage(lines.join("\n"), event.threadID);
    }

    // ── قائمة الأوامر ──────────────────────────────────────────────────────
    const unique     = [...new Set(commands.values())];
    const categories = {};

    for (const cmd of unique) {
      const cat = cmd.category || "General";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.name);
    }

    const ORDER = ["General", "Admin", "Group", "الملاك"];
    const sorted = [
      ...ORDER.filter(c => categories[c]),
      ...Object.keys(categories).filter(c => !ORDER.includes(c)),
    ];

    const CAT_ICONS = {
      General  : "🌑",
      Admin    : "🔴",
      Group    : "🪶",
      "الملاك" : "🐦‍⬛",
    };

    let msg = "";
    msg += `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛\n`;
    msg += `       𝕮 𝕽 𝕺 𝕎\n`;
    msg += ` 𝓢𝓸𝓾𝓵 𝓸𝓯 𝓽𝓱𝓮 𝓓𝓪𝓻𝓴𝓷𝓮𝓼𝓼\n`;
    msg += `🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛\n`;

    for (const cat of sorted) {
      const icon = CAT_ICONS[cat] || "🪶";
      msg += `\n${icon} ─── ${cat} ───\n`;
      for (const name of categories[cat]) {
        msg += `  ⌁ ${prefix}${name}\n`;
      }
    }

    msg += `\n🐦‍⬛━━━━━━━━━━━━━━━━━━━━🐦‍⬛\n`;
    msg += `🪶 ${prefix}menu <أمر> لتفاصيل أي أمر`;

    api.sendMessage(msg, event.threadID);
  },
};

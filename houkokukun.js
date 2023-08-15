const config = require("./config.json");
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const prefix = "!";

let report = {};
const categories = [
  "騒音",
  "不法投棄",
  "物件の損壊/不正使用",
  "備蓄品",
  "掃除/メンテナンス",
  "その他",
];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  console.log(
    `Received message: "${message.content}" from "${message.author.username}"`
  );

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "startreport":
      startReport(message);
      break;
    case "category":
      handleCategory(message, args);
      break;
    case "detail":
      handleDetail(message, args);
      break;
    case "suggest":
      handleSuggest(message, args);
      break;
    case "check":
      checkIncompleteFields(message);
      break;
    case "submit":
      handleSubmit(message);
      break;
  }
});

function startReport(message) {
  report = {
    username: `<@${message.author.id}>`,
    datetime: new Date().toISOString().replace(/T/, " ").replace(/\..+/, ""),
    category: null,
  };
  console.log("Starting report...");
  message.channel.send(
    "報告書の作成を開始します。カテゴリ一覧を確認してください（例: !category list）"
  );
}

function handleCategory(message, args) {
  if (args[0] === "list") {
    const categoryList = categories
      .map((cat, index) => `${index + 1}. ${cat}`)
      .join("\n");
    message.channel.send(
      `カテゴリ一覧:\n${categoryList}\n報告の対象となる番号を選択してください（例: !category 1）`
    );
  } else {
    const selectedNumber = parseInt(args[0]) - 1;
    if (selectedNumber >= 0 && selectedNumber < categories.length) {
      if (report.category) {
        message.channel.send("カテゴリを上書きしました。");
      }
      report.category = categories[selectedNumber];
      promptNextStep(message);
    } else {
      message.channel.send(
        "無効な番号です。もう一度選択してください（例: !category 1）"
      );
    }
  }
}

function handleDetail(message, args) {
  updateAndNotify(message, "detail", args.join(" "), "報告の詳細");
}

function handleSuggest(message, args) {
  updateAndNotify(message, "suggestion", args.join(" "), "提案");
}

function updateAndNotify(message, field, value, fieldName) {
  if (report[field]) {
    message.channel.send(`${fieldName}を上書きしました。`);
  }
  report[field] = value;
  promptNextStep(message);
}

function promptNextStep(message) {
  if (!report.category) {
    message.channel.send("カテゴリを選択してください（例: !category list）");
  } else if (!report.detail) {
    message.channel.send(
      "報告の詳細を入力してください（例: !detail 部屋の鍵が壊れています）"
    );
  } else if (!report.suggestion) {
    message.channel.send(
      "報告に対する提案を入力してください（例: !suggest 交換しましょう！）"
    );
  } else {
    message.channel.send(
      "すべてのフィールドが入力されました。!checkで確認後、!submitで報告書を提出してください。"
    );
  }
}

function checkIncompleteFields(message) {
  const embed = new MessageEmbed().setTitle("未完の報告書").setColor("ORANGE");

  const fields = [];
  if (report.username) fields.push({ name: "報告者", value: report.username });
  if (report.datetime)
    fields.push({ name: "報告日時", value: report.datetime });
  if (report.category)
    fields.push({ name: "カテゴリ", value: report.category });
  if (report.detail) fields.push({ name: "詳細", value: report.detail });
  if (report.suggestion)
    fields.push({ name: "提案", value: report.suggestion });

  embed.addFields(fields);

  if (!report.category || !report.detail || !report.suggestion) {
    const missingFields = [];
    if (!report.category) missingFields.push("- カテゴリ: !category list");
    if (!report.detail)
      missingFields.push("- 詳細: !detail 部屋の鍵が壊れています");
    if (!report.suggestion)
      missingFields.push("- 提案: !suggest 交換しましょう！");

    const missingStr = missingFields.join("\n");
    message.channel.send(
      `以下のフィールドが未入力です: \n${missingStr}\n上記を入力してから、!submitで報告書を提出してください。`
    );
  } else {
    message.channel.send(
      "すべてのフィールドが入力されています。報告書の提出には!submitを使用します。"
    );
  }

  message.channel.send({ embeds: [embed] });
}

function handleSubmit(message) {
  const embed = new MessageEmbed().setTitle("報告書").setColor("BLUE");

  const fields = [];
  if (report.username) fields.push({ name: "報告者", value: report.username });
  if (report.datetime)
    fields.push({ name: "報告日時", value: report.datetime });
  if (report.category)
    fields.push({ name: "カテゴリ", value: report.category });
  if (report.detail) fields.push({ name: "詳細", value: report.detail });
  if (report.suggestion)
    fields.push({ name: "提案", value: report.suggestion });

  embed.addFields(fields);

  if (!report.category || !report.detail || !report.suggestion) {
    message.channel.send(
      "未入力のフィールドがあります。確認するには!checkを使用してください。"
    );
    return;
  }
  message.channel.send({ embeds: [embed] });
  console.log("Report submitted!");
}

client.login(config.DISCORD_BOT_TOKEN);

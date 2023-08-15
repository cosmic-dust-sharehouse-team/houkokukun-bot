const token = require("./token.json");
const { generateProperties } = require("./generate-properties.js");
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
    case "title":
      handleTitle(message, args);
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
      checkIncompleteFields(message, true);
      break;
    case "submit":
      handleSubmit(message);
      break;
  }
});

function startReport(message) {
  const jstDate = new Date();
  jstDate.setHours(jstDate.getHours() + 9);
  const jstDateString = jstDate.toISOString().replace(/T/, " ").split(".")[0];

  report = {
    username: `<@${message.author.id}>`,
    datetime: jstDateString,
    category: null,
    title: null,
  };
  console.log("Starting report...");
  message.channel.send(
    "報告書の作成を開始します。タイトルを入力してください。\n```!title 部屋の鍵について```"
  );
}

function handleTitle(message, args) {
  if (!args.length) {
    message.channel.send(
      "タイトルを入力してください。\n```!title 部屋の鍵について```"
    );
    return;
  }

  const newTitle = args.join(" ");
  if (report.title) {
    message.channel.send(`タイトルを「**${newTitle}**」に上書きしました。`);
  } else {
    message.channel.send(`タイトルを「**${newTitle}**」に設定しました。`);
  }

  report.title = newTitle;
  promptNextStep(message);
}

function handleCategory(message, args) {
  if (args[0] === "list") {
    const categoryList = categories
      .map((cat, index) => `${index + 1}. ${cat}`)
      .join("\n");
    message.channel.send(
      `カテゴリ一覧:\n${categoryList}\n報告の対象となる番号を選択してください。\n\`\`\`!category <number>\`\`\``
    );
    return;
  }

  const selectedNumber = parseInt(args[0]) - 1;
  if (selectedNumber >= 0 && selectedNumber < categories.length) {
    const newCategory = categories[selectedNumber];
    if (report.category) {
      message.channel.send(
        `カテゴリを「**${newCategory}**」に上書きしました。`
      );
    } else {
      message.channel.send(`カテゴリを「**${newCategory}**」に設定しました。`);
    }

    report.category = newCategory;
    promptNextStep(message);
  } else {
    message.channel.send(
      "無効な番号です。もう一度選択してください。\n```!category <number>```"
    );
  }
}

function handleDetail(message, args) {
  if (!args.length) {
    message.channel.send(
      "詳細を入力してください。\n```!detail 部屋の鍵が壊れています```"
    );
    return;
  }

  const newDetail = args.join(" ");
  if (report.detail) {
    message.channel.send(
      "報告の詳細を上書きしました: \n```\n" + newDetail + "\n```"
    );
  } else {
    message.channel.send(
      "報告の詳細を設定しました: \n```\n" + newDetail + "\n```"
    );
  }

  report.detail = newDetail;
  promptNextStep(message);
}

function handleSuggest(message, args) {
  if (!args.length) {
    message.channel.send(
      "提案を入力してください。\n```!suggest 交換しましょう！```"
    );
    return;
  }

  const newSuggestion = args.join(" ");
  if (report.suggestion) {
    message.channel.send(
      "提案を上書きしました: \n```\n" + newSuggestion + "\n```"
    );
  } else {
    message.channel.send(
      "提案を設定しました: \n```\n" + newSuggestion + "\n```"
    );
  }

  report.suggestion = newSuggestion;
  promptNextStep(message);
}

function updateAndNotify(message, field, value, fieldName) {
  if (report[field]) {
    message.channel.send(`${fieldName}を上書きしました。`);
  }
  report[field] = value;
  promptNextStep(message);
}

function promptNextStep(message) {
  if (!report.title) {
    message.channel.send(
      "タイトルを入力してください（例:\n```!title 部屋の鍵について```"
    );
  } else if (!report.category) {
    message.channel.send(
      "カテゴリを選択してください（例:\n```!category list```"
    );
  } else if (!report.detail) {
    message.channel.send(
      "報告の詳細を入力してください（例:\n```!detail 部屋の鍵が壊れています```"
    );
  } else if (!report.suggestion) {
    message.channel.send(
      "報告に対する提案を入力してください（例:\n```!suggest 交換しましょう！```"
    );
  } else {
    message.channel.send(
      "すべてのフィールドが入力されました。`!check`で確認後、`!submit`で報告書を提出してください。"
    );
  }
}

function checkIncompleteFields(message, isManualCheck) {
  const embed = new MessageEmbed().setTitle("未完の報告書").setColor("ORANGE");

  const fields = [];
  if (
    report.username &&
    typeof report.username === "string" &&
    report.username.trim() !== ""
  )
    fields.push({ name: "報告者", value: report.username });
  if (
    report.datetime &&
    typeof report.datetime === "string" &&
    report.datetime.trim() !== ""
  )
    fields.push({ name: "報告日時", value: report.datetime });
  if (
    report.title &&
    typeof report.title === "string" &&
    report.title.trim() !== ""
  )
    fields.push({ name: "タイトル", value: report.title });
  if (
    report.category &&
    typeof report.category === "string" &&
    report.category.trim() !== ""
  )
    fields.push({ name: "カテゴリ", value: report.category });
  if (
    report.detail &&
    typeof report.detail === "string" &&
    report.detail.trim() !== ""
  )
    fields.push({ name: "詳細", value: report.detail });
  if (
    report.suggestion &&
    typeof report.suggestion === "string" &&
    report.suggestion.trim() !== ""
  )
    fields.push({ name: "提案", value: report.suggestion });

  embed.addFields(fields);

  if (
    !report.title ||
    !report.category ||
    !report.detail ||
    !report.suggestion
  ) {
    const missingFields = [];
    if (!report.title)
      missingFields.push("- タイトル（例:\n```!title 部屋の鍵について```");
    if (!report.category)
      missingFields.push("- カテゴリ（例:\n```!category list```");
    if (!report.detail)
      missingFields.push("- 詳細（例:\n```!detail 部屋の鍵が壊れています```");
    if (!report.suggestion)
      missingFields.push("- 提案（例:\n```!suggest 交換しましょう！```");

    const missingStr = missingFields.join("\n");
    message.channel.send(
      `以下のフィールドが未入力です: \n${missingStr}\n上記を入力してから、\`!submit\`で報告書を提出してください。`
    );
    if (fields.length > 0) {
      message.channel.send({ embeds: [embed] });
    }
    return false;
  } else if (isManualCheck) {
    message.channel.send({ embeds: [embed] });
  } else {
    return true;
  }
}

function handleSubmit(message) {
  const embed = new MessageEmbed().setTitle("報告書").setColor("BLUE");

  const fieldsToAdd = [
    { name: "報告者", value: report.username },
    { name: "報告日時", value: report.datetime },
    { name: "タイトル", value: report.title },
    { name: "カテゴリ", value: report.category },
    { name: "詳細", value: report.detail },
    { name: "提案", value: report.suggestion },
  ].filter(
    (field) => typeof field.value === "string" && field.value.trim() !== ""
  );

  embed.addFields(fieldsToAdd);

  if (!checkIncompleteFields(message, false)) {
    return;
  } else {
    message.channel.send({ embeds: [embed] }).then((sentMessage) => {
      const fields = [
        { name: "タイトル", value: report.title, type: "title" },
        { name: "カテゴリ", value: report.category, type: "multi_select" },
        { name: "詳細", value: report.detail, type: "rich_text" },
        { name: "提案", value: report.suggestion, type: "rich_text" },
        { name: "URL", value: sentMessage.url, type: "url" },
      ];

      console.log("Fields to be sent to Notion:", fields);
      generateProperties(fields)
        .then((response) => {
          console.log("Add fields to Notion", response);
          message.channel.send("報告書がNotionに送信されました。");
        })
        .catch((error) => {
          console.error("Detected an error while writing to Notion!", error);
          message.channel.send(
            "Notionへの書き込み中にエラーが発生しました。時間をおいて再度報告をしてください。"
          );
        });
      console.log("Report submitted!");
    });
  }
}

client.login(token.DISCORD_BOT_TOKEN);

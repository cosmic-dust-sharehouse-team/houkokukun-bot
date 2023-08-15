const token = require("./token.json");
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: token.NOTION_API_TOKEN,
});

async function generateProperties(fields) {
  const properties = fields.reduce((acc, field) => {
    switch (field.type) {
      case "title":
        acc[field.name] = { title: [{ text: { content: field.value } }] };
        break;
      case "date":
        acc[field.name] = { date: { start: field.value } };
        break;
      case "multi_select":
        acc[field.name] = { multi_select: [{ name: field.value }] };
        break;
      case "rich_text":
        acc[field.name] = { rich_text: [{ text: { content: field.value } }] };
        break;
      case "url":
        acc[field.name] = { url: field.value };
        break;
    }
    return acc;
  }, {});

  const response = await notion.pages.create({
    parent: {
      database_id: token.NOTION_DATABASE_ID,
    },
    properties: properties,
  });

  return response;
}

module.exports = {
  generateProperties,
};

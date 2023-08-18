## About
The `houkokukun-bot` is a Discord tool designed for streamlined issue reporting and suggestions. With category-specific inputs, users can create organized reports for clear communication among members. Initiate with !startreport, follow prompts, and finalize with !submit.

## How to Use
Before running the bot, you'll need to set up your Discord token.
### Step 0: Install discord.js and notion-sdk-js
Install the recommended version 13 of discord.js and the latest version of notion-sdk-js to your local repository.
```
npm install discord.js@v13-lts
npm install @notionhq/client
```
### Step 1: Create the Configuration File
Create a new file named `token.json` in the root directory of your project.
### Step 2: Add the Token
Copy and paste the following content into `token.json`:
```json
{
  "DISCORD_BOT_TOKEN": "YOUR_DISCORD_BOT_TOKEN",
  "NOTION_API_TOKEN": "YOUR_NOTION_API_TOKEN",
  "NOTION_DATABASE_ID": "YOUR_NOTION_DATABASE_ID"
}
```
⚠️ Warning: Never commit your token.json with your actual token to any public repositories. It's crucial to keep your Discord bot token confidential.
### Step 3: Run the Bot
Once you have set up your token in the token.json file, you can run your bot using the following command:
```
node houkoku-kun.js
```

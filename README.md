## About
houkokukun-bot is a Discord tool designed for streamlined issue reporting and suggestions. With category-specific inputs, users can create organized reports for clear communication among members. Initiate with !startreport, follow prompts, and finalize with !submit.

## How to Use
Before running the bot, you'll need to set up your Discord token.
### Step 1: Create the Configuration File
Create a new file named `config.json` in the root directory of your project.
### Step 2: Add the Token
Copy and paste the following content into `config.json`:
```json
{
  "DISCORD_BOT_TOKEN": "YOUR_DISCORD_BOT_TOKEN"
}
```
⚠️ Warning: Never commit your config.json with your actual token to any public repositories. It's crucial to keep your Discord bot token confidential.
### Step 3: Run the Bot
Once you have set up your token in the config.json file, you can run your bot using the following command:
```
node houkokukun.js
```

require("./keep_alive");
const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GROQ_API_KEY = "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";
const AI_CHANNEL_ID = "KANAL_ID_BURAYA";
const history = new Map();

async function getAIReply(userId, userMessage) {
  if (!history.has(userId)) history.set(userId, []);
  const userHistory = history.get(userId);
  if (userHistory.length > 10) userHistory.splice(0, 2);
  userHistory.push({ role: "user", content: userMessage });
  const messages = [
    { role: "system", content: "You are a friendly Discord bot. Always reply in the same language the user writes in." },
    ...userHistory,
  ];
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, max_tokens: 800 }),
  });
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  if (reply) userHistory.push({ role: "assistant", content: reply });
  return reply || "Hata oluştu!";
}

client.on("ready", () => console.log(`Bot aktif: ${client.user.tag}`));

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const isMentioned = message.mentions.has(client.user);
  const isAIChannel = message.channel.id === AI_CHANNEL_ID;
  const isReply = message.reference?.messageId
    ? (await message.channel.messages.fetch(message.reference.messageId).catch(() => null))?.author?.id === client.user.id
    : false;
  if (!isMentioned && !isAIChannel && !isReply) return;
  const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim();
  if (!userMessage) return;
  await message.channel.sendTyping();
  const reply = await getAIReply(message.author.id, userMessage);
  await message.reply(reply);
});

client.login(process.env.DISCORD_TOKEN);

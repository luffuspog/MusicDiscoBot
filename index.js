const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const YouTubeMusicApi = require("youtube-music-api");

const api = new YouTubeMusicApi();
const TOKEN = "SEU_TOKEN_DO_DISCORD";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot MusicDisco conectado como ${client.user.tag}`);
  api.initialize();
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!play ") || message.author.bot) return;

  const searchQuery = message.content.replace("!play ", "");
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply(
      "❌ Você precisa estar em um canal de voz para tocar música!"
    );
  }

  try {
    const searchResults = await api.search(searchQuery, "song");
    if (!searchResults.content.length)
      return message.reply("❌ Nenhuma música encontrada.");

    const song = searchResults.content[0];
    const songUrl = `https://www.youtube.com/watch?v=${song.videoId}`;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    const stream = ytdl(songUrl, {
      filter: "audioonly",
      quality: "highestaudio",
    });
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    message.reply(
      `🎶 Tocando agora: **${song.name}** - ${song.artist.name} (${songUrl})`
    );
  } catch (error) {
    console.error(error);
    message.reply("❌ Erro ao tentar tocar a música.");
  }
});

client.login(TOKEN);

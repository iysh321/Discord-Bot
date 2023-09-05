require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});
const { joinVoiceChannel } = require("@discordjs/voice");
const schedule = require("node-schedule");

const channelId = process.env.CHANNELID; // 잡담방
const musicChannelId = process.env.MUSIC_CHANNEL_ID; //음악방송
const voiceChannelId = process.env.VOICE_CHANNEL_ID; // 보이스

function scheduleMessages() {
  const channel = client.channels.cache.get(channelId);
  const musicChannel = client.channels.cache.get(musicChannelId);
  const voiceChannel = client.channels.cache.get(voiceChannelId);

  schedule.scheduleJob("0 0 22 * * 4", () => {
    channel.send(
      "@everyone 안녕하세요! 금요일은 **자율출퇴근날** 입니다. 7~12시 사이에 출근 해주세요.\n출근 찍는 것은 잊지마세요~"
    );
  });

  // 출근시간 - AM 9:00
  schedule.scheduleJob("0 0 0 * * 1-5", () => {
    channel.send(
      "@everyone 안녕하세요! 9시 입니다. \n여러분, 출근은 잘 하셨나요? 부탁하나만 할께요.. 제발 출근 좀 찍어주세요. 제가 너무 괴로워요..."
    );
  });

  // 주간회의시간 AM 10:00
  schedule.scheduleJob("0 0 1 * * 2", () => {
    channel.send(
      "@everyone 지금은 10시 **'주간회의시간'** 입니다! \n 회의실로 모여주시기 바랍니다."
    );
  });

  // 집중근무시간 AM 10:00
  const daysToSchedule = [1, 3, 4, 5]; // 월요일(1), 수요일(3), 목요일(4), 금요일(5)
  daysToSchedule.forEach((day) => {
    schedule.scheduleJob(`0 0 1 * * ${day}`, () => {
      channel.send(
        "@everyone GunBot이 알립니다. 지금은 10시 **'집중근무시간'** 입니다! \n 12시까지 구두는 회의실 & 채팅은 지양부탁드립니다.\n 말을 꺼내기 전에 오전에 당장 필요한 말인지 한번만 더 고민해주세요.\n**동료의 집중 시간을 존중해주세요~**"
      );

      if (voiceChannel) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        console.log("봇이 음성 채널로 입장하였습니다.");

        // 일정 시간 뒤에 보이스 채널에서 퇴장
        setTimeout(() => {
          connection.destroy();
          console.log("봇이 음성 채널에서 퇴장하였습니다.");
        }, 7200000); // 퇴장을 지연시키기 위한 2시간 대기 (2시간 후에 퇴장)
      } else {
        console.log("음성 채널을 찾을 수 없습니다.");
      }
    });
  });

  // 퇴근시간 PM 06:00
  schedule.scheduleJob("0 0 9 * * 1-5", () => {
    channel.send(
      "@here GunBot이 기쁜소식 알려드립니다.\n 지금은 18시 퇴근시간 입니다. 퇴근 찍고가세요! 고생하셨습니다~"
    );
  });

  //메세지 정리
  schedule.scheduleJob("0 30 9 * * 1-5", () => {
    channel.messages
      .fetch({ limit: 100 })
      .then((messages) => {
        const botMessages = messages.filter((msg) => msg.author.bot);
        message.channel.bulkDelete(botMessages);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  scheduleMessages();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.on("message", (message) => {
  if (message.content.startsWith("/안녕")) {
    message.channel.send("안녕 나는 Gun Bot 이야"); //메세지를 채널에 전송합니다.
  }
  if (message.content.startsWith("/누구야")) {
    message.channel.send("Gun Bot");
  }
});

client.login(process.env.TOKEN);

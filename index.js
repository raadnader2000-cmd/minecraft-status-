const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const MC_IP = process.env.MC_IP;
const MC_PORT = parseInt(process.env.MC_PORT) || 17186;
const CHANNEL_ID = process.env.CHANNEL_ID;
const UPDATE_INTERVAL = 60000;

client.once('ready', () => {
  console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, UPDATE_INTERVAL);
});

async function updateStatus() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.error('❌ لم يتم العثور على الروم');

    let embed;
    try {
      const result = await util.status(MC_IP, MC_PORT, { enableSRV: false });
      
      embed = new EmbedBuilder()
        .setTitle('🎮 حالة سيرفر Life_Hork_S2')
        .setColor('#00FF00')
        .addFields(
          { name: '🌐 الحالة', value: '🟢 أونلاين (شغال)', inline: true },
          { name: '👥 اللاعبين', value: `\`${result.players.online} / ${result.players.max}\``, inline: true },
          { name: '📌 IP الجافا', value: `\`${MC_IP}:${MC_PORT}\``, inline: false },
          { name: '📱 IP البيدروك', value: `IP: \`${MC_IP}\`\nPort: \`${MC_PORT}\``, inline: false }
        )
        .setFooter({ text: 'تحديث تلقائي كل دقيقة • Aternos' })
        .setTimestamp();

      client.user.setActivity(`Players: ${result.players.online}/${result.players.max}`, { type: 3 });

    } catch (error) {
      embed = new EmbedBuilder()
        .setTitle('🎮 حالة سيرفر Life_Hork_S2')
        .setColor('#FF0000')
        .addFields(
          { name: '🌐 الحالة', value: '🔴 أوفلاين (مغلق)', inline: true },
          { name: '👥 اللاعبين', value: '`0 / 0`', inline: true },
          { name: '💡 ملاحظة', value: 'السيرفر يتطلب التشغيل من موقع Aternos', inline: false }
        )
        .setFooter({ text: 'تحديث تلقائي كل دقيقة • Aternos' })
        .setTimestamp();

      client.user.setActivity('السيرفر مغلق 🔴', { type: 3 });
    }

    const messages = await channel.messages.fetch({ limit: 10 });
    const lastBotMessage = messages.find(m => m.author.id === client.user.id);

    if (lastBotMessage) {
      await lastBotMessage.edit({ embeds: [embed] });
    } else {
      await channel.send({ embeds: [embed] });
    }

  } catch (err) {
    console.error('حدث خطأ أثناء التحديث:', err);
  }
}

client.login(process.env.DISCORD_TOKEN);

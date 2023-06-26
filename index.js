const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");
const qrcode = require('qrcode-terminal');
const config = require('./config.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
 

let prefix = '!';

client.on('qr', (qr) => {
  // Tampilkan QR code di terminal
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Connected and ready to use');

  // Mengubah status teks profil
client.setStatus(`Status: Online | ${config.BOT_NAME} V ${config.BOT_VER} | Author : ${config.BOT_OWNER}`)
    .then(() => {
        console.log('Info profil berhasil diubah');
    })
    .catch((error) => {
        console.error('Gagal mengubah Info profil:', error);
    });
});

client.on('disconnected', (reason) => {
    console.log(`Client disconnected: ${reason}`);
});

// // Handle termination signal (SIGINT)
// process.on('SIGINT', async () => {
//     // Change the profile status to "Offline"
//     try {
//         await client.setStatus(`Status: Offline | ${config.BOT_NAME} ${config.BOT_VER} | Author: ${config.BOT_OWNER}`);
//         console.log('Profile status successfully updated');
//     } catch (error) {
//         console.error('Failed to update profile status:', error);
//     }
//     // Destroy the client and exit the process
//     client.destroy();
//     process.exit(0);
// });

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('message', async (msg) => {
    try {
        if (msg.body.toLowerCase() === `${prefix}halo`) {
            msg.reply(`Halo! Aku adalah sebuah bot Whatsapp yang dibuat oleh ${config.BOT_OWNER}.`);
        } else if(msg.body.toLowerCase() === `${prefix}menu`) {
            // Buat objek media dari URL gambar
            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const menus = `|--------- [ *INFO* ] ---------|\n*Bot Name\t:* _${config.BOT_NAME}_\n*Bot Version\t:* _${config.BOT_VER}_\n*Bot Prefix\t:* _"${prefix}"_\n*Bot Owner\t:* _${config.BOT_OWNER}_\n---------------------------\n\n|======= [ *MENU* ] =======|\n=> _${prefix}halo_\n=> _${prefix}menu_\n=> _${prefix}sticker_\n=> _${prefix}ask|<question>_\n=> _${prefix}menfes|<nomor telepon>|<nama pengirim>|<pesan>_\n`

            client.sendMessage(msg.from, media, {
                caption: menus,
            });
        } else if(msg.body.startsWith(`${prefix}sticker`)) {
            if (msg.type === 'image') {
                const media = await msg.downloadMedia() .catch((err) => {
                    console.error(err);
                    client.sendMessage("Error downloading media");
                });

                client.sendMessage(msg.from, media, {
                    sendMediaAsSticker: true,
                    stickerAuthor: "Mztay Bot",
                    stickerName: "Gweh Anime by Mastay",
                });
            } else {
                msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`)
            }
        } else if (msg.body.startsWith(`${prefix}ask`)) {
            const params = msg.body.split("|");

            if(params.length === 2) {
                const question = params[1].trim();

                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `${question}\n\nBot:`,
                    temperature: 0.9,
                    max_tokens: 150,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0.6,
                    stop: ["Bot:"],
                });

                msg.reply(response.data.choices[0].text)
            } else {
                msg.reply(`Format salah, gunakan ${prefix}ask|<pertanyaan>`)
            }
        } else if (msg.body.startsWith(`${prefix}menfes`)) {
            const params = msg.body.split("|");
            if (params.length === 4) {
                const targetNumber = `${params[1].trim()}@c.us`;
                const senderName = params[2].trim();
                const message = params[3].trim();

                const formatedMessage = `Hai ada pesan nih buat kamu\nDari : ${senderName}\nPesan :\n${message}\n`;

                await client.sendMessage(targetNumber, formatedMessage) .then(() => {
                    msg.reply("Pesan berhasil terkirim")
                }) .catch((err) => {
                    msg.reply('Pesan gagal terkirim, silahkan kontak developer untuk melapor');
                    console.log(err);
                });
            } else {
                msg.reply(`Format salah, gunakan ${prefix}menfes|<nomor telepon>|<nama pengirim>|<pesan>`)
            }
        } else if (msg.body.startsWith(`${prefix}kill`)) {
            // Perbarui status ke offline
            client.setStatus(`Status: Offline | ${config.BOT_NAME} ${config.BOT_VER} | Author : ${config.BOT_OWNER}`)
            .then(() => {
                console.log('Info profil berhasil diubah');
                client.destroy();
            })
            .catch((error) => {
                console.error('Gagal mengubah Info profil:', error);
            });
        
            // Kirim balasan
            msg.reply('Bot telah dimatikan dan status diubah ke offline.');
            // Matikan bot
        }
    } catch (err) {
        console.error(err);
    }
});

client.initialize();

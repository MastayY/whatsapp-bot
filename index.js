const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl")
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const ytmp3 = require('ytmp3-scrap');
const config = require('./config.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    }
});

const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
 

const prefixList = ["/", "!", "#", "$"];
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
            console.log(`${msg.from} Use command ${prefix}halo. Status : Success`);

        } else if(msg.body.toLowerCase() === `${prefix}help` || msg.body.toLowerCase() === `${prefix}menu`) {
            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const menus = `|--------- [ *INFO* ] ---------|\n*Bot Name\t:* _${config.BOT_NAME}_\n*Bot Version\t:* _${config.BOT_VER}_\n*Bot Prefix\t:* _"${prefix}"_\n*Bot Owner\t:* _${config.BOT_OWNER}_\n---------------------------\n\n|======= [ *MENU* ] =======|\n=> _*${prefix}halo*_\n=> _*${prefix}help*_\n=> _*${prefix}sticker*_\n=> _*${prefix}ask|<question>*_\n=> _*${prefix}menfes|<nomor telepon>|<nama pengirim>|<pesan>*_\n=> _*${prefix}tiktok <type> <link url tiktok>*_\n=> _*${prefix}ytmp3 <url video>*_\n\n_Note : masukkan parameter tanpa simbol "< >"_`

            client.sendMessage(msg.from, media, {
                caption: menus,
            });

            console.log(`${msg.from} Use command ${prefix}help. Status : Success`);

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
                console.log(`${msg.from} Use command ${prefix}sticker. Status : Success`);
            } else {
                console.log(`${msg.from} Use command ${prefix}sticker. Status : Invalid Format Type`);
                msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`)
            }
        } else if (msg.body.startsWith(`${prefix}ask`)) {
            const params = msg.body.split("|");

            if(params.length !== 2) {
                msg.reply(`Format salah, gunakan ${prefix}ask|<pertanyaan>`);
                console.log(`${msg.from} Use command ${prefix}ask. Status : Invalid Parameter`);
                return;
            }

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
            console.log(`${msg.from} Use command ${prefix}ask. Status : Success`);

        } else if (msg.body.startsWith(`${prefix}menfes`)) {
            const params = msg.body.split("|");

            if (params.length !== 4) {
                console.log(`${msg.from} Use command ${prefix}menfes. Status : Invalid Parameter`);
                msg.reply(`Format salah, gunakan ${prefix}menfes|<nomor telepon>|<nama pengirim>|<pesan>`);
                return;
            }

            const targetNumber = `${params[1].trim()}@c.us`;
            const senderName = params[2].trim();
            const message = params[3].trim();

            const formatedMessage = `Hai, aku *${config.BOT_NAME}*\nada pesan nih buat kamu\n|======== [ *PESAN* ] ========|\n\nDari : _*${senderName}*_\nPesan :\n_${message}_\n\n|=========================|`;

            await client.sendMessage(targetNumber, formatedMessage) .then(() => {
                msg.reply("Pesan berhasil terkirim")
                console.log(`${msg.from} Use command ${prefix}menfes. Status : Success`);
            }) .catch((err) => {
                msg.reply('Pesan gagal terkirim, silahkan kontak developer untuk melapor');
                console.log(err);
            });
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
        } else if (msg.body.startsWith('!tiktok')) {
            const params = msg.body.split(" ");
            if (params.length !== 3) {
                console.log(`${msg.from} Use command ${prefix}tiktok. Status : Invalid Parameter`);
                msg.reply(`Gunakan *${prefix}tiktok <type> <url>*.\n_type = video | music_`);
                return;
            }
            
            const type = params[1].trim().toLowerCase();
            const url = params[2].trim();

            
            switch(type) {
                case 'video':
                case 'music':
                    try {
                        msg.reply("Fitur ini masih beta, kecepatan respon tergantung internet.");
                        const defaultUrl = await TiktokDL(url);
                        // console.log(defaultUrl);
                        const downloadUrl = defaultUrl.result[type][0];
                        // console.log(downloadUrl);
                        const media = await MessageMedia.fromUrl(downloadUrl, {
                            unsafeMime: true,
                        });
                        client.sendMessage(msg.from, media, {
                            caption: "Download berhasil!",
                            
                        });
                        console.log(`${msg.from} Use command ${prefix}tiktok. Status : Success`);
                    } catch (error) {
                        console.error(error);
                        msg.reply('Gagal mengunduh video TikTok, Pastikan link yang anda masukkan benar');
                    }

                    break;
                default:
                    msg.reply("Tolong masukkan tipe download:\n1. Video\n2. Music")
                    console.log(`${msg.from} Use command ${prefix}tiktok. Status : Invalid Parameter`);
                    break;
            }
        } else if(msg.body.startsWith(`${prefix}ytmp3`)) {
            const params = msg.body.split(" ");

            if (params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}ytmp3. Status: Invalid Parameter`);
                msg.reply(`Format salah, gunakan ${prefix}ytmp3 <url youtube>`);
                return;
            }

            msg.reply("Mohon tunggu....\nOrang sabar disayang zeta💀")

            const url = params[1].trim();
            const defaultUrl = await ytmp3(url);
            const downloadUrl = defaultUrl.download;
            const title = defaultUrl.title;
            const filePath = `src/audio/audio.mp3`; // Ubah lokasi dan nama file sesuai kebutuhan

            try {
                const response = await axios({
                    url: downloadUrl,
                    method: "GET",
                    responseType: "stream",
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                const media = MessageMedia.fromFilePath(filePath);
                client.sendMessage(msg.from, media);
                client.sendMessage(msg.from, `Berhasil mendownload _${title}_`);
                console.log(`${msg.from} Use command ${prefix}ytmp3. Status : Success`);

                // Hapus file setelah dikirim
                fs.unlinkSync(filePath);
            });

            writer.on("error", (err) => {
                console.error(err);
                msg.reply("Gagal mendownload audio");
            });
            } catch (error) {
                console.error(error);
                msg.reply("Gagal mendownload audio");
            }
        }
    } catch (err) {
        console.error(err);
    }
});

client.initialize();

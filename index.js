const { Client, LocalAuth, MessageMedia, Contact } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");
const script = require("./src/file/script.js")
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ytmp3 = require('ytmp3-scrap');
const ffmpeg = require('fluent-ffmpeg');
const config = require('./config.js');
const { runtime, query, tanggal, getGreeting } = require('./lib/function.js');
const {
    getLimitInfo,
    incrementLimitUsage,
    setDailyLimit,
    addPremiumUser,
    removePremiumUser,
    addBotOwner,
    removeBotOwner,
    isPremiumUser,
    isBotOwner,
} = require('./lib/db.js');

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
let limitreached = false;

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

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

function checkLimit(userId) {
    const limitInfo = getLimitInfo(userId);

    if (!limitInfo) {
      // Jika belum ada informasi limit, tambahkan ke database
        setDailyLimit(userId, 20);
    } else if (limitInfo.used >= limitInfo.limit && !isBotOwner(userId)) {
        limitreached = true;
    } else {
      // Jika limit masih tersedia atau user premium/owner bot, tambahkan penggunaan limit
        incrementLimitUsage(userId);
    }
}

client.on('message', async (msg) => {
    try {
        if (msg.body.toLowerCase() === `${prefix}halo`) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            msg.reply(`Halo! Aku adalah sebuah bot Whatsapp yang dibuat oleh ${config.BOT_OWNER}.`);
            console.log(`${msg.from} Use command ${prefix}halo. Status : Success`);

        } else if(msg.body.toLowerCase() === `${prefix}help` || msg.body.toLowerCase() === `${prefix}menu`) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }
            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const pushName = await msg.getContact();
            const rawDateTime = new Date();
            const dateTime = tanggal(rawDateTime);
            const currentTime = new Date().toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');

            const baseMenu = `\n╔════《 _*INFO*_ 》════⊱\n╠➤ Bot Name    : *${config.BOT_NAME}*\n╠➤ Version     : *${config.BOT_VER}*\n╠➤ Prefix      : *${prefix}*\n╠➤ Owner       : *${config.BOT_OWNER}*\n╚═════════════⊱\n╔═══《 _SOSMED_ 》═══⊱\n╠➤ Instagram   : ${config.ig}\n╠➤ Youtube     : ${config.yt}\n╠➤ Github      : ${config.github}\n╠➤ Twitter     : ${config.twitter}\n╚═════════════⊱\n╔══《 _COMMAND_ 》══⊱\n╠➤ ${prefix}halo\n╠➤ ${prefix}menu\n╠➤ ${prefix}sticker\n╠➤ ${prefix}ask\n╠➤ ${prefix}menfes\n╠➤ ${prefix}tiktok\n╠➤ ${prefix}ytmp3\n╠➤ ${prefix}urlshort\n╠➤ ${prefix}cimage1\n╠➤ ${prefix}cimage2 (premium user)\n╠➤ ${prefix}mylimits\n╚═════════════⊱`;

            const admMenu = `\n╔═══《 _𝙾𝚆𝙽𝙴𝚁_ 》════⊱\n╠➤ ${prefix}addowner\n╠➤ ${prefix}addpremium\n╠➤ ${prefix}removepremium\n╠➤ ${prefix}removeowner\n╠➤ ${prefix}listowner\n╠➤ ${prefix}listpremium\n╠➤ ${prefix}kill\n╚═════════════⊱`

            const menus = `Hai kak _*${pushName.pushname}*_, ${getGreeting()}👋. Namaku *${config.BOT_NAME}*\n\nHari, tanggal : *${dateTime}*\nJam : *${currentTime}*\n${baseMenu}\n╔═══《 𝑹𝑼𝑵𝑻𝑰𝑴𝑬 》═══⊱\n╠❏ _*${runtime(process.uptime())}*_\n╚════[ ᄃﾘﾑﾑ ]══════⊱\n`;

            if(isBotOwner(msg.from)) {
                client.sendMessage(msg.from, media, {
                    caption: menus + admMenu,
                });
            } else {
                client.sendMessage(msg.from, media, {
                    caption: menus,
                });
            }

            console.log(`${msg.from} Use command ${prefix}help. Status : Success`);

        } else if(msg.body.startsWith(`${prefix}sticker`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            if(!msg.hasMedia) {
                return msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`);
            }

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

            } else if (msg.type === 'video') {
                const media = await msg.downloadMedia();
                const filePath = path.join(__dirname, 'src/file/result/sticker.mp4');
            
                // Simpan media ke file sementara
                fs.writeFileSync(filePath, media.data, 'base64');

                // Periksa durasi video menggunakan ffprobe
                ffmpeg.ffprobe(filePath, (err, metadata) => {
                    if (err) {
                        console.error('Terjadi kesalahan saat mengambil metadata video:', err);
                        return fs.unlinkSync(filePath); // Hapus file sementara jika terjadi kesalahan
                    }

                    const duration = metadata.format.duration;
                    console.log(`Durasi video: ${runtime(duration)}`);

                    const media = MessageMedia.fromFilePath('src/file/result/sticker.mp4')

                    if (duration < 8) {
                        // Kirim file sebagai sticker
                        client.sendMessage(msg.from, media, {
                            sendMediaAsSticker: true,
                            stickerAuthor: "Mztay Bot",
                            stickerName: "Gweh Anime by Mastay"
                        })
                        .then(() => {
                            console.log(`${msg.from} Use command ${prefix}sticker. Status: Success`);

                            // Hapus file setelah berhasil terkirim
                            fs.unlinkSync(filePath);
                        })
                        .catch((error) => {
                            console.error('Terjadi kesalahan saat mengirim sticker:', error);
                            fs.unlinkSync(filePath); // Hapus file jika terjadi kesalahan saat mengirim
                        });
                    } else {
                        msg.reply(`Durasi maksimal adalah 7 detik.\nDurasi video ini: ${runtime(duration)}`);

                        // Hapus file sementara karena durasi terlalu panjang
                        fs.unlinkSync(filePath);
                    }
                });
            } else {
                console.log(`${msg.from} Use command ${prefix}sticker. Status : Invalid Format Type`);
                msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`)
            }
        } else if (msg.body.startsWith(`${prefix}ask`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split(" ");

            if(params.length === 1) {
                msg.reply(`Format salah, gunakan ${prefix}ask <pertanyaan>`);
                console.log(`${msg.from} Use command ${prefix}ask. Status : Invalid Parameter`);
                return;
            }

            try {
                const question = params.slice(1).join(' ');
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `${question}\n\nBot:`,
                    temperature: 0.9,
                    max_tokens: 1000,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0.6,
                    stop: ["Bot:"],
                });

                msg.reply(response.data.choices[0].text)
                console.log(`${msg.from} Use command ${prefix}ask. Status : Success`);

            } catch (err) {
                msg.reply('Terjadi kesalahan. Jika terus seperti ini silahkan hubungi developer')
                console.error(err);
            }

        } else if(msg.body.startsWith(`${prefix}cimage1`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan limit menjadi 150")
            }

            const params = msg.body.split(" ");

            if(params.length === 1) {
                console.log(`${msg.from} Use command ${prefix}cimage1. Status : Invalid Parameter`);
                return msg.reply(`Format salah, gunakan ${prefix}cimage1 <deskripsi gambar>`);
            }

            const descImage = params.slice(1).join(' ');
            const editedDesc = descImage.replace(/ /g, "%20");
            try {
                msg.reply("Mohon tunggu....\nOrang sabar disayang zeta😋");
                const responseImage = `https://daniapi.my.id/api/artificial-intelligence/stable-diffusion?text=${editedDesc}&keys=mastaycuy`;
                const media = await MessageMedia.fromUrl(responseImage, {
                    unsafeMime: true,
                });

                client.sendMessage(msg.from, media, {
                    caption: `Hasil gambar dengan deskripsi _*${descImage}*_`,
                });
                console.log(`${msg.from} Use command ${prefix}cimage1. Status : Success`);

            } catch (err) {
                msg.reply("Gagal memproses gambar, coba lagi nanti.\n _Jika masalah terus berulang silahkan hubungi Developer_");
                console.log(`${msg.from} Use command ${prefix}cimage1. Status : Error`);
                console.error(err);
            }

        } else if (msg.body.startsWith(`${prefix}menfes`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split("|");

            if (params.length !== 4) {
                console.log(`${msg.from} Use command ${prefix}menfes. Status : Invalid Parameter`);
                msg.reply(`Format salah, gunakan ${prefix}menfes|<nomor telepon>|<nama pengirim>|<pesan>`);
                return;
            }
            
            const isRegisteredNumber = await client.isRegisteredUser(params[1].trim());

            if(!isRegisteredNumber) {
                return msg.reply("Nomor tidak terdaftar di whatsapp. Pastikan kamu menulis nomor dengan benar\nContoh : 6285643094917");
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
        } else if (msg.body.startsWith('!tiktok')) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split(" ");
            if (params.length !== 3) {
                console.log(`${msg.from} Use command ${prefix}tiktok. Status : Invalid Parameter`);
                msg.reply(`Gunakan *${prefix}tiktok <type> <url>*.\n_type = video | audio_`);
                return;
            }
            
            const type = params[1].trim().toLowerCase();
            const url = params[2].trim();

            
            switch(type) {
                case 'video':
                case 'audio':
                    try {
                        msg.reply("Mohon tunggu....\nOrang sabar disayang zeta😋");
                        const downloadUrl = await script.tiktokDownloader(url, type);
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
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split(" ");

            if (params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}ytmp3. Status: Invalid Parameter`);
                return msg.reply(`Format salah, gunakan ${prefix}ytmp3 <url youtube>`);
            }

            msg.reply("Mohon tunggu....\nOrang sabar disayang zeta😋")

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
        } else if (msg.body.startsWith(`${prefix}urlshort`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split(" ");

            if (params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}urlshort. Status: Invalid parameters`);
                return msg.reply(`Gunakan ${prefix}urlshort <url>!`);
            }

            const url = params[1].trim();

            try {
                const shortenedUrl = await script.urlShortener(url);
                if (shortenedUrl) {
                    msg.reply(`Berhasil membuat link yang sudah dipendekkan\n${shortenedUrl}`);
                    console.log(`${msg.from} Use command ${prefix}urlshort. Status: Success`);

                } else {
                    msg.reply("Url tidak valid atau gagal terhubung ke url")
                    console.log(`${msg.from} Use command ${prefix}urlshort. Status: Invalid URL`);
                }
            } catch (error) {
                msg.reply("Gagal mengakses API");
                console.log(`${msg.from} Use command ${prefix}urlshort. Status: Failed`, error);
            }
        } else if(msg.body.startsWith(`${prefix}mylimits`)) {
            const limit = isBotOwner(msg.from) ? "Unlimited" : getLimitInfo(msg.from);
            const maxLimit = isBotOwner(msg.from) ? "Unlimited" : limit.limit;
            const remainLimit = isBotOwner(msg.from) ? "Unlimited" : maxLimit - limit.used;
            const userStatus = isPremiumUser(msg.from) ? 'Premium User' : 'Free User';
            msg.reply(`╭┈┈┈┈┈[ *USER INFO* ]\n├ Status : _${userStatus}_\n├ Max Limit : _${maxLimit}_\n├ Sisa Limit : _${remainLimit}_\n╰┈┈┈┈┈┈┈┈┈┈┈┈\nKamu bisa membeli premium user dengan cara klik link dibawah ini\nhttps://bit.ly/3NR9bSD`);
        } else if (msg.body.startsWith(`${prefix}cimage2`)) {
            if (!isPremiumUser || !isBotOwner) {
              return msg.reply(`Fitur ini khusus pengguna premium, kamu bisa gunakan versi free user dari image generation yaitu *${prefix}cimage1*`);
            }
        
            checkLimit(msg.from);
    
            if (limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba lagi besok");
            }

            const params = msg.body.split(" ");

            if (params.length === 1) {
                return msg.reply(`Gunakan ${prefix}cimage2 <deskripsi gambar>`);
            }

            const desc = params.slice(1).join(" ");
            const result = await query({ "inputs": `${desc}` });
            fs.writeFile('./src/file/result.jpg', result, async (error) => {
                if (error) {
                    return console.error('Gagal menyimpan file:', error);
                }
                try {
                    const media = MessageMedia.fromFilePath('./src/file/result.jpg');

                    await client.sendMessage(msg.from, media, {
                      caption: `Sukses membuat gambar dengan deskripsi *${desc}*`
                    });
                    // Hapus file gambar setelah berhasil dikirim
                    fs.unlink('./src/file/result.jpg', (err) => {
                        if (err) {
                            return console.error('Gagal menghapus file:', err);
                        }
                    });
                    console.log(`${msg.from} Use command ${prefix}cimage2. Status: Success`);
                } catch (err) {
                    msg.reply('Gagal membuat gambar!');
                    console.log(`${msg.from} Use command ${prefix}urlshort. Status: Failed`, error);
                }
            });
        }          
        
        // -------------------------- Owner Command ------------------------
        else if (msg.body.startsWith(`${prefix}kill`)) {
            if(!isBotOwner(msg.from)) {
                return msg.reply("Hanya bisa digunakan oleh admin")
            }
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
        } else if(msg.body.startsWith(`${prefix}addowner`)) {
            if(!isBotOwner(msg.from)) {
                console.log(`${msg.from} Use command ${prefix}addowner. Status: No Permission`);
                return msg.reply("Kamu tidak memiliki izin untuk menggunakan command ini");
            }

            const params = msg.body.split(" ");

            if(params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}addowner. Status: Invalid Parameter`);
                return msg.reply(`Usage : ${prefix}addowner <phone number>`);
            } 

            const isRegisteredNumber = await client.isRegisteredUser(params[1].trim());

            if(!isRegisteredNumber) {
                return msg.reply("Nomor tidak terdaftar di whatsapp. Pastikan kamu menulis nomor dengan benar\nContoh : 6285643094917");
            }

            const number = `${params[1].trim()}@c.us`;

            addBotOwner(number);
            setDailyLimit(number, 10000000);
            msg.reply(`Berhasil menambahkan ${number} ke daftar owner`);
            client.sendMessage(number, `Selamat status anda telah diubah menjadi owner!\nSekarang kamu bisa menggunakan command khusus owner, gunakan *${prefix}menu* untuk melihat command yang tersedia.`)
            console.log(`${msg.from} Use command ${prefix}addowner. Status: Success`);

        } else if(msg.body.startsWith(`${prefix}addpremium`)) {
            if(!isBotOwner(msg.from)) {
                console.log(`${msg.from} Use command ${prefix}addowner. Status: No Permission`);
                return msg.reply("Kamu tidak memiliki izin untuk menggunakan command ini");
            }

            const params = msg.body.split(" ");

            if(params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}addpremium. Status: Invalid Parameter`);
                return msg.reply(`Usage : ${prefix}addpremium <phone number>`);
            } 

            const isRegisteredNumber = await client.isRegisteredUser(params[1].trim());

            if(!isRegisteredNumber) {
                return msg.reply("Nomor tidak terdaftar di whatsapp. Pastikan kamu menulis nomor dengan benar\nContoh : 6285643094917");
            }

            const number = `${params[1].trim()}@c.us`;

            addPremiumUser(number);
            setDailyLimit(number, 10000000);
            msg.reply(`Berhasil menambahkan ${number} ke daftar premium`);
            client.sendMessage(number, "Selamat status premium user anda sudah aktif!\nSekarang kamu bisa menggunakan command bot ini tanpa batas");
            console.log(`${msg.from} Use command ${prefix}addpremium. Status: Success`);

        } else if (msg.body.startsWith(`${prefix}changeprefix`)) {
            const params = msg.body.split(" ");
        
            if (params.length !== 2) {
                return msg.reply(`Gunakan ${prefix}changeprefix <prefix>\nprefix list : !, #, /, $`);
            }
        
            const newPrefix = params[1].trim();
        
            if (prefixList.includes(newPrefix)) {
                prefix = newPrefix;
                return msg.reply(`Prefix berhasil diganti menjadi ${newPrefix}`);
            } else {
                return msg.reply(`Gunakan prefix dari list dibawah\nprefix list : !, #, /, $`);
            }
        } else {
            msg.reply(`Command _*${msg.body}*_ tidak tersedia, silahkan gunakan _*${prefix}help*_ atau _*${prefix}menu*_ untuk melihat semua command yang tersedia!`);
        }
    } catch (err) {
        console.error(err);
        client.sendMessage(msg.from, "Ada kesalahan dalam script bot. Silahkan hubungi developer!")
    }
});

client.initialize();

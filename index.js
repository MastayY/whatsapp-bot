const { Client, LocalAuth, MessageMedia, Contact, MessageTypes } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");
const script = require("./src/file/script.js")
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ytmp3 = require('ytmp3-scrap');
const ffmpeg = require('fluent-ffmpeg');
const config = require('./config.js');
const { Acrcloud } = require('./lib/classes.js');
const { runtime, query, tanggal, getGreeting, downloadYtVideo, textToSpeech, threadsPublishText, identifyUrl, threadsPublishImage, recentEarthquake, downloadImage, deleteFile } = require('./lib/function.js');
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
    getOwnerLists,
    getPremiumUsers,
    saveMessage,
    deleteMessage,
    isRecipientExists,
    isRecipientInactive,
    getMessage,
    getRecipient,
    setupNewUser,
    addCoins,
    getUserCoins,
    isMUserExist,
    getUserMId,
    minusCoins,
    getMUsername
} = require('./lib/db.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // headless: true,
        // args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    }
});

const configuration = new Configuration({
    apiKey: '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',
    // apiKey: process.env.GPT_API_KEY
});
const openai = new OpenAIApi(configuration);

const prefixList = ["/", "!", "#", "$", "noprefix"];
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

        } else if(msg.body.toLocaleLowerCase() === `${prefix}menu`){
            checkLimit(msg.from);

            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const limit = isBotOwner(msg.from) ? "Unlimited" : getLimitInfo(msg.from);
            const maxLimit = isBotOwner(msg.from) ? "Unlimited" : limit.limit;
            const remainLimit = isBotOwner(msg.from) ? "Unlimited" : maxLimit - limit.used;
            const userStatus = isPremiumUser(msg.from) ? 'Premium User' : 'Free User';
            const pushName = await msg.getContact();

            const headerMenu = `\n*Hai kak ${getGreeting()}👋*. Namaku *${config.BOT_NAME}*\n\n*ıllıllı ʏᴏᴜʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ ıllıllı*\n\n*❏ Nama :* ${pushName.pushname}\n*❏ Status :* ${userStatus}\n*❏ Max Limit :* ${maxLimit}\n*❏ Remain Limit :* ${remainLimit}\n\n_Kamu bisa membeli premium user dengan cara klik link ini https://bit.ly/3NR9bSD_\n\n*ıllıllı ʙᴏᴛ ɪɴғᴏ ıllıllı*\n\n*❏ Bot Name :* ${config.BOT_NAME}\n*❏ Bot Version :* ${config.BOT_VER}\n*❏ Current Prefix :* " ${prefix} "\n*❏ Bot Owner :* ${config.BOT_OWNER}\n*❏ Runtime :* ${runtime(process.uptime())}\n\n*LISTMENU BOT*\n☞ ${prefix}allmenu\n☞ ${prefix}donatemenu [SOON]\n☞ ${prefix}minigames [DEV]\n`

            client.sendMessage(msg.from, media, {
                caption: headerMenu,
            });

        } else if(msg.body.toLowerCase() === `${prefix}allmenu`) {
            checkLimit(msg.from);

            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const pushName = await msg.getContact();
            const rawDateTime = new Date();
            const dateTime = tanggal(rawDateTime);
            const params = dateTime.split(", ");
            const currentTime = new Date().toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');

            const baseMenu = `\n╔═══《 *𝕊𝕆𝕊𝕄𝔼𝔻* 》═══⊱\n╠➤ Instagram   : ${config.ig}\n╠➤ Youtube     : ${config.yt}\n╠➤ Github      : ${config.github}\n╠➤ Twitter     : ${config.twitter}\n╚═════════════⊱\n╔══《 *𝔸𝕃𝕃𝕄𝔼ℕ𝕌* 》══⊱\n╠➤ ${prefix}halo\n╠➤ ${prefix}menu\n╠➤ ${prefix}sticker\n╠➤ ${prefix}ask\n╠➤ ${prefix}menfes\n╠➤ ${prefix}cimage1\n╠➤ ${prefix}cimage2 (premium user)\n╠➤ ${prefix}text2speech\n╠➤ ${prefix}resendto\n╠➤ ${prefix}recognize\n╠➤ ${prefix}gempa\n╚═════════════⊱\n╔══《 *𝔻𝕆𝕎ℕ𝕃𝕆𝔸𝔻𝔼ℝ* 》══⊱\n╠➤ ${prefix}tiktok\n╠➤ ${prefix}ytmp3\n╠➤ ${prefix}ytmp4\n╠➤ ${prefix}urlshort\n╚═════════════⊱`;

            const admMenu = `\n╔═══《 *𝕆𝕎ℕ𝔼ℝ* 》════⊱\n╠➤ ${prefix}addowner\n╠➤ ${prefix}addpremium\n╠➤ ${prefix}removepremium\n╠➤ ${prefix}listowner\n╠➤ ${prefix}listpremium\n╠➤ ${prefix}kill\n╠➤ ${prefix}changeprefix\n╚═════════════⊱`

            const menus = `*Hai kak _${pushName.pushname}_, ${getGreeting()}👋*.\n\n*❏ Hari :* ${params[0].trim()}\n*❏ Tanggal :* ${params[1].trim()}\n*❏ Jam :* ${currentTime}\n\n${baseMenu}`;

            if(isBotOwner(msg.from)) {
                client.sendMessage(msg.from, media, {
                    caption: menus + admMenu,
                });
            } else {
                client.sendMessage(msg.from, media, {
                    caption: menus,
                });
            }

            console.log(`${msg.from} Use command ${prefix}allmenu. Status : Success`);

        } else if(msg.body.startsWith(`${prefix}sticker`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            if(!msg.hasMedia) {
                return msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`);
            }

            msg.react("🔄️");

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
                msg.react("✅");
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
                            stickerAuthor: "Mastay",
                            stickerName: `*${config.BOT_NAME} | ${config.BOT_VER}*`,
                        })
                        .then(() => {
                            console.log(`${msg.from} Use command ${prefix}sticker. Status: Success`);
                            msg.react("✅");
                            // Hapus file setelah berhasil terkirim
                            fs.unlinkSync(filePath);
                        })
                        .catch((error) => {
                            msg.react("❌");
                            console.error('Terjadi kesalahan saat mengirim sticker:', error);
                            fs.unlinkSync(filePath); // Hapus file jika terjadi kesalahan saat mengirim
                        });
                    } else {
                        msg.reply(`Durasi maksimal adalah 7 detik.\nDurasi video ini: ${runtime(duration)}`);
                        msg.react("❌");
                        // Hapus file sementara karena durasi terlalu panjang
                        fs.unlinkSync(filePath);
                    }
                });
            } else {
                console.log(`${msg.from} Use command ${prefix}sticker. Status : Invalid Format Type`);
                msg.reply(`Format salah, pastikan kamu mengirim gambar dengan caption ${prefix}sticker.`)
                msg.react("❌");
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

            msg.react("🔄️");

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
                msg.react("✅");
                console.log(`${msg.from} Use command ${prefix}ask. Status : Success`);

            } catch (err) {
                msg.react("❌");
                msg.reply('Terjadi kesalahan. Jika terus seperti ini silahkan hubungi developer')
                console.error(err);
            }

        } else if(msg.body.startsWith(`${prefix}text2speech`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan limit menjadi 150")
            }

            const params = msg.body.split(" ");

            if(params.length === 2) {
                console.log(`${msg.from} Use command ${prefix}text2speech. Status : Invalid Parameter`);
                return msg.reply(`Format salah, gunakan ${prefix}text2speech <teks>`);
            }

            msg.react("🔄️");

            const text = params.slice(1).join(" ");
            try {
                const downloadUrl = await textToSpeech(text);
                const result = await MessageMedia.fromUrl(downloadUrl.sound_url, {
                    unsafeMime: true
                });

                client.sendMessage(msg.from, result, {
                    sendAudioAsVoice: true,
                })
                msg.react("✅");
            } catch (err) {
                msg.react("❌");
                msg.reply("Terjadi Kesalahan")
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

            msg.react("🔄️");

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
                msg.react("✅");
                console.log(`${msg.from} Use command ${prefix}cimage1. Status : Success`);

            } catch (err) {
                msg.react("❌");
                msg.reply("Gagal memproses gambar, coba lagi nanti.\n _Jika masalah terus berulang silahkan hubungi Developer_");
                console.log(`${msg.from} Use command ${prefix}cimage1. Status : Error`);
                console.error(err);
            }

        } else if(msg.body.startsWith(`${prefix}resendto`)) {
            if(!msg.hasQuotedMsg) {
                return msg.reply(`Gunakan ${prefix}resendto <nomor telepon>.\n Pastikan pesan yang akan di kirim ulang di reply.`);
            }

            const params = msg.body.split(" ");

            if(params.length !== 2) {
                return msg.reply(`Gunakan ${prefix}resendto <nomor telepon>.\n Pastikan pesan yang akan di kirim ulang di reply.`);
            }

            const isRegisteredNumber = await client.isRegisteredUser(params[1].trim());

            if(!isRegisteredNumber) {
                return msg.reply("Nomor tidak terdaftar di whatsapp. Pastikan kamu menulis nomor dengan benar\nContoh : 6285643094917");
            }

            msg.react("🔄️");

            const number = `${params[1].trim()}@c.us`;
            const pushName = await msg.getContact();
            const quotedMsg = await msg.getQuotedMessage();

            if (quotedMsg.type === "chat") {
                // Mengirim ulang pesan teks
                client.sendMessage(number, quotedMsg.body);
                msg.reply("Berhasil terkirim.");
                msg.react("✅");
            } else if (quotedMsg.hasMedia) {
                // Mengirim ulang media (gambar, video, dll.)
                const media = await quotedMsg.downloadMedia();
                const mediaCaptions = quotedMsg.caption || "";
                client.sendMessage(number, media, {
                    caption: mediaCaptions,
                    sendAudioAsVoice: true
                });
                msg.react("✅");
                msg.reply("Berhasil terkirim.");
            } else {
                // Pesan tidak didukung untuk dikirim ulang
                msg.react("❌");
                return msg.reply("Jenis pesan ini tidak dapat dikirim ulang.");
            }

            client.sendMessage(number, `Hai, kamu dapet pesan kiriman dari ${pushName.pushname}`);

        } else if (msg.body.startsWith(`${prefix}menfes`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split("|");

            if (params.length !== 3) {
                console.log(`${msg.from} Use command ${prefix}menfes. Status : Invalid Parameter`);
                msg.reply(`Format salah, gunakan ${prefix}menfes|nomor telepon|pesan`);
                return;
            }
            
            const isRegisteredNumber = await client.isRegisteredUser(params[1].trim());

            if(!isRegisteredNumber) {
                return msg.reply("Nomor tidak terdaftar di whatsapp. Pastikan kamu menulis nomor dengan benar\nContoh : 6285643094917");
            }
            
            const targetNumber = `${params[1].trim()}@c.us`;
            const message = params[2].trim();

            const formatedMessage = `Hai, aku *${config.BOT_NAME}*\nada pesan nih buat kamu\n\nıllıllııllıllııllı *ℙ𝔼𝕊𝔸ℕ* ıllııllıllııllıllı\n\n*Dari :* _*Secret😜*_\n*Pesan :*\n☞ ${message}\n\n_Kamu bisa membalas pesan ini dengan cara *${prefix}balasmenfes pesan*_`;

            await client.sendMessage(targetNumber, formatedMessage) .then(() => {
                msg.react("✅");
                msg.reply("Pesan berhasil terkirim");
                console.log(`${msg.from} Use command ${prefix}menfes. Status : Success`);
                saveMessage(msg.from, targetNumber, message);

            }) .catch((err) => {
                msg.react("❌");
                msg.reply('Pesan gagal terkirim, silahkan kontak developer untuk melapor');
                console.log(err);
            });
        } else if (msg.body.startsWith(`${prefix}balasmenfes`)) {
            const params = msg.body.split(" ");
            if (params.length < 2) {
                msg.reply(`Format salah, gunakan ${prefix}balasmenfes pesan`);
                return;
            }
        
            const replyMsg = params.slice(1).join(" ");
        
            // Mencari penerima pesan berdasarkan pengirim
            const recipient = await getRecipient(msg.from)
        
            if (!recipient) {
                msg.reply("Tidak ada pesan yang perlu dibalas");
                return;
            }

            const message = await getMessage(msg.from)
        
            // Mengirim balasan ke penerima pesan
            const replyMessage = `Hai👋\n*ada pesan balasan nih buat kamu*\n\nıllıllııllıllııllı *ℙ𝔼𝕊𝔸ℕ* ıllıllııllıllııllı\n\n*Pesanmu :*\n☞ _${message}_\n*Pesan Balasan :*\n☞ ${replyMsg}\n`;
            client.sendMessage(recipient, replyMessage)
            .then(() => {
                msg.reply("Balasan berhasil terkirim");
                msg.react("✅")
                console.log(`${msg.from} Use command ${prefix}balasmenfes. Status : Success`);
    
                // Menghapus pesan dan penerima pesan dari database
                deleteMessage(recipient);
            })
            .catch((err) => {
                msg.reply("Gagal mengirim balasan");
                msg.reply("❌")
                console.log(err);
            });
        } else if (msg.body.startsWith(`${prefix}tiktok`)) {
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
            
            msg.react("🔄️");
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
                        msg.react("✅")

                    } catch (error) {
                        console.error(error);
                        msg.reply('Gagal mengunduh video TikTok, Pastikan link yang anda masukkan benar. Jika dirasa sudah benar berarti terdapat kesalahan dalam script bot.');
                        msg.react("❌")
                    }

                    break;
                default:
                    msg.react("❌")
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
        } else if(msg.body.startsWith(`${prefix}ytmp4`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }

            const params = msg.body.split(" ");

            if (params.length !== 2) {
                console.log(`${msg.from} Use command ${prefix}ytmp4. Status: Invalid Parameter`);
                return msg.reply(`Format salah, gunakan ${prefix}ytmp4 <url youtube>`);
            }

            msg.reply("Mohon tunggu....\nOrang sabar disayang zeta😋")

            const url = params[1].trim();
            const downloadUrl = await downloadYtVideo(url);
            const media = await MessageMedia.fromUrl(downloadUrl.url, {
                unsafeMime: true
            });

            client.sendMessage(msg.from, media, {
                caption: `Sukses mendownload video berjudul *${downloadUrl.title}* dari channel *${downloadUrl.channel}*`
            })
            
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

            msg?.react('🔄')

            const desc = params.slice(1).join(" ");
            const result = await query({ "inputs": `${desc}` });
            msg.reply("Mohon tunggu....\nOrang sabar disayang zeta😋");
            fs.writeFile('./src/file/result.jpg', result, async (error) => {
                if (error) {
                    return console.error('Gagal menyimpan file:', error);
                }
                try {
                    const media = MessageMedia.fromFilePath('./src/file/result.jpg');

                    await client.sendMessage(msg.from, media, {
                      caption: `Sukses membuat gambar dengan deskripsi *${desc}*\n`
                    });
                    msg?.react('✅')
                    // Hapus file gambar setelah berhasil dikirim
                    fs.unlink('./src/file/result.jpg', (err) => {
                        if (err) {
                            return console.error('Gagal menghapus file:', err);
                        }
                    });
                    console.log(`${msg.from} Use command ${prefix}cimage2. Status: Success`);
                } catch (err) {
                    msg.reply('Gagal membuat gambar!');
                    msg?.react('❌')
                    console.log(`${msg.from} Use command ${prefix}cimage2. Status: Failed`, error);
                }
            });
        } else if (msg.body.startsWith(`${prefix}recognize`)) {
            checkLimit(msg.from);

            if(limitreached) {
                return msg.reply("Limit harian sudah terpenuhi. Silahkan coba besok lagi atau kamu bisa membeli premium user dan mendapat unlimited limit hanya dengan 10k")
            }
            
            const types = [MessageTypes.AUDIO, MessageTypes.VIDEO, MessageTypes.VOICE]

            const acr = new Acrcloud({
                host: config.ACR_HOST,
                accessKey: config.ACR_KEY,
                accessSecret: config.ACR_SECRET_KEY,
            })

            msg?.react('🔄')

            try {
                if (msg?.hasMedia && types.includes(msg.type)) {
                    const media = await msg.downloadMedia()

                    const res = await acr.recognize(media)
                    
                    console.log(res);
                    msg.reply(`*RESULT🎵*\n\n- Title : *${res.title}*\n- Artist : *${res.artist}*\n- Label : *${res.label}*`);

                    msg.react('🥳')

                    return
                }

                else if (msg?.hasQuotedMsg) {
                    const quotedMsg = await msg.getQuotedMessage()

                    if (quotedMsg?.hasMedia && types.includes(quotedMsg.type)) {
                        const media = await quotedMsg.downloadMedia()

                        const res = await acr.recognize(media)

                        console.log(res);
                        msg.reply(`*RESULT🎵*\n\n- Title : *${res.title}*\n- Artist : *${res.artist}*\n- Label : *${res.label}*`);

                        msg.react('🥳')
                    }
                }

                else {
                    msg?.react('❌');
                    msg.reply(`Gunakan *${prefix}recognize* dengan mereply pesan yang mengandung lagu`)
                }
            } catch (error) {
                msg?.react('❌')
                msg.reply(`*RESULT🎵*\n\n *No Result*\n_Tidak bisa mendeteksi lagu_🥲`);
                console.log("Error: " + error)
            };
        } else if(msg.body.startsWith(`${prefix}gempa`)) {
            checkLimit(msg.from);
            const imageFilePath = path.join(__dirname, './src/file/result/', 'shakemap.jpg');
            msg.react("🔄️")

            try {
                const result = await recentEarthquake();
                const shakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${result.Shakemap}`
                await downloadImage(shakemapUrl, imageFilePath);
                const shakemapImg = MessageMedia.fromFilePath(imageFilePath)
                const captions = `\nıllıllı ɢᴇᴍᴘᴀ ᴛᴇʀᴋɪɴɪ ıllıllı\n\n*❏ Tanggal :* ${result.Tanggal}\n*❏ Jam :* ${result.Jam}\n*❏ Kordinat :* ${result.Coordinates}\n*❏ Lintang:* ${result.Lintang}\n*❏ Bujur :* ${result.Bujur}\n*❏ Magnitude :* ${result.Magnitude}\n*❏ Kedalaman :* ${result.Kedalaman}\n*❏ Wilayah :* ${result.Wilayah}\n*❏ Potensi :* ${result.Potensi}\n\n_Source : BMKG_\n`

                client.sendMessage(msg.from, shakemapImg, {
                    caption: captions
                }) .then((res) => {
                    deleteFile(imageFilePath);
                    msg.react("✅")
                }) .catch((err) => {
                    deleteFile(imageFilePath);
                    console.log(err)
                })
            } catch (err) {
                msg.reply("Kesalahan!")
                msg.react("❌")
                console.log("Error : ", err)
            }
        }


        // ============================== MINIGAMES SECTION ============================
        else if(msg.body.startsWith(`${prefix}minigames`)) {
            if(!isMUserExist(msg.from)) {
                return msg.reply("Kamu belum mendaftarkan diri sebagai MUser!\nGunakan *!register username* untuk mendaftar sebagai MUser")
            }

            const userCoins = getUserCoins(msg.from)
            const username = getMUsername(msg.from)
            msg.reply(`\nıllııllıllı ᴘʀᴏғɪʟᴇ ɪɴғᴏ ıllıllııllı\n\n*❏ Username :* ${username}\n*❏ MCash :* ${userCoins}\n\n*MINIGAMES LIST*\n*☞ ${prefix}cointoss*\n`)
        } else if(msg.body.startsWith(`${prefix}register`)) {
            const params = msg.body.split(" ")

            if(params.length !== 2) {
                return msg.reply(`Gunakan *${prefix}register username*\n Username tidak boleh ada spasi dan tidak boleh lebih dari 10 karakter`);
            }

            const username = params[1].trim()

            if(username.length > 10) {
                return msg.reply(`Gunakan *${prefix}register username*\n Username tidak boleh ada spasi dan tidak boleh lebih dari 10 karakter`);
            }

            setupNewUser(msg.from, username);
            msg.reply(`Sukses mendaftarkan ${username} sebagai MUser`);
        } else if (msg.body.startsWith(`${prefix}addcoin`)) {
            const params = msg.body.split(" ");
        
            if (params.length !== 3) {
                return msg.reply("Jumlah parameter tidak tepat. Format: !addcoin [nama pengguna] [jumlah koin]");
            } else if (!isMUserExist(params[1].trim())) {
                return msg.reply("Pengguna tidak ditemukan.");
            } 

            const coin = parseInt(params[2].trim());
            if (isNaN(coin)) {
                return msg.reply("Jumlah koin harus berupa angka.");
            }

            // Mengurangi koin jika input bernilai negatif
            const MId = getUserMId(params[1].trim())
            if (coin < 0) {
                const currentCoins = getUserCoins(MId);
                if (currentCoins < Math.abs(coin)) {
                    return msg.reply("Jumlah koin tidak mencukupi.");
                }
                minusCoins(MId, Math.abs(coin));
                    msg.reply("MCash berhasil dikurangi.");
            } else {
                addCoins(MId, coin);
                msg.reply("MCash berhasil ditambahkan.");
            }
        } else if(msg.body.startsWith(`${prefix}cointoss`)) {
            if(!isMUserExist(msg.from)) {
                return msg.reply("Kamu belum mendaftarkan diri sebagai MUser!\nGunakan *!register username* untuk mendaftar sebagai MUser")
            }

            const params = msg.body.split(" ")

            if(params.length !== 3) {
                return msg.reply(`Gunakan *${prefix}coinstoss (gambar/angka) (jumlah taruhan)*`);
            } else if(params[1].trim().toLowerCase() !== 'gambar' && params[1].trim().toLowerCase() !== 'angka') {
                return msg.reply(`Silahkan bertaruh antara *angka* atau *gambar*`);
            } 
            
            const betAmount = parseInt(params[2].trim());
            if(isNaN(betAmount)) {
                return msg.reply(`Jumlah taruhan haruslah angka`);
            } else if(getUserCoins(msg.from) < betAmount) {
                return msg.reply(`Kamu tidak memiliki MCash sebanyak itu`);
            }

            const betTo = params[1].trim().toLowerCase();
            let betResult = Math.random()

            if(betResult >= 0 && betResult < 0.5){
                betResult = 'angka'
            } else if(betResult >= 0.5) {
                betResult = 'gambar'
            }

            const username = getMUsername(msg.from)

            if(betTo === betResult) {
                client.sendMessage(msg.from, `*${username}* melakukan taruhan\n\n*☞ Bertaruh ke :* ${betTo}\n*☞ Jumlah taruhan :* 💵 ${betAmount} MCash\n\n_Koin Berputar......_\n\n${username} memenangkan *💵 ${betAmount * 2}* MCash`)
                addCoins(msg.from, betAmount)
            } else {
                client.sendMessage(msg.from, `*${username}* melakukan taruhan\n\n*☞ Bertaruh ke :* ${betTo}\n*☞ Jumlah taruhan :* 💵 ${betAmount} MCash\n\n_Koin Berputar......_\n\n${username} kehilangan *💵 ${betAmount}* MCash`)
                minusCoins(msg.from, betAmount)
            }
        }
        
        
        // ================================ Admin Command ========================================
        else if (msg.body.startsWith(`${prefix}kill`)) {
            if(!isBotOwner(msg.from)) {
                return msg.reply("Hanya bisa digunakan oleh admin")
            }
            // Perbarui status ke offline
            msg.react("✅");
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
            msg.react("✅");
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
            msg.react("✅");
            console.log(`${msg.from} Use command ${prefix}addpremium. Status: Success`);

        } else if (msg.body.startsWith(`${prefix}changeprefix`)) {
            if(!isBotOwner(msg.from)) {
                console.log(`${msg.from} Use command ${prefix}changeprefix. Status: No Permission`);
                return msg.reply("Kamu tidak memiliki izin untuk menggunakan command ini");
            }
            const params = msg.body.split(" ");
        
            if (params.length !== 2) {
                return msg.reply(`Gunakan ${prefix}changeprefix <prefix>\nprefix list : !, #, /, $, noprefix`);
            }

            msg.react("🔄️");
        
            const newPrefix = params[1].trim();
        
            if (prefixList.includes(newPrefix)) {
                if(newPrefix === 'noprefix') {
                    prefix = ''
                } else {
                    prefix = newPrefix;
                }
                msg.react("✅");
                return msg.reply(`Prefix berhasil diganti menjadi ${newPrefix}`);
            } else {
                msg.react("❌");
                return msg.reply(`Gunakan prefix dari list dibawah\nprefix list : !, #, /, $`);
            }
        } else if(msg.body.startsWith(`${prefix}listpremium`)) {
            if(!isBotOwner(msg.from)) {
                console.log(`${msg.from} Use command ${prefix}listpremium. Status: No Permission`);
                return msg.reply("Kamu tidak memiliki izin untuk menggunakan command ini");
            }

            const rawData = getPremiumUsers();
            let premUsers = "";

            for (let i = 0; i < rawData.length; i++) {
                const params = rawData[i].split("@");
                const number = params[0].trim();
                premUsers += `\n↦ ${number}`
            }

            msg.reply(`*ıllıllı ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ ıllıllı*\n${premUsers}`);
        } else if (msg.body.startsWith(`${prefix}removepremium`)) {
            const params = msg.body.split(" ");

            if(params.length !== 2) {
                return msg.reply(`Gunakan ${prefix}removepremium <nomor telepon>`)
            } else if(!isPremiumUser(`${params[1].trim()}@c.us`)) {
                return msg.reply(`Nomor ${params[1].trim()} bukan premium user`)
            }

            removePremiumUser(`${params[1].trim()}@c.us`);
        } else if(msg.body.startsWith(`${prefix}listowner`)) {
            if(!isBotOwner(msg.from)) {
                console.log(`${msg.from} Use command ${prefix}listowner. Status: No Permission`);
                return msg.reply("Kamu tidak memiliki izin untuk menggunakan command ini");
            }

            const rawData = getOwnerLists();
            let ownerUsers = "";

            for (let i = 0; i < rawData.length; i++) {
                const params = rawData[i].split("@");
                const number = params[0].trim();
                ownerUsers += `\n↦ ${number}`
            }

            msg.reply(`*ıllıllı ᴏᴡɴᴇʀ ʟɪsᴛ ıllıllı*\n${ownerUsers}`);
        } else if(msg.body.startsWith(`${prefix}threads`)) {
            const params = msg.body.split(" ");

            if(params.length === 1) {
                return msg.reply(`Gunakan ${prefix}threads <teks>`)
            }

            const teks = params.splice(1).join(" ");
            const url = identifyUrl(teks);

            await threadsPublishText(teks, url) .then((res) => {
                console.log("Succes\n" + res)
            }) .catch((err) => {
                client.sendMessage(msg.from, "Kesalahan")
                console.log(err);
            });
        } else if(msg.body.startsWith(`${prefix}thrimg`)) {
            const params = msg.body.split(" ");

            if(params.length === 1) {
                return msg.reply(`Gunakan ${prefix}threads <teks>`)
            }

            const teks = params.splice(1).join(" ");
            const img = identifyUrl(teks);
            const rawcaption = teks.split("http");
            const caption = rawcaption[0].trim();

            console.log("caption : " + caption);

            await threadsPublishImage(caption, img) .then((res) => {
                console.log("Succes\n" + res)
            }) .catch((err) => {
                client.sendMessage(msg.from, "Kesalahan")
                console.log(err)
            });
        } else {
            msg.reply(`Command _*${msg.body}*_ tidak tersedia, silahkan gunakan _*${prefix}help*_ atau _*${prefix}menu*_ untuk melihat semua command yang tersedia!`);
        }
    } catch (err) {
        console.error(err);
        client.sendMessage(msg.from, "Ada kesalahan dalam script bot. Silahkan hubungi developer!")
    }
});

client.initialize();

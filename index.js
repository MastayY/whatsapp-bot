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
});

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
            msg.reply('Halo! Apa kabar?');
        } else if(msg.body.toLowerCase() === `${prefix}menu`) {
            // Buat objek media dari URL gambar
            const media = await MessageMedia.fromUrl("https://i.imgur.com/nFsn61p.png");
            const menus = `|------ [ *INFO* ] ------|\n*Bot Name\t:* _${config.BOT_NAME}_\n*Bot Version\t:* _${config.BOT_VER}_\n*Bot Prefix\t:* _"${prefix}"_\n*Bot Owner\t:* _${config.BOT_OWNER}_\n------------------------\n\n|====== [ *MENU* ] ======|\n=> _${prefix}halo_\n=> _${prefix}menu_\n=> _${prefix}sticker_\n`

            client.sendMessage(msg.from, media, {
                caption: menus,
            });
        } else if(msg.body.startsWith(`${prefix}sticker`) && msg.type === 'image') {
            const media = await msg.downloadMedia() .catch((err) => {
                console.error(err);
                client.sendMessage("Error downloading media");
            });

            client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true,
                stickerAuthor: "Mztay Bot",
                stickerName: "Gweh Anime by Mastay",
            });

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
        }
    } catch (err) {
        console.error(err);
    }
});

client.initialize();

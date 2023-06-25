const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});
 

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
        if (msg.body === `${prefix}halo`) {
            msg.reply('Halo! Apa kabar?');
        } else if(msg.body === `${prefix}button`) {
            const imageUrl = 'https://i.imgur.com/nFsn61p.png';
            // Buat objek media dari URL gambar
            const media = await MessageMedia.fromUrl(imageUrl);

            // Buat tombol dan tambahkan gambar sebagai media
            const buttons = new Buttons(media, [
            { body: 'bt1' },
            { body: 'bt2' },
            { body: 'bt3' },
            ], 'Testing', 'ingyah');

            // Kirim pesan dengan tombol dan gambar
            await client.sendMessage(msg.from, buttons)
            .then((result) => {
                console.log(result)
            });
        }
    } catch (err) {
        console.error(err);
    }
});

client.initialize();

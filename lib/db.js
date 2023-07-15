// database.js
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cron = require('node-cron');

const adapter = new FileSync('./lib/database/db.json');
const minigamesdatabase = new FileSync('./lib/database/minigames.json');
const db = low(adapter);
const minigamesDb = low(minigamesdatabase);

// Inisialisasi database dan set default value jika belum ada
db.defaults({ limits: [], premiumUsers: [], botOwners: [], messages: [], recipients: [] }).write();
minigamesDb.defaults({users: []}).write();

// Fungsi untuk mendapatkan informasi limit berdasarkan userId
function getLimitInfo(userId) {
    return db.get('limits').find({ userId }).value();
}

function getPremiumUsers() {
    return db.get('premiumUsers').value();
}
function getOwnerLists() {
    return db.get('botOwners').value();
}

// Fungsi untuk menambah penggunaan limit berdasarkan userId
function incrementLimitUsage(userId) {
    db.get('limits')
    .find({ userId })
    .update('used', (used) => used + 1)
    .write();
}

// Fungsi untuk mengatur limit harian
function setDailyLimit(userId, limit) {
    const userLimit = db.get('limits').find({ userId }).value();

    if (userLimit) {
        db.get('limits')
        .find({ userId })
        .assign({ limit, used: 0 })
        .write();
    } else {
        db.get('limits')
        .push({ userId, limit, used: 0 })
        .write();
    }
}


// Fungsi untuk menambahkan premium user
function addPremiumUser(userId) {
    db.get('premiumUsers').push(userId).write();
}

// Fungsi untuk menghapus premium user
function removePremiumUser(userId) {
    db.get('premiumUsers').remove(userId).write();
}

// Fungsi untuk menambahkan owner bot
function addBotOwner(userId) {
    db.get('botOwners').push(userId).write();
}

// Fungsi untuk menghapus owner bot
function removeBotOwner(userId) {
    db.get('botOwners').remove(userId).write();
}

function isPremiumUser(userId) {
    const premiumUsers = db.get('premiumUsers').value();
    return premiumUsers.includes(userId);
}
  // Fungsi untuk memeriksa apakah user adalah owner bot
function isBotOwner(userId) {
    const botOwner = db.get('botOwners').value();
    return botOwner.includes(userId);
}

function saveMessage (sender, recipient, message) {
    db.get('messages')
        .push({
        sender: sender,
        recipient: recipient,
        message: message,
        timestamp: Date.now()
        })
        .write();

    db.get('recipients')
        .push(recipient)
        .write();
};

async function getMessage(number) {
    const message = db
    .get("messages")
    .find({ recipient: number })
    .get("message")
    .value();
    
    if(message) {
        return message;
    } else {
        return false;
    }
}

async function getRecipient(number) {
    const recipient = db
    .get("messages")
    .find({ recipient: number })
    .get("sender")
    .value();
    
    if(recipient) {
        return recipient;
    } else {
        return false;
    }
}

    // Fungsi untuk menghapus pesan dan penerima pesan dari database
function deleteMessage (recipient) {
    db.get('messages')
        .remove({ recipient: recipient })
        .write();

    db.get('recipients')
        .remove((r) => r === recipient)
        .write();
    };

    // Fungsi untuk memeriksa apakah penerima pesan ada dalam database
function isRecipientExists (recipient) {
    const recipients = db.get('recipients').value();
    return recipients.includes(recipient);
    };

    // Fungsi untuk memeriksa apakah penerima pesan tidak membalas dalam 24 jam
function isRecipientInactive (recipient) {
    const messages = db.get('messages').value();
    const lastMessage = messages.find((m) => m.recipient === recipient);

    if (lastMessage) {
        const currentTime = Date.now();
        const timeDifference = currentTime - lastMessage.timestamp;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        return timeDifference >= twentyFourHours;
    }

    return false;
};

function addCoins(number, amount) {
    minigamesDb.get("users")
    .find({id: number})
    .update("coin", (coin) => coin + amount)
    .write()
}
function minusCoins(number, amount) {
    minigamesDb.get("users")
    .find({id: number})
    .update("coin", (coin) => coin - amount)
    .write()
}
function setupNewUser(number, username) {
    minigamesDb.get("users")
    .push({id: number, username: username, level: 1, coin: 5000})
    .write()
}
function isMUserExist(number) {
    const MUser = minigamesDb.get("users")
    .find({id: number})
    .get("username")
    .value()

    return MUser? true : false;
}
function getUserCoins(number) {
    const userCoins = minigamesDb.get("users")
    .find({id: number})
    .get("coin")
    .value()

    return userCoins;
}
function getUserMId(username) {
    const MId = minigamesDb.get("users")
    .find({username: username})
    .get("id")
    .value()

    return MId;
}
function getMUsername(number) {
    const MUsername = minigamesDb.get("users")
    .find({id: number})
    .get("username")
    .value()

    return MUsername
}


// Jalankan tugas reset limit setiap jam 12 malam waktu Jakarta (GMT+7)
cron.schedule('0 0 * * *', () => {
    // Reset semua limit harian
    db.get('limits')
        .forEach((limit) => {
        db.get('limits')
        .find({ userId: limit.userId })
        .assign({ used: 0 })
        .write();
    })
    .write();

    console.log('Daily limits have been reset.');
});

module.exports = {
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
    getUserCoins,
    setupNewUser,
    addCoins,
    isMUserExist,
    getUserMId,
    minusCoins,
    getMUsername
};

// database.js
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cron = require('node-cron');

const adapter = new FileSync('./lib/database/db.json');
const db = low(adapter);

// Inisialisasi database dan set default value jika belum ada
db.defaults({ limits: [], premiumUsers: [], botOwners: [] }).write();

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
    getPremiumUsers
};

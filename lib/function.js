const fetch = require('node-fetch');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const { ThreadsAPI } = require('threads-api');
const BMKG = require("@ernestoyoofi/bmkg-scrap");

function runtime(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " Hari, " : " Hari, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " Jam, " : " Jam, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " Menit, " : " Menit, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " Detik" : " Detik") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}


function tanggal(numer) {
	myMonths = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
	myDays = ['Minggu','Senin','Selasa','Rabu','Kamis','Jum’at','Sabtu']; 
	var tgl = new Date(numer);
	var day = tgl.getDate()
	bulan = tgl.getMonth()
	var thisDay = tgl.getDay(),
	thisDay = myDays[thisDay];
	var yy = tgl.getYear()
	var year = (yy < 1000) ? yy + 1900 : yy; 
	// const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
	let d = new Date
	// let locale = 'id'
	let gmt = new Date(0).getTime() - new Date('1 January 1970').getTime()
	// let weton = ['Pahing', 'Pon','Wage','Kliwon','Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5]
	
	return`${thisDay}, ${day} ${myMonths[bulan]} ${year}`
}

function getGreeting() {
	const currentHour = new Date().getHours();

	if (currentHour >= 0 && currentHour < 12) {
		return "Selamat pagi!";
	} else if (currentHour >= 12 && currentHour < 15) {
		return "Selamat siang!";
	} else if (currentHour >= 15 && currentHour < 18) {
		return "Selamat sore!";
	} else {
		return "Selamat malam!";
	}
}

async function downloadYtVideo(url) {
	const api = `https://daniapi.my.id/api/downloader/youtube-video?url=${url}&key=mastaycuy`

	try {
		const response = await axios.get(api);
		return response.data.data;
	} catch (err) {
		console.log("Error : ", err);
		return null;
	}
}

async function textToSpeech(text) {
	const format = text.replace(/\ /g, "%20");
	const api = `https://daniapi.my.id/api/tools/text-to-speech?text=${format}&lang=id-ID&key=mastaycuy`

	try {
		const response = await axios.get(api);
		return response.data.data;
	} catch (err) {
		console.log("Error : ", err);
		return null;
	}
}

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/cag/anything-v3-1",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.buffer();
	return result;
}

async function downloadImage (url, dest) {
	try {
		const response = await axios({
		  method: 'GET',
		  url: url,
		  responseType: 'stream'
		});
	
		response.data.pipe(fs.createWriteStream(dest));
	
		return new Promise((resolve, reject) => {
		  response.data.on('end', () => {
			resolve(dest);
		  });
	
		  response.data.on('error', (err) => {
			reject(err);
		  });
		});
	  } catch (err) {
		throw new Error(`Gagal mengunduh gambar: ${err}`);
	  }
};

function deleteFile (filePath) {
	fs.unlink(filePath, (err) => {
		if (err) {
		console.error(`Gagal menghapus file: ${err}`);
		}
	});
};

function identifyUrl(text) {
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlRegex, function(url) {
		return url;
	})
}

async function threadsPublishText(text, url) {
	const threadAPI = new ThreadsAPI({
		username: 'mastay.vr',
		password: 'muruh12345'
	});

	await threadAPI.publish({
		text: text,
		url: `${url}`
	})
}

async function threadsPublishImage(text, imgUrl) {
	const threadAPI = new ThreadsAPI({
		username: 'mastay.vr',
		password: 'muruh12345'
	});

	await threadAPI.publish({
		text: text,
		image: imgUrl
	})
}
function getRandomName(ext) {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};

function localPath(type, format) {
	const mainPath = path.dirname((require.main && require.main.filename) + '');
	return path.resolve(
	  `${mainPath}/assets/${type}/tmp/${getRandomName(`.${format}`)}`,
	);
}

function convertOggToMp3(url) {
	const filePath = path.resolve(`assets/audio/tmp/${getRandomName('.mp3')}`);
  
	return new Promise((resolve, reject) => {
	  ffmpeg(url)
		.toFormat('mp3')
		.on('end', function () {
		  fs.unlink(url, function (err) {
			if (err) {
			  reject(err);
			} else {
			  resolve(filePath);
			}
		  });
		})
		.on('error', function (err) {
		  reject(err);
		})
		.save(filePath);
	});
}

async function recentEarthquake() {
	try {
		const result = await BMKG.earthquake_now();
		return result;
	} catch (err) {
		console.log("Error : ", err);
	}
}

module.exports = {
    runtime,
	query,
	tanggal,
	getGreeting,
	downloadYtVideo,
	textToSpeech,
	threadsPublishText,
	threadsPublishImage,
	identifyUrl,
	localPath,
	convertOggToMp3,
	recentEarthquake,
	downloadImage,
	deleteFile
}
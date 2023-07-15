const { get } = require('axios');

function urlShortener(url) {
    const linkUrl = `https://daniapi.my.id/api/url-shortener/bitly?url=${url}&key=mastaycuy`;

    return get(linkUrl)
        .then(response => {
            return response.data.data.url_shortener;
        })
        .catch(error => {
            if (error.response) {
                console.log("Failed to connect to the API");
                console.log("Enter a valid URL");
            } else if (error.request) {
                console.log("Request error");
            } else {
                console.log("Error", error.message);
            }
            return null;
        });
}

function tiktokDownloader(url, type) {
    const linkUrl = `https://daniapi.my.id/api/downloader/tiktok?url=${url}&key=mastaycuy`;

    if(type === 'video') {
        type = 'video2';
    }

    return get(linkUrl)
        .then(response => {
            return response.data.data[type];
        })
        .catch(error => {
            if (error.response) {
                console.log("Failed to connect to the API");
                console.log("Enter a valid URL");
            } else if (error.request) {
                console.log("Request error");
            } else {
                console.log("Error", error.message);
            }
            return null;
        });
}

module.exports = {
    urlShortener,
    tiktokDownloader
}

const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs').promises;
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const { localPath, convertOggToMp3 } = require('./function')

const acr = {
  host: '',
  accessKey: '',
  accessSecret: '',
};


class Acrcloud {
    constructor(config) {
      const { host, accessKey, accessSecret } = config;
  
      this.host = host;
      this.access_key = accessKey;
      this.access_secret = accessSecret;
      this.dataType = 'audio';
      this.endpoint = '/v1/identify';
      this.secure = true;
      this.signature_version = '1';
    }
  
    buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
      return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
    }
  
    sign(string, accessSecret) {
      return crypto
        .createHmac('sha1', accessSecret)
        .update(Buffer.from(string, 'utf-8'))
        .digest()
        .toString('base64');
    }
  
    async identify(file) {
      const currentDate = new Date();
      const timestamp = currentDate.getTime() / 1000;
  
      const stringToSign = this.buildStringToSign(
        'POST',
        this.endpoint,
        this.access_key,
        this.dataType,
        this.signature_version,
        timestamp
      );
  
      const signature = this.sign(stringToSign, this.access_secret);
  
      const form = new FormData();
  
      form.append('sample', file);
      form.append('access_key', this.access_key);
      form.append('data_type', this.dataType);
      form.append('signature_version', this.signature_version);
      form.append('signature', signature);
      form.append('sample_bytes', 2);
      form.append('timestamp', timestamp);
  
      const { data } = await axios({
        url: `https://${this.host}${this.endpoint}`,
        method: 'POST',
        data: form.getBuffer(),
        headers: form.getHeaders(),
        
      });
  
      return data;
    }
  
    async recognize(media) {
      let audioPath = '';
  
      if (media.mimetype === 'video/mp4') {
        const path = localPath('audio', 'mp4');
  
        await fs.writeFile(path, media.data, 'base64');
  
        audioPath = await convertOggToMp3(path);
      } else {
        const path = localPath('audio', 'mp3');
  
        await fs.writeFile(path, media.data, 'base64');
  
        audioPath = path;
      }
      try {
        const fileBuffer = await fs.readFile(audioPath);
        await fs.unlink(audioPath);
    
        const response = await this.identify(fileBuffer);
        // console.log(response);
    
        if (response && response.metadata && response.metadata.music && response.metadata.music.length > 0) {
          const { music } = response.metadata;
          return {
            artist: music[0].artists.reduce((acc, cur) => acc + cur.name + ', ', '').slice(0, -2),
            title: music[0].title,
            label: music[0].label,
            link: music[0].external_metadata.youtube.vid,
          };
        } else {
          throw new Error('No music metadata found');
        }
      } catch (error) {
        console.log('Error during recognition:', error);
        throw error;
      }
    }
  }

module.exports = { Acrcloud }
  
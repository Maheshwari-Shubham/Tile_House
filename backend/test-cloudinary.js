require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  try {
    console.log('Using Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY ? '<key set>' : '<no key>');
    const res = await cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/June_odd-eyed-cat_cropped.jpg/120px-June_odd-eyed-cat_cropped.jpg', {
      folder: 'tile-house-test',
      overwrite: false,
    });
    console.log('UPLOAD SUCCESS:', res);
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
  }
})();

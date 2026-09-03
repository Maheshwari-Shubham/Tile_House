const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const axios      = require('axios');
const FormData   = require('form-data');
const auth       = require('../middleware/auth');

// Configure Cloudinary — using unsigned uploads (no API secret needed)
// Use unsigned upload: receive file in memory then POST to Cloudinary HTTP unsigned upload endpoint
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'tile_house_unsigned';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg','image/jpg','image/png','image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
    }
  },
});

// POST /api/upload — admin only, single image
router.post('/', auth, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Upload failed: ' + (err.message || err) });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Prepare unsigned upload to Cloudinary via HTTP API
    try {
      if (!CLOUD_NAME) return res.status(500).json({ error: 'Cloudinary cloud name not configured' });

      const form = new FormData();
      // Attach file buffer
      form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
      form.append('upload_preset', UPLOAD_PRESET);
      form.append('folder', 'tile-house-products');

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
      const response = await axios.post(url, form, { headers: form.getHeaders(), maxBodyLength: Infinity });

      const data = response.data;
      return res.json({ url: data.secure_url || data.url, public_id: data.public_id, width: data.width, height: data.height });
    } catch (uploadErr) {
      console.error('Unsigned upload error:', uploadErr.response?.data || uploadErr.message || uploadErr);
      return res.status(500).json({ error: 'Cloudinary upload failed', details: uploadErr.response?.data || uploadErr.message || String(uploadErr) });
    }
  });
});

// DELETE /api/upload/:public_id — admin only, delete from Cloudinary
router.delete('/:public_id', auth, async (req, res) => {
  try {
    // For now, just acknowledge the delete request (Cloudinary deletion requires API key)
    const id = decodeURIComponent(req.params.public_id);
    res.json({ message: 'Image deletion not yet implemented (requires API authentication)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/convert', upload.array('images'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      let img, dims;
      if (file.mimetype === 'image/jpeg' || file.originalname.toLowerCase().endsWith('.jpg') || file.originalname.toLowerCase().endsWith('.jpeg')) {
        img = await pdfDoc.embedJpg(file.buffer);
        dims = { width: img.width, height: img.height };
      } else if (file.mimetype === 'image/png' || file.originalname.toLowerCase().endsWith('.png')) {
        img = await pdfDoc.embedPng(file.buffer);
        dims = { width: img.width, height: img.height };
      } else {
        continue; // skip unsupported formats
      }
      const page = pdfDoc.addPage([dims.width, dims.height]);
      page.drawImage(img, { x: 0, y: 0, width: dims.width, height: dims.height });
    }
    const pdfBytes = await pdfDoc.save();
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="output.pdf"' });
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: 'Failed to convert images to PDF' });
  }
});

module.exports = router;

import './App.css'
import React, { useRef, useState } from 'react';

function App() {
  const [images, setImages] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter(f =>
      f.type === 'image/jpeg' || f.type === 'image/png' ||
      f.name.toLowerCase().endsWith('.jpg') ||
      f.name.toLowerCase().endsWith('.jpeg') ||
      f.name.toLowerCase().endsWith('.png')
    );
    setImages(prev => [...prev, ...imgs]);
  };

  const handleSelect = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setPdfUrl(null);
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    const res = await fetch('https://imagetopdf-jeq9.onrender.com/convert', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
    }
    setLoading(false);
  };

  const handleRemove = (idx: number) => {
    setImages(imgs => imgs.filter((_, i) => i !== idx));
  };

  return (
    <>
      <div className="container">
        <h1 className="main-title">JPG to PDF</h1>
        <p className="subtitle">Convert JPG images to PDF in seconds. Easily adjust orientation and margins.</p>
        <div className="upload-section">
          <button className="select-btn" onClick={handleSelect}>Select JPG images</button>
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            style={{ display: 'none' }}
            ref={inputRef}
            onChange={handleInputChange}
          />
        </div>
        <div
          className="drag-text"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ border: '2px dashed #ccc', borderRadius: 12, padding: 24, marginTop: 24, minHeight: 60 }}
        >
          or drop JPG images here
          {images.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(img)} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                  <button onClick={() => handleRemove(idx)} style={{ position: 'absolute', top: 0, right: 0, background: '#e53935', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 14, lineHeight: '22px', padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="select-btn"
          style={{ marginTop: 32, background: '#23232b', fontSize: '1.5rem', padding: '1rem 2.5rem' }}
          onClick={handleConvert}
          disabled={images.length === 0 || loading}
        >
          {loading ? 'Converting...' : 'Convert to PDF'}
        </button>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="output.pdf"
            className="select-btn"
            style={{
              marginTop: 24,
              marginBottom: 40,
              background: '#e53935',
              fontSize: '1.5rem',
              padding: '1rem 2.5rem',
              display: 'block',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              borderRadius: 20,
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 16px rgba(229,57,53,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Download PDF
          </a>
        )}
      </div>
      <footer className="footer">
        © 2024 ImagePDF Converter. Built for fast, secure, and private JPG/PNG to PDF conversion. No files are stored. Made with ❤️.
      </footer>
    </>
  );
}

export default App;

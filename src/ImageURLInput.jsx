import React, { useState, useRef } from 'react';
import './ImageURLInput.css';

const compressImage = (file) => new Promise((resolve) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const maxW = 1200;
    const scale = img.width > maxW ? maxW / img.width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.75);
  };
  img.src = url;
});

const ImageUrlInput = ({ imageUrls, setImageUrls, deleteImageUrl, onUploadingChange }) => {
  const [uploads, setUploads] = useState(() =>
    (imageUrls || []).map((url, i) => ({
      key: i + '_existing',
      name: url.split('/').pop().split('?')[0] || `photo-${i + 1}`,
      url,
      status: 'done',
      progress: 100,
    }))
  );
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const xhrRefs = useRef({});

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    event.target.value = '';

    for (const file of files) {
      const uploadKey = Date.now() + Math.random();
      const fileName = file.name;

      setUploads(prev => [...prev, { key: uploadKey, name: fileName, url: null, progress: 0, status: 'compressing' }]);
      onUploadingChange?.(1);

      const compressed = await compressImage(file);
      setUploads(prev => prev.map(u => u.key === uploadKey ? { ...u, status: 'uploading' } : u));

      const formData = new FormData();
      formData.append('file', compressed, fileName);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();
      xhrRefs.current[uploadKey] = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads(prev => prev.map(u => u.key === uploadKey ? { ...u, progress } : u));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const downloadURL = data.secure_url;
          setImageUrls(prev => [...prev, downloadURL]);
          setUploads(prev => prev.map(u => u.key === uploadKey ? { ...u, url: downloadURL, status: 'done', progress: 100 } : u));
        } else {
          setUploads(prev => prev.map(u => u.key === uploadKey ? { ...u, status: 'error' } : u));
        }
        onUploadingChange?.(-1);
        delete xhrRefs.current[uploadKey];
      };

      xhr.onerror = () => {
        setUploads(prev => prev.map(u => u.key === uploadKey ? { ...u, status: 'error' } : u));
        onUploadingChange?.(-1);
        delete xhrRefs.current[uploadKey];
      };

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    }
  };

  const handleAddUrl = () => {
    setUrlError('');
    const val = urlInput.trim();
    if (!val) { setUrlError('Please enter a URL.'); return; }
    try { new URL(val); } catch { setUrlError('Please enter a valid URL.'); return; }
    if (!val.match(/\.(jpg|jpeg|png|webp|gif|avif)/i) &&
        !val.includes('cloudinary') && !val.includes('googleusercontent') &&
        !val.includes('firebasestorage') && !val.includes('591.com') &&
        !val.includes('unsplash.com') && !val.includes('images.')) {
      setUrlError('URL does not appear to be an image.');
      return;
    }
    const urlKey = Date.now() + Math.random();
    const name = val.split('/').pop().split('?')[0] || 'image';
    setUploads(prev => [...prev, { key: urlKey, name, url: val, status: 'done', progress: 100 }]);
    setImageUrls(prev => [...prev, val]);
    setUrlInput('');
  };

  const handleCancel = (uploadKey) => {
    xhrRefs.current[uploadKey]?.abort();
    delete xhrRefs.current[uploadKey];
    setUploads(prev => prev.filter(u => u.key !== uploadKey));
    onUploadingChange?.(-1);
  };

  const handleDelete = (upload, listIndex) => {
    const urlIndex = imageUrls.indexOf(upload.url);
    if (urlIndex !== -1) deleteImageUrl(urlIndex);
    setUploads(prev => prev.filter((_, i) => i !== listIndex));
  };

  const statusLabel = (upload) => {
    if (upload.status === 'compressing') return 'Compressing...';
    if (upload.status === 'uploading') return `Uploading ${upload.progress}%`;
    if (upload.status === 'error') return 'Failed — try again';
    return null;
  };

  return (
    <div className="image-upload-wrap">
      <div className="image-upload-btns">
        <label className="image-upload-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
          <input type="file" multiple hidden onChange={handleUpload} accept="image/*" />
        </label>

        <button
          type="button"
          className={`image-upload-btn url-btn${showUrlInput ? ' active' : ''}`}
          onClick={() => { setShowUrlInput(!showUrlInput); setUrlError(''); setUrlInput(''); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Paste URL
        </button>
      </div>

      {showUrlInput && (
        <div className="url-input-row">
          <input
            type="url"
            className={`url-input-field${urlError ? ' error' : ''}`}
            placeholder="https://example.com/photo.jpg"
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
          />
          <button type="button" className="url-add-btn" onClick={handleAddUrl}>Add</button>
        </div>
      )}
      {urlError && <p className="url-error-text">{urlError}</p>}

      {uploads.length > 0 && (
        <div className="image-file-list">
          {uploads.map((upload, index) => (
            <div key={upload.key} className={`image-file-item ${upload.status}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                style={{ flexShrink: 0, color: upload.status === 'done' ? 'var(--teal)' : 'var(--text-muted)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <div className="image-file-info">
                {upload.status === 'done'
                  ? <a href={upload.url} target="_blank" rel="noopener noreferrer" className="image-file-name">{upload.name}</a>
                  : <span className="image-file-name-plain">{upload.name}</span>
                }
                {(upload.status === 'compressing' || upload.status === 'uploading') && (
                  <div className="upload-progress-bar">
                    {upload.status === 'compressing'
                      ? <div className="upload-progress-shimmer" />
                      : <div className="upload-progress-fill" style={{ width: `${upload.progress}%` }} />
                    }
                  </div>
                )}
                {statusLabel(upload) && upload.status !== 'done' && (
                  <span className={`upload-status-text ${upload.status === 'error' ? 'error' : ''}`}>
                    {statusLabel(upload)}
                  </span>
                )}
              </div>
              {(upload.status === 'compressing' || upload.status === 'uploading')
                ? <button type="button" className="image-file-cancel" onClick={() => handleCancel(upload.key)}>✕</button>
                : <button type="button" className="image-file-delete" onClick={() => handleDelete(upload, index)}>✕</button>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;
import React, { useState } from 'react';
import { X, Upload, Book, FileText, Hash, Loader2 } from 'lucide-react';

interface UploadBookModalProps {
  onClose: () => void;
  onUpload: (file: File, metadata: { title: string; description: string; pages: number; category: string }) => Promise<void>;
}

export const UploadBookModal: React.FC<UploadBookModalProps> = ({ onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState<number>(0);
  const [category, setCategory] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.text'];
  const ALLOWED_EXT = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.odt'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (ALLOWED_TYPES.includes(selectedFile.type) || ALLOWED_EXT.includes(ext)) {
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(/\.[^.]+$/, ''));
      setError('');
    } else {
      setError('Unsupported file type. Please select PDF, DOCX, TXT, PPTX, or ODT.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file first.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      await onUpload(file, { title, description, pages, category });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload book.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%', padding: '0', overflow: 'hidden' }}>
        <div style={{ background: 'var(--primary)', padding: '24px', color: 'white', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Upload size={24} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>Upload New Book</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Add resources to the Digital Library</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div style={{ color: '#ff6b6b', background: '#fff5f5', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: '1px solid #ffc9c9' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>Document</label>
            <div 
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => document.getElementById('book-upload-input')?.click()}
            >
              <input 
                id="book-upload-input" 
                type="file" 
                accept="application/pdf,.pdf,.docx,.doc,.txt,.pptx,.odt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
                  <FileText size={20} />
                  {file.name}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Click to select PDF, DOCX, TXT, PPTX or ODT</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>Book Title</label>
            <div style={{ position: 'relative' }}>
              <Book size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter book title" 
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'white' }}
              >
                <option>General</option>
                <option>Textbooks</option>
                <option>Past Papers</option>
                <option>Lecture Notes</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>Total Pages</label>
              <div style={{ position: 'relative' }}>
                <Hash size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  value={pages || ''} 
                  onChange={(e) => setPages(parseInt(e.target.value) || 0)} 
                  placeholder="0" 
                  style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What is this book about?" 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', minHeight: '100px', resize: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '800', 
              fontSize: '15px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isUploading ? 0.7 : 1
            }}
          >
            {isUploading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
            {isUploading ? 'Uploading...' : 'Publish to Library'}
          </button>
        </form>
      </div>
    </div>
  );
};

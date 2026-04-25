import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, AlertTriangle, Download, FileText, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { idbLibrary } from '../lib/idb';

// Use a verified CDN URL for the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface BookReaderProps {
  book: { title: string; file_url: string; description?: string };
  onClose: () => void;
}

type FileType = 'pdf' | 'docx' | 'txt' | 'unsupported';

const getFileType = (url: string): FileType => {
  const lower = url.split('?')[0].toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx';
  if (lower.endsWith('.txt') || lower.endsWith('.text')) return 'txt';
  return 'unsupported';
};

const chunkText = (text: string, charsPerChunk = 1400): string[] => {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > charsPerChunk && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.trim().length > 0);
};

const BookReader: React.FC<BookReaderProps> = ({ book, onClose }) => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [flipDir, setFlipDir] = useState<'forward' | 'back' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    checkOfflineStatus();
    loadDocument();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [book.file_url]);

  const checkOfflineStatus = async () => {
    const exists = await idbLibrary.hasFile(book.file_url);
    setIsOfflineSaved(exists);
  };

  const loadDocument = async () => {
    setLoading(true);
    setError('');
    setChunks([]);
    setHtmlContent('');
    setCurrentPage(0);

    const type = getFileType(book.file_url);
    setFileType(type);

    if (type === 'unsupported') {
      setLoading(false);
      return;
    }

    try {
      let arrayBuffer = await idbLibrary.getFile(book.file_url);
      
      if (!arrayBuffer) {
        const response = await fetch(book.file_url);
        if (!response.ok) throw new Error(`HTTP ${response.status} — the file could not be found. Please delete this record and re-upload.`);
        arrayBuffer = await response.arrayBuffer();
      }
      
      arrayBufferRef.current = arrayBuffer;

      if (type === 'pdf') {
        await loadPdf(arrayBuffer);
      } else if (type === 'docx') {
        await loadDocx(arrayBuffer);
      } else if (type === 'txt') {
        await loadTxt(arrayBuffer);
      }
    } catch (e: any) {
      console.error('BookReader load error:', e);
      setError(e?.message || 'Unknown error loading document.');
    } finally {
      setLoading(false);
    }
  };

  const saveForOffline = async () => {
    setIsSavingOffline(true);
    try {
      let buffer = arrayBufferRef.current;
      // If document isn't loaded yet, fetch it first
      if (!buffer) {
        const response = await fetch(book.file_url);
        if (!response.ok) throw new Error(`Could not fetch file (HTTP ${response.status}).`);
        buffer = await response.arrayBuffer();
        arrayBufferRef.current = buffer;
      }
      await idbLibrary.saveFile(book.file_url, buffer);
      setIsOfflineSaved(true);
    } catch(e: any) {
      console.error('Failed to save offline', e);
      alert('Failed to save offline: ' + (e?.message || 'Device storage might be full.'));
    } finally {
      setIsSavingOffline(false);
    }
  };

  const loadPdf = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      let pageStr = '';
      let lastY = null;
      let lastHeight = null;
      const items = textContent.items as any[];
      
      for (const item of items) {
        if (!item.str) continue;
        
        const y = item.transform[5];
        const height = item.transform[0]; // approximate height
        
        if (lastY !== null) {
          const yDiff = Math.abs(lastY - y);
          // Detect paragraph break or new line based on vertical jump
          if (yDiff > height * 1.5) {
            pageStr += '\n\n'; 
          } else if (yDiff > height * 0.5) {
            pageStr += '\n';
          } else if (!pageStr.endsWith(' ') && !item.str.startsWith(' ') && item.str.trim() !== '') {
            pageStr += ' ';
          }
        }
        
        pageStr += item.str;
        lastY = y;
        lastHeight = height;
      }
      
      // Clean up multiple newlines/spaces
      pageStr = pageStr.replace(/\n{3,}/g, '\n\n').trim();
      if (pageStr.length > 5) pageTexts.push(pageStr);
    }

    const fullText = pageTexts.join('\n\n\n');
    const result = chunkText(fullText);
    setChunks(result.length > 0 ? result : ['No readable text found in this PDF. The file may contain only images or scanned pages.']);
  };

  const loadDocx = async (arrayBuffer: ArrayBuffer) => {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    if (result.value) {
      setHtmlContent(result.value);
      // Also extract plain text for chunked reading
      const plainResult = await mammoth.extractRawText({ arrayBuffer });
      const result2 = chunkText(plainResult.value);
      setChunks(result2.length > 0 ? result2 : ['Document appears to be empty.']);
    } else {
      throw new Error('Could not convert DOCX to readable content.');
    }
  };

  const loadTxt = async (arrayBuffer: ArrayBuffer) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);
    const result = chunkText(text);
    setChunks(result.length > 0 ? result : ['Text file appears to be empty.']);
  };

  const goForward = () => {
    if (currentPage >= chunks.length - 1 || isAnimating) return;
    setFlipDir('forward');
    setIsAnimating(true);
    timeoutRef.current = setTimeout(() => {
      setCurrentPage(p => p + 1);
      setFlipDir(null);
      setIsAnimating(false);
    }, 350);
  };

  const goBack = () => {
    if (currentPage <= 0 || isAnimating) return;
    setFlipDir('back');
    setIsAnimating(true);
    timeoutRef.current = setTimeout(() => {
      setCurrentPage(p => p - 1);
      setFlipDir(null);
      setIsAnimating(false);
    }, 350);
  };

  const totalPages = chunks.length;
  const currentText = chunks[currentPage] || '';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(180deg, #1a0f0a 0%, #0d0805 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', borderRadius: '8px', padding: '7px 12px',
          cursor: 'pointer', fontWeight: '700', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <ArrowLeft size={14} /> Library
        </button>
        <BookOpen size={16} color="rgba(255,200,100,0.8)" />
        <div style={{
          flex: 1, fontWeight: '700', fontSize: '13px',
          color: 'rgba(255,220,150,0.9)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {book.title}
        </div>
        {!loading && totalPages > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={saveForOffline}
              disabled={isOfflineSaved || isSavingOffline || !!error}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: isOfflineSaved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isOfflineSaved ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.15)'}`,
                color: isOfflineSaved ? '#4ade80' : 'white',
                borderRadius: '8px', padding: '6px 12px',
                cursor: (isOfflineSaved || isSavingOffline || !!error) ? 'default' : 'pointer',
                fontWeight: '700', fontSize: '11px', transition: 'all 0.2s'
              }}
            >
              {isSavingOffline ? 'Saving...' : isOfflineSaved ? <><CheckCircle2 size={14} /> Saved</> : <><DownloadCloud size={14} /> Save Offline</>}
            </button>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
              {currentPage + 1} / {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Book Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>

        {loading && (
          <div style={{ color: 'rgba(255,220,150,0.7)', textAlign: 'center', fontSize: '14px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <BookOpen size={48} style={{ opacity: 0.7 }} />
            </div>
            Loading document...
          </div>
        )}

        {error && (
          <div style={{ color: '#ff8080', textAlign: 'center', fontSize: '14px', padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '380px' }}>
            <AlertTriangle size={32} />
            <div style={{ lineHeight: 1.6 }}>{error}</div>
            <a href={book.file_url} download style={{ color: 'rgba(255,200,100,0.8)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <Download size={14} /> Download file instead
            </a>
          </div>
        )}

        {/* Unsupported format — offer download */}
        {!loading && fileType === 'unsupported' && !error && (
          <div style={{ color: 'rgba(255,220,150,0.8)', textAlign: 'center', padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '360px' }}>
            <FileText size={48} style={{ opacity: 0.6 }} />
            <div style={{ fontSize: '15px', fontWeight: '700' }}>Format not previewable</div>
            <div style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.6 }}>
              This file type cannot be read in-browser. You can download it to open with an appropriate app.
            </div>
            <a href={book.file_url} download style={{ background: 'rgba(200,160,106,0.25)', border: '1px solid rgba(200,160,106,0.4)', color: 'rgba(232,200,122,0.9)', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Download size={16} /> Download File
            </a>
          </div>
        )}

        {!loading && !error && fileType !== 'unsupported' && chunks.length > 0 && (
          <div style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
            <style>{`
              @keyframes flipForward {
                0%   { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
                50%  { transform: perspective(1000px) rotateY(-8deg); opacity: 0.7; }
                100% { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
              }
              @keyframes flipBack {
                0%   { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
                50%  { transform: perspective(1000px) rotateY(8deg); opacity: 0.7; }
                100% { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
              }
              .flip-forward { animation: flipForward 0.35s ease; }
              .flip-back    { animation: flipBack 0.35s ease; }
              .book-page-text {
                font-size: 15px;
                line-height: 1.9;
                color: #2c1810;
                text-align: justify;
                word-break: break-word;
                hyphens: auto;
                white-space: pre-wrap;
              }
              .book-page-text::first-letter {
                font-size: 48px;
                font-weight: bold;
                float: left;
                margin: 4px 8px -4px 0;
                color: #8B4513;
                line-height: 1;
              }
              ::-webkit-scrollbar { width: 4px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: rgba(139,69,19,0.3); border-radius: 4px; }
            `}</style>

            {/* Book shadow */}
            <div style={{
              position: 'absolute', inset: '-4px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '4px 12px 12px 4px',
              filter: 'blur(8px)', zIndex: 0,
              transform: 'translate(6px, 6px)'
            }} />

            {/* Page container */}
            <div
              className={flipDir === 'forward' ? 'flip-forward' : flipDir === 'back' ? 'flip-back' : ''}
              style={{
                position: 'relative', zIndex: 1,
                background: 'linear-gradient(135deg, #fefcf0 0%, #fdf6e3 50%, #fef9ed 100%)',
                borderRadius: '4px 12px 12px 4px',
                boxShadow: '-4px 0 8px rgba(0,0,0,0.2), 4px 4px 24px rgba(0,0,0,0.4), inset 8px 0 16px rgba(0,0,0,0.08)',
                minHeight: '440px',
                maxHeight: 'calc(100vh - 200px)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Spine shadow */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                background: 'linear-gradient(180deg, rgba(139,69,19,0.0) 0%, rgba(139,69,19,0.15) 30%, rgba(139,69,19,0.15) 70%, rgba(139,69,19,0.0) 100%)',
              }} />

              {/* Header */}
              <div style={{ padding: '18px 24px 8px', borderBottom: '1px solid rgba(139,69,19,0.15)', flexShrink: 0 }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8B6914', fontWeight: '700' }}>
                  {book.title.length > 45 ? book.title.substring(0, 45) + '…' : book.title}
                </div>
              </div>

              {/* Text */}
              <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto' }}>
                <p className="book-page-text" dangerouslySetInnerHTML={{ 
                  __html: currentText
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/^([A-Z0-9][^\n:]{2,60}):/gm, '<strong>$1:</strong>') // Bold things like "Premise (Central Idea): "
                    .replace(/^([0-9]+\.\s[^\n]{1,80})/gm, '<strong style="display:block; margin-top:8px; margin-bottom:4px; font-size:1.1em; color:#8B4513;">$1</strong>') // Bold "1. Core Elements..."
                }} />
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 24px', borderTop: '1px solid rgba(139,69,19,0.12)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: 'rgba(139,69,19,0.5)', fontStyle: 'italic' }}>
                  — {currentPage + 1} —
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '12px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${((currentPage + 1) / totalPages) * 100}%`,
                background: 'linear-gradient(90deg, #c8a06a, #e8c87a)',
                borderRadius: '2px', transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!loading && !error && chunks.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px',
          padding: '14px', flexShrink: 0,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
        }}>
          <button
            onClick={goBack}
            disabled={currentPage === 0 || isAnimating}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: currentPage === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(200,160,106,0.2)',
              border: '1px solid rgba(200,160,106,0.3)',
              color: currentPage === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(232,200,122,0.9)',
              borderRadius: '10px', padding: '10px 18px',
              cursor: currentPage === 0 ? 'default' : 'pointer',
              fontSize: '13px', fontWeight: '700', transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div style={{ fontSize: '12px', color: 'rgba(255,220,150,0.6)', minWidth: '80px', textAlign: 'center' }}>
            Page {currentPage + 1} of {totalPages}
          </div>

          <button
            onClick={goForward}
            disabled={currentPage >= totalPages - 1 || isAnimating}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: currentPage >= totalPages - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(200,160,106,0.2)',
              border: '1px solid rgba(200,160,106,0.3)',
              color: currentPage >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(232,200,122,0.9)',
              borderRadius: '10px', padding: '10px 18px',
              cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer',
              fontSize: '13px', fontWeight: '700', transition: 'all 0.2s',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookReader;

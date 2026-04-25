import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FileText, Download, Share2, AlertCircle, CheckCircle2, Link as LinkIcon, Edit3, Settings, BookOpen } from 'lucide-react';
import { UDSM_LOGO } from '../lib/logo';

interface AssignmentWorkspaceProps {
  userProfile: any;
}

const AssignmentWorkspace: React.FC<AssignmentWorkspaceProps> = ({ userProfile }) => {
  const [includeCover, setIncludeCover] = useState(true);
  const [selectedFont, setSelectedFont] = useState("'Times New Roman', Times, serif");
  const [selectedFontSize, setSelectedFontSize] = useState("18px");
  
  // Custom Styles for Premium Editor
  const editorStyles = `
    .ql-toolbar.ql-snow {
      border: none !important;
      border-bottom: 1px solid var(--border) !important;
      background: var(--bg-card);
      border-radius: 16px 16px 0 0;
      padding: 16px 20px !important;
    }
    .ql-container.ql-snow {
      border: none !important;
      background: #ffffff;
      border-radius: 0 0 16px 16px;
    }
    .ql-editor {
      min-height: 600px;
      font-family: ${selectedFont} !important;
      font-size: ${selectedFontSize} !important;
      line-height: 2;
      color: #111;
      padding: 60px 80px !important;
    }
    .ql-editor.ql-blank::before {
      font-family: ${selectedFont} !important;
      font-size: ${selectedFontSize} !important;
      font-style: italic;
      color: #aaa;
      left: 80px;
    }
  `;
  
  // Cover Page Details
  const [university, setUniversity] = useState('UNIVERSITY OF DAR ES SALAAM');
  const [uniAbbr, setUniAbbr] = useState('UDSM');
  const [assignmentNumber, setAssignmentNumber] = useState('');
  const [topic, setTopic] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [course, setCourse] = useState('');
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [instructor, setInstructor] = useState('');
  const [studentName, setStudentName] = useState('');

  // Group Details & Additional Fields
  const [assignmentType, setAssignmentType] = useState<'individual' | 'group'>('individual');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [groupMembers, setGroupMembers] = useState([
    { id: Date.now(), name: '', course: '', regNo: '' }
  ]);

  // General Details
  const [title, setTitle] = useState('');
  const [googleLink, setGoogleLink] = useState('');
  const [content, setContent] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const coverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const addGroupMember = () => {
    setGroupMembers([...groupMembers, { id: Date.now(), name: '', course: '', regNo: '' }]);
  };

  const removeGroupMember = (id: number) => {
    setGroupMembers(groupMembers.filter(m => m.id !== id));
  };

  const updateGroupMember = (id: number, field: string, value: string) => {
    setGroupMembers(groupMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleGenerate = async () => {
    if ((!title.trim() && !includeCover) || !content.trim()) {
      alert("Please provide Assignment Content.");
      return;
    }

    setIsGenerating(true);
    setSuccess(false);

    try {
      if (!contentRef.current) return;
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Render Cover Page
      if (includeCover && coverRef.current) {
        coverRef.current.style.display = 'flex';
        const coverCanvas = await html2canvas(coverRef.current, { scale: 2, useCORS: true, logging: false, windowWidth: 800 });
        coverRef.current.style.display = 'none';
        
        const coverImg = coverCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(coverImg, 'JPEG', 0, 0, pdfWidth, (coverCanvas.height * pdfWidth) / coverCanvas.width);
        pdf.addPage();
      }

      // Render Content Page
      contentRef.current.style.display = 'block';
      const contentCanvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, logging: false, windowWidth: 800 });
      contentRef.current.style.display = 'none';

      const contentImg = contentCanvas.toDataURL('image/jpeg', 1.0);
      const imgHeight = (contentCanvas.height * pdfWidth) / contentCanvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Slice multi-page content
      pdf.addImage(contentImg, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentImg, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Save PDF locally
      const fileName = `${(title || topic).replace(/\s+/g, '_')}_Assignment.pdf`;
      pdf.save(fileName);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // Auto-Open Google Link if provided
      if (googleLink.trim()) {
        let url = googleLink.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        setTimeout(() => { window.open(url, '_blank'); }, 1500);
      }

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="view-content" style={{ padding: '0 16px 120px' }}>
      <style>{editorStyles}</style>

      <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', color: 'white' }}>
              <Edit3 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>Assignment Generator</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Write your work and export it to PDF</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <select 
              value={selectedFont} 
              onChange={e => setSelectedFont(e.target.value)}
              style={{ 
                padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', 
                background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '13px', 
                fontWeight: '600', cursor: 'pointer', outline: 'none' 
              }}
            >
              <option value="'Times New Roman', Times, serif">Times New Roman</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Courier New', Courier, monospace">Courier New</option>
              <option value="'Garamond', serif">Garamond</option>
              <option value="'Georgia', serif">Georgia</option>
            </select>

            <select 
              value={selectedFontSize} 
              onChange={e => setSelectedFontSize(e.target.value)}
              style={{ 
                padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', 
                background: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '13px', 
                fontWeight: '600', cursor: 'pointer', outline: 'none' 
              }}
            >
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'var(--bg-main)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <input type="checkbox" checked={includeCover} onChange={e => setIncludeCover(e.target.checked)} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>Auto Cover Page</span>
            </label>
            {includeCover && (
              <div style={{ display: 'flex', background: 'var(--border)', padding: '4px', borderRadius: '12px' }}>
                <button onClick={() => setAssignmentType('individual')} style={{ padding: '6px 12px', background: assignmentType === 'individual' ? 'var(--bg-main)' : 'transparent', border: 'none', borderRadius: '8px', fontWeight: '700', color: assignmentType === 'individual' ? 'var(--text-dark)' : 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Individual</button>
                <button onClick={() => setAssignmentType('group')} style={{ padding: '6px 12px', background: assignmentType === 'group' ? 'var(--bg-main)' : 'transparent', border: 'none', borderRadius: '8px', fontWeight: '700', color: assignmentType === 'group' ? 'var(--text-dark)' : 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Group</button>
              </div>
            )}
          </div>
        </div>

        {/* Cover Page Form */}
        {includeCover && (
          <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', border: '1.5px dashed var(--border)', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={16} /> Cover Page Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <input placeholder="University Name" value={university} onChange={e => setUniversity(e.target.value)} style={inputStyle} />
              <input placeholder="Abbreviation (e.g. UDSM)" value={uniAbbr} onChange={e => setUniAbbr(e.target.value)} style={inputStyle} />
              
              <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Assignment No</div><input placeholder="e.g. 2" value={assignmentNumber} onChange={e => setAssignmentNumber(e.target.value)} style={inputStyle} /></div>
              <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Course Code</div><input placeholder="e.g. CA 108" value={course} onChange={e => setCourse(e.target.value)} style={inputStyle} /></div>
              
              <div style={{ position: 'relative', gridColumn: '1 / -1' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Assignment Topic</div><input placeholder="Main topic or title" value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle} /></div>
              <div style={{ position: 'relative', gridColumn: '1 / -1' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Subtitle (Optional)</div><input placeholder="Subtopic or specific books" value={subtitle} onChange={e => setSubtitle(e.target.value)} style={inputStyle} /></div>

              {assignmentType === 'group' && (
                <>
                  <div style={{ position: 'relative', gridColumn: '1 / -1' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>College Name</div><input placeholder="e.g. COLLEGE OF HUMANITIES" value={college} onChange={e => setCollege(e.target.value)} style={inputStyle} /></div>
                  <div style={{ position: 'relative', gridColumn: '1 / -1' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Department Name</div><input placeholder="e.g. DEPARTMENT OF CREATIVE ARTS" value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle} /></div>
                </>
              )}

              {assignmentType === 'individual' && (
                <>
                  <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Student Name</div><input placeholder="Your Full Name" value={studentName} onChange={e => setStudentName(e.target.value)} style={inputStyle} /></div>
                  <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Registration Number</div><input placeholder="Your Reg No" value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} style={inputStyle} /></div>
                </>
              )}
              
              <div style={{ position: 'relative', gridColumn: '1 / -1' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Question (Optional)</div><input placeholder="e.g. Generate any five story ideas" value={questionText} onChange={e => setQuestionText(e.target.value)} style={inputStyle} /></div>

              <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Venue</div><input placeholder="e.g. SA" value={venue} onChange={e => setVenue(e.target.value)} style={inputStyle} /></div>
              <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Time</div><input placeholder="e.g. 7:00 - 10:55" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} /></div>
              <div style={{ position: 'relative' }}><div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-main)', padding: '0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>Instructor Name</div><input placeholder="Instructor Name (Optional)" value={instructor} onChange={e => setInstructor(e.target.value)} style={inputStyle} /></div>
              
              {assignmentType === 'group' && (
                <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>Group Members</div>
                    <button onClick={addGroupMember} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Add Member</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupMembers.map((member, index) => (
                      <div key={member.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', width: '20px' }}>{index + 1}.</div>
                        <input placeholder="Name" value={member.name} onChange={e => updateGroupMember(member.id, 'name', e.target.value)} style={{ ...inputStyle, padding: '10px 12px', fontSize: '14px' }} />
                        <input placeholder="Course" value={member.course} onChange={e => updateGroupMember(member.id, 'course', e.target.value)} style={{ ...inputStyle, padding: '10px 12px', fontSize: '14px', width: '30%' }} />
                        <input placeholder="Reg No" value={member.regNo} onChange={e => updateGroupMember(member.id, 'regNo', e.target.value)} style={{ ...inputStyle, padding: '10px 12px', fontSize: '14px', width: '40%' }} />
                        {groupMembers.length > 1 && (
                          <button onClick={() => removeGroupMember(member.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <AlertCircle size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Logo Preview - Locked to UDSM default */}
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-main)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  <img src={UDSM_LOGO} alt="UDSM Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>School Logo</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UDSM Logo is automatically applied to all cover pages.</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Note: University of Dar es Salaam logo is automatically included on the cover page.
            </div>
          </div>
        )}

        {/* Content Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {!includeCover && (
             <input 
               placeholder="Assignment Title (For Header) *" 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               style={inputStyle} 
             />
          )}

          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '16px', border: '1.5px solid var(--border)', padding: '0 16px' }}>
            <LinkIcon size={18} color="var(--text-muted)" />
            <input 
              placeholder="Google Form/Classroom Link (Auto-Submit)" 
              value={googleLink} 
              onChange={e => setGoogleLink(e.target.value)} 
              style={{ flex: 1, padding: '14px 12px', border: 'none', background: 'transparent', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', outline: 'none' }} 
            />
          </div>

          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(0,0,0,0.05)', 
            overflow: 'hidden',
            marginTop: '16px'
          }}>
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              placeholder="Start drafting your masterpiece... The text will automatically format exactly as it appears here on the final PDF!"
              style={{ border: 'none' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  [{'align': []}],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <AlertCircle size={16} color="var(--primary)" /> Final PDF is automatically saved.
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ 
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', 
              color: 'white', 
              padding: '16px 32px', borderRadius: '16px', 
              border: 'none', fontWeight: '800', fontSize: '16px', 
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isGenerating ? 'Generating...' : success ? <><CheckCircle2 size={20} /> Generated!</> : <><Download size={20} /> Generate & Auto-Submit</>}
          </button>
        </div>
      </div>

      {/* --- HIDDEN PDF TEMPLATES --- */}
      
      {/* 1. Auto Cover Page Template */}
      {includeCover && (
        <div 
          ref={coverRef} 
          style={{ 
            display: 'none', 
            flexDirection: 'column',
            alignItems: 'center',
            width: '800px', 
            height: '1131px', // Exact A4 aspect ratio
            padding: '80px 100px', 
            background: 'white', 
            color: 'black', 
            fontFamily: "'Times New Roman', Times, serif" 
          }}
        >
          {assignmentType === 'individual' ? (
            <>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {university}
                </h1>
                <div style={{ fontSize: '20px', fontWeight: 'normal', margin: '0 0 40px 0' }}>
                  ({uniAbbr})
                </div>
                
                {/* School Logo */}
                <div style={{ margin: '0 auto 60px auto', display: 'flex', justifyContent: 'center' }}>
                  <img src={UDSM_LOGO} alt="University Logo" style={{ height: '180px', objectFit: 'contain' }} />
                </div>
                
                <div style={{ width: '100%', height: '2px', background: '#222', marginBottom: '30px' }} />
                
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Course Assignment {assignmentNumber}:
                </h2>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                  {topic}
                </h3>
                {subtitle && (
                  <div style={{ fontSize: '20px', fontStyle: 'italic', margin: '0 0 30px 0' }}>
                    ({subtitle})
                  </div>
                )}
                
                <div style={{ width: '100%', height: '2px', background: '#222', marginBottom: '60px' }} />
              </div>

              {/* Details Table */}
              <div style={{ width: '80%', margin: '0 auto', fontSize: '20px', lineHeight: '2.4' }}>
                <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ width: '40%', fontWeight: 'bold' }}>Name:</div>
                  <div style={{ width: '60%' }}>{studentName || userProfile?.username || userProfile?.full_name || 'Student Name'}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ width: '40%', fontWeight: 'bold' }}>Registration No:</div>
                  <div style={{ width: '60%' }}>{registrationNo}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ width: '40%', fontWeight: 'bold' }}>Subject Code:</div>
                  <div style={{ width: '60%' }}>{course}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ width: '40%', fontWeight: 'bold' }}>Venue:</div>
                  <div style={{ width: '60%' }}>{venue}</div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ width: '40%', fontWeight: 'bold' }}>Time:</div>
                  <div style={{ width: '60%' }}>{time}</div>
                </div>
                {instructor && (
                  <div style={{ display: 'flex', borderBottom: '1px dotted #ccc' }}>
                    <div style={{ width: '40%', fontWeight: 'bold' }}>Instructor:</div>
                    <div style={{ width: '60%' }}>{instructor}</div>
                  </div>
                )}
                {questionText && (
                  <div style={{ marginTop: '40px' }}>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Question:</div>
                    <div style={{ border: '1px dashed #999', padding: '12px', marginTop: '10px' }}>{questionText}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {university}
                </h1>
                
                {/* School Logo */}
                <div style={{ margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center' }}>
                  <img src={UDSM_LOGO} alt="University Logo" style={{ height: '140px', objectFit: 'contain' }} />
                </div>
                
                {college && (
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    {college}
                  </h2>
                )}
                {department && (
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', textTransform: 'uppercase' }}>
                    {department}
                  </h3>
                )}
                
                <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                  {topic}
                </div>
                
                <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 30px 0', border: '1px solid black', display: 'inline-block', padding: '4px 8px' }}>
                  {course || 'COURSE CODE'}
                </div>
              </div>

              {/* Members Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', marginBottom: '30px', fontSize: '16px' }}>
                <thead>
                  <tr style={{ background: '#e5e5e5' }}>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '50px' }}>SN</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>NAMES</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '120px' }}>COURSE</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '180px' }}>REG No</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.map((member, idx) => (
                    <tr key={member.id}>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{String(idx + 1).padStart(2, '0')}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textTransform: 'uppercase' }}>{member.name}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', textTransform: 'uppercase' }}>{member.course}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{member.regNo}</td>
                    </tr>
                  ))}
                  {/* Fill empty rows to make it look like a standard form if there are few members */}
                  {Array.from({ length: Math.max(0, 10 - groupMembers.length) }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold', color: '#999' }}>{String(groupMembers.length + i + 1).padStart(2, '0')}</td>
                      <td style={{ border: '1px solid black', padding: '6px' }}>&nbsp;</td>
                      <td style={{ border: '1px solid black', padding: '6px' }}>&nbsp;</td>
                      <td style={{ border: '1px solid black', padding: '6px' }}>&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Question Section */}
              {questionText && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ fontWeight: 'bold', border: '1px solid black', display: 'inline-block', padding: '2px 6px', marginBottom: '10px' }}>Question</div>
                  <div style={{ border: '1px dashed #000', padding: '10px', minHeight: '40px' }}>{questionText}</div>
                </div>
              )}

              {/* Footer Details */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <div style={{ width: '350px', fontSize: '16px' }}>
                  <div style={{ display: 'flex', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', width: '120px' }}>Time</div>
                    <div>: {time}</div>
                  </div>
                  <div style={{ display: 'flex', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', width: '120px' }}>Venue</div>
                    <div>: {venue}</div>
                  </div>
                  <div style={{ display: 'flex', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', width: '150px' }}>Course Instructor:</div>
                    <div> {instructor}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Content Page Template */}
      <div 
        ref={contentRef} 
        style={{ 
          display: 'none', 
          width: '800px', 
          minHeight: '1131px', 
          padding: '80px', 
          background: 'white', 
          color: 'black', 
          fontFamily: selectedFont,
          fontSize: selectedFontSize
        }}
      >
        {!includeCover && (
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{title || 'Assignment'}</h1>
            <div style={{ fontSize: '18px', color: '#444' }}>
              <span><strong>Student Name:</strong> {studentName || userProfile?.username || userProfile?.full_name || 'Student'}</span>
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
        )}

        <div 
          className="ql-editor"
          style={{ fontSize: '18px', lineHeight: '2.0', textAlign: 'justify', padding: 0 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

    </div>
  );
};

const inputStyle = {
  width: '100%', 
  padding: '16px 16px', 
  borderRadius: '12px', 
  border: '2px solid transparent', 
  background: 'var(--bg-card)', 
  fontSize: '15px', 
  fontWeight: '600', 
  color: 'var(--text-dark)',
  outline: 'none',
  transition: 'border 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};

export default AssignmentWorkspace;

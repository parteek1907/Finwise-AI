import React, { useRef, useState, useEffect } from 'react';
import { Download, Share2, Loader2, Sparkles, X, Maximize2, Award, ChevronRight, CheckCircle2 } from 'lucide-react';
import styles from './Certificate.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  date: string;
  score?: number; // Removed from UI, kept for compatibility
  variant?: 'full' | 'grid';
}

export const Certificate: React.FC<CertificateProps> = ({ userName, courseTitle, date, variant = 'full' }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setScale(Math.min(width / 800, 1));
        }
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDownload = async () => {
    // Determine which ref to use based on mode (we might be in grid or full view)
    const targetRef = certificateRef.current;
    if (!targetRef) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(targetRef, { 
        scale: 2, 
        backgroundColor: '#ffffff', 
        useCORS: true,
        onclone: (clonedDocument) => {
          // html2canvas renders the baseline slightly lower for all custom fonts,
          // shifting the entire text layout down relative to the background image.
          // By shifting the ENTIRE overlay container up, we keep the spacing between
          // the name, course name, and logo identical, while fixing the overlap with the line.
          const contentOverlay = clonedDocument.querySelector(`[class*="certContentOverlay"]`) as HTMLElement;
          if (contentOverlay) {
            contentOverlay.style.top = '-15px';
          }
          
          // html2canvas also increases the gap between the logo image and the text below it
          // because it renders the text baseline lower. We pull the text up manually.
          const logoText = clonedDocument.querySelector(`[class*="logoTextOverlay"]`) as HTMLElement;
          if (logoText) {
            logoText.style.transform = 'translateY(-6px)';
          }
          const logoSubtitle = clonedDocument.querySelector(`[class*="logoSubtitle"]`) as HTMLElement;
          if (logoSubtitle) {
            logoSubtitle.style.transform = 'translateY(-8px)';
          }
        }
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `FinWise_Certificate_${courseTitle.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Error downloading certificate:", err);
    }
    setIsDownloading(false);
  };

  type ShareStep = 'choose_caption' | 'choose_destination' | 'success_fallback';
  type CaptionMode = 'write' | 'ai';

  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [shareStep, setShareStep] = useState<ShareStep>('choose_caption');
  const [captionMode, setCaptionMode] = useState<CaptionMode>('ai');
  const [captionText, setCaptionText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset modal state when opening
  useEffect(() => {
    if (showLinkedInModal) {
      setShareStep('choose_caption');
      if (!captionText) setCaptionMode('ai');
    }
  }, [showLinkedInModal]);

  const generateCaption = async () => {
    setIsGenerating(true);
    try {
      const systemContext = `You are an expert copywriter for FinWise AI, an Academy of Financial Mastery. Write a highly professional, engaging LinkedIn post FROM THE FIRST-PERSON PERSPECTIVE OF THE USER ("I", "my"). The user is proudly announcing they just completed the course "${courseTitle}". Write the exact text the user should paste into their LinkedIn status. Keep it under 3-4 sentences. Include emojis and hashtags like #FinWise #FinancialLiteracy #PersonalFinance. Focus on the value of continuous learning. 

CRITICAL INSTRUCTIONS:
1. Output ONLY the raw post content. Do NOT include any introductory text like "Here is your post" or "Sure!". 
2. Do NOT use any markdown formatting like **bold** or *italics* because LinkedIn does not support it natively.`;
      
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'system', content: systemContext }, { role: 'user', content: 'Please generate my professional LinkedIn caption.' }],
          userName: userName 
        }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      setCaptionText(data.content);
    } catch (error) {
      console.error("Error generating caption:", error);
      setCaptionText(`🎓 I'm thrilled to share that I've just earned a Certificate of Achievement in "${courseTitle}" from FinWise AI Academy!\n\nBuilding a strong financial foundation is essential, and I'm committed to continuous learning and mastering my personal finances. 📈\n\n#FinWise #PersonalFinance #FinancialLiteracy #ContinuousLearning`);
    }
    setIsGenerating(false);
  };

  const issueDate = new Date(date);
  const issueYear = issueDate.getFullYear();
  const issueMonth = issueDate.getMonth() + 1;
  const certId = `FW-${courseTitle.replace(/\s+/g, '').substring(0, 6).toUpperCase()}-${issueYear}`;

  const handleAddCertification = () => {
    const url = new URL('https://www.linkedin.com/profile/add');
    url.searchParams.append('startTask', 'CERTIFICATION_NAME');
    url.searchParams.append('name', courseTitle);
    url.searchParams.append('organizationName', 'FinWise AI');
    url.searchParams.append('issueYear', issueYear.toString());
    url.searchParams.append('issueMonth', issueMonth.toString());
    url.searchParams.append('certId', certId);
    window.open(url.toString(), '_blank');
  };

  const handleSharePost = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      await handleDownload();
      // Pass the text to LinkedIn via URL parameters so it auto-fills the caption box
      const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captionText)}`;
      window.open(linkedinUrl, '_blank');
      setShareStep('success_fallback');
    } catch (err) {
      console.error("Failed to share post", err);
    }
  };

  const VisualCertificate = ({ hiddenForExport = false }: { hiddenForExport?: boolean }) => (
    <div 
      className={styles.certificateRoot} 
      ref={hiddenForExport ? undefined : certificateRef}
      style={hiddenForExport ? { position: 'absolute', top: '-9999px', left: '-9999px' } : {}}
    >
      <img src={`/certificate.svg?v=${Date.now()}`} alt="Certificate Background" className={styles.certBackground} />
      
      <div className={styles.certContentOverlay}>
        <h2 className={styles.certUserNameOverlay}>{userName || "FinWise User"}</h2>
        <h3 className={styles.certCourseTitleOverlay}>"{courseTitle}"</h3>
        <p className={styles.certDateOverlay}>{date}</p>
        
        <div className={styles.logoGroupOverlay}>
          <img src="/logo.png" alt="FinWise Logo" className={styles.logoImageOverlay} />
          <span className={styles.logoTextOverlay}>FinWise</span>
          <span className={styles.logoSubtitle}>Academy of Financial Mastery</span>
        </div>

        <div className={styles.certIdOverlay}>
          CERT ID: FW-{courseTitle.replace(/\s+/g, '').substring(0, 6).toUpperCase()}-{new Date(date).getFullYear()}
        </div>
      </div>
    </div>
  );

  // Premium LinkedIn Modal
  const linkedInModal = (
    <AnimatePresence>
      {showLinkedInModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <button className={styles.closeModalBtn} onClick={() => setShowLinkedInModal(false)}>
              <X size={20} />
            </button>
            
            {shareStep === 'choose_caption' && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.stepBadge}>Step 1 of 2</div>
                  <h3>Prepare your caption</h3>
                  <p>Choose what you want to say when sharing your achievement.</p>
                </div>

                <div className={styles.captionArea}>
                  <textarea 
                    className={styles.captionTextarea}
                    value={captionText}
                    onChange={e => setCaptionText(e.target.value)}
                    placeholder="Share what you've learned, what this course taught you, and why financial literacy matters..."
                  />
                  
                  <div className={styles.captionControls}>
                    <button 
                      className={styles.smallAiGenerateBtn} 
                      onClick={generateCaption}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className={styles.spin} size={14} /> : <Sparkles size={14} />}
                      {isGenerating ? 'Drafting...' : 'Generate with AI'}
                    </button>
                    <div className={styles.charCount}>{captionText.length} characters</div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button 
                    className={styles.primaryBtn} 
                    onClick={() => setShareStep('choose_destination')}
                    disabled={!captionText.trim()}
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {shareStep === 'choose_destination' && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.stepBadge}>Step 2 of 2</div>
                  <h3>How would you like to share?</h3>
                  <p>Add this to your professional profile or share it with your network.</p>
                </div>

                <div className={styles.destinationCards}>
                  <button className={styles.destCard} onClick={handleAddCertification}>
                    <div className={styles.destIconWrapper}><Award size={28} /></div>
                    <div className={styles.destContent}>
                      <h4>Add to Certifications</h4>
                      <p>Add this certificate to your LinkedIn Certifications section.</p>
                    </div>
                  </button>

                  <button className={styles.destCard} onClick={handleSharePost} disabled={isDownloading}>
                    <div className={styles.destIconWrapper}><Share2 size={28} /></div>
                    <div className={styles.destContent}>
                      <h4>Share as Post</h4>
                      <p>Publish this achievement as a LinkedIn post with your certificate.</p>
                    </div>
                    {isDownloading && <Loader2 className={styles.spin} size={20} />}
                  </button>
                </div>
                
                <div className={styles.modalFooter}>
                  <button className={styles.secondaryBtn} onClick={() => setShareStep('choose_caption')}>
                    Back
                  </button>
                </div>
              </>
            )}

            {shareStep === 'success_fallback' && (
              <div className={styles.successState}>
                <div className={styles.successIconWrapper}>
                  <CheckCircle2 size={48} color="#10b981" />
                </div>
                <h3>Almost done!</h3>
                <p className={styles.successDesc}>Because of LinkedIn's security rules, we've prepared everything for you to easily paste.</p>
                
                <ul className={styles.checklist}>
                  <li><CheckCircle2 size={18} color="#10b981" /> <span>Caption copied to clipboard</span></li>
                  <li><CheckCircle2 size={18} color="#10b981" /> <span>Certificate downloaded to your device</span></li>
                </ul>

                <div className={styles.instructionBox}>
                  <p><strong>Next steps:</strong></p>
                  <ol>
                    <li>In the new LinkedIn tab, your caption is already filled in!</li>
                    <li>Click the <strong>Image icon (🖼️)</strong> at the bottom of the post box.</li>
                    <li>Select the certificate image that just downloaded.</li>
                    <li>Click <strong>Post</strong>!</li>
                  </ol>
                </div>

                <button className={styles.primaryBtn} onClick={() => setShowLinkedInModal(false)} style={{ width: '100%', justifyContent: 'center' }}>
                  Done
                </button>
              </div>
            )}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (variant === 'grid') {
    return (
      <>
        <div 
          className={styles.wrapper} 
          ref={wrapperRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              width: 800, 
              height: 566, 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left',
              marginBottom: `-${566 * (1 - scale)}px`
            }}
          >
            <VisualCertificate />
          </motion.div>
          
          <div 
            className={styles.premiumActionOverlay}
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <button className={styles.viewBtn} onClick={() => setIsFullViewOpen(true)}>
              <Maximize2 size={16} /> View
            </button>
            <button onClick={handleDownload} className={styles.downloadBtn} disabled={isDownloading}>
              {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
              Save
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowLinkedInModal(true); }} className={styles.linkedinBtn}>
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Full View Modal */}
        <AnimatePresence>
          {isFullViewOpen && (
            <div className={styles.fullViewModalOverlay} onClick={() => setIsFullViewOpen(false)}>
              <motion.div 
                className={styles.fullViewModalContent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className={styles.closeFullViewBtn} onClick={() => setIsFullViewOpen(false)}>
                  <X size={24} />
                </button>
                <div style={{ width: '800px', height: '566px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden' }}>
                  <VisualCertificate />
                </div>
                <div className={styles.actionRowGrid} style={{ width: '800px' }}>
                  <button onClick={handleDownload} className={styles.downloadBtn} disabled={isDownloading}>
                    {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                    Download High-Res
                  </button>
                  <button onClick={() => setShowLinkedInModal(true)} className={styles.linkedinBtn}>
                    <Share2 size={16} /> Share on LinkedIn
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LinkedIn Modal handled separately below to reuse it */}
        {linkedInModal}
      </>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{ 
          width: 800, 
          height: 566, 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          marginBottom: `-${566 * (1 - scale)}px`
        }}
      >
        <VisualCertificate />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className={styles.actionRowGrid}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button onClick={handleDownload} className={styles.downloadBtn} disabled={isDownloading}>
          {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
          {isDownloading ? 'Generating...' : 'Download PNG'}
        </button>
        <button onClick={() => setShowLinkedInModal(true)} className={styles.linkedinBtn}>
          <Share2 size={16} /> Share on LinkedIn
        </button>
      </motion.div>

      {linkedInModal}
    </div>
  );
};

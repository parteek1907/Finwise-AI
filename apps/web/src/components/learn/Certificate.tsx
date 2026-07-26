import React, { useRef, useState } from 'react';
import { CheckCircle2, Download, Share2, Loader2, Sparkles, X } from 'lucide-react';
import styles from './Certificate.module.css';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  date: string;
  score: number;
}

export const Certificate: React.FC<CertificateProps> = ({ userName, courseTitle, date, score }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
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

  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [userTakeaway, setUserTakeaway] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCaption = async () => {
    setIsGenerating(true);
    try {
      const systemContext = `You are an expert copywriter. Write a LinkedIn post FROM THE FIRST-PERSON PERSPECTIVE OF THE USER ("I", "my"). The user is proudly announcing they just completed the FinWise course "${courseTitle}" with a score of ${score}%. DO NOT congratulate the user; write the exact text the user should paste into their LinkedIn status. Keep it under 3-4 sentences. Include emojis and hashtags like #FinWise #FinancialLiteracy #PersonalFinance. ${userTakeaway ? `Incorporate this specific takeaway: "${userTakeaway}".` : 'Make it engaging and celebrate the learning milestone.'}`;
      
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'system', content: systemContext }, { role: 'user', content: 'Please generate my LinkedIn caption.' }],
          userName: userName 
        }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      setGeneratedCaption(data.content);
    } catch (error) {
      console.error("Error generating caption:", error);
      setGeneratedCaption(`🎓 I just earned a Certificate of Achievement in "${courseTitle}" with a score of ${score}% on FinWise AI Academy!\n\nBuilding my financial foundation one course at a time. 📈 #FinWise #PersonalFinance #FinancialLiteracy`);
    }
    setIsGenerating(false);
  };

  const handleLinkedInShare = async () => {
    // 1. Download the certificate image first so they can attach it
    await handleDownload();

    // 2. Prepare the text with optional profile link
    let finalText = generatedCaption;
    if (linkedinProfile.trim()) {
      finalText += `\n\nLet's connect! 🤝 ${linkedinProfile.trim()}`;
    }

    // 3. Open LinkedIn share intent
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(finalText)}`;
    window.open(url, "_blank");
    setShowLinkedInModal(false);
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className={styles.certificateRoot} ref={certificateRef}>
          {/* Decorative Corner Accents */}
          <div className={`${styles.corner} ${styles.cornerTL}`} />
          <div className={`${styles.corner} ${styles.cornerTR}`} />
          <div className={`${styles.corner} ${styles.cornerBL}`} />
          <div className={`${styles.corner} ${styles.cornerBR}`} />

          {/* Header */}
          <div className={styles.certHeader}>
            {/* FinWise Logo (matches sidebar exactly) */}
            <div className={styles.logoGroup}>
              <div className={styles.logoIcon} />
              <span className={styles.logoText}>FinWise</span>
            </div>
            <div className={styles.certLabel}>Academy Certificate</div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Body */}
          <div className={styles.certBody}>
            <p className={styles.certPresentedTo}>This is to certify that</p>
            <h2 className={styles.certUserName}>{userName || "FinWise User"}</h2>
            <p className={styles.certReason}>has successfully completed the course</p>
            <h3 className={styles.certCourseTitle}>{courseTitle}</h3>
          </div>

          {/* Score Badge */}
          <div className={styles.scoreBadge}>
            <CheckCircle2 size={16} className={styles.checkIcon} />
            <span>Passed with {score}% · {score >= 90 ? 'Distinction' : score >= 70 ? 'Merit' : 'Pass'}</span>
          </div>

          {/* Footer */}
          <div className={styles.divider} style={{ marginTop: 40 }} />
          <div className={styles.certFooter}>
            <div className={styles.footerBlock}>
              <div className={styles.footerSignature}>FinWise AI</div>
              <div className={styles.footerLabel}>Lead Instructor</div>
            </div>
            <div className={styles.footerSeal}>
              <div className={styles.sealRing}>
                <div className={styles.sealIcon} />
                <span className={styles.sealText}>VERIFIED</span>
              </div>
            </div>
            <div className={styles.footerBlock}>
              <div className={styles.footerDate}>{date}</div>
              <div className={styles.footerLabel}>Date of Issue</div>
            </div>
          </div>

          {/* Watermark */}
          <div className={styles.watermark}>FINWISE</div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className={styles.actionRow}
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

      {/* AI LinkedIn Modal */}
      {showLinkedInModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <button className={styles.closeModalBtn} onClick={() => setShowLinkedInModal(false)}>
              <X size={20} />
            </button>
            
            <h3>Share your achievement</h3>
            <p>Our AI mentor will draft a post for you from your perspective!</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Your LinkedIn Profile Link <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  value={linkedinProfile}
                  onChange={e => setLinkedinProfile(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={styles.takeawayInput}
                  style={{ minHeight: '40px', padding: '10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>Key Takeaway (Optional)</label>
                <textarea 
                  value={userTakeaway} 
                  onChange={e => setUserTakeaway(e.target.value)}
                  placeholder="E.g., I learned how to manage my emergency fund..."
                  className={styles.takeawayInput}
                />
              </div>
            </div>
            
            <button 
              onClick={generateCaption} 
              disabled={isGenerating || !linkedinProfile.trim()}
              className={styles.generateBtn}
            >
              {isGenerating ? <Loader2 size={16} className={styles.spin} /> : <Sparkles size={16} color="#eab308" />}
              {isGenerating ? 'Drafting caption...' : 'Generate AI Caption'}
            </button>

            {generatedCaption && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}
              >
                <div style={{ fontSize: '0.85rem', color: '#0369a1', background: '#e0f2fe', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.4 }}>
                  <strong>Finwise has drafted this post for you!</strong> You just need to review it, and when you click the button below, we'll open LinkedIn so you can post it.
                </div>
                <p style={{ fontWeight: 600, color: '#19533B' }}>Your suggested caption:</p>
                <textarea 
                  value={generatedCaption} 
                  onChange={e => setGeneratedCaption(e.target.value)}
                  className={styles.captionInput}
                />
                <div style={{ fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '8px 12px', borderRadius: '6px' }}>
                  <CheckCircle2 size={16} />
                  When you click post, your certificate image will be downloaded automatically. Please attach it to your LinkedIn post!
                </div>
                <button 
                  onClick={handleLinkedInShare} 
                  className={styles.linkedinBtn}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '14px' }}
                >
                  <Share2 size={18} /> Download Image & Post to LinkedIn
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

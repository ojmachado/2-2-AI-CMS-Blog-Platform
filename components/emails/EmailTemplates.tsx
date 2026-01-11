import React from 'react';

interface TemplateProps {
  siteName?: string;
}

// --- Styles ---
const mainStyle = {
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const containerStyle = {
  padding: '24px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '0 auto',
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  color: '#111827',
  marginBottom: '24px',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '24px',
};

const buttonStyle = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  marginTop: '24px',
  marginBottom: '24px',
};

const footerStyle = {
  fontSize: '12px',
  lineHeight: '24px',
  color: '#6b7280',
  marginTop: '48px',
};

// --- Templates ---

export interface WelcomeTemplateProps {
  name?: string;
  siteName: string;
  siteUrl: string;
}

export const WelcomeTemplate: React.FC<WelcomeTemplateProps> = ({ 
  name = 'Subscriber', 
  siteName = 'Our Blog', 
  siteUrl 
}) => {
  return (
    <div style={mainStyle}>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Welcome to {siteName}! 🎉</h1>
        
        <p style={textStyle}>
          Hello {name},
        </p>
        
        <p style={textStyle}>
          Thanks for subscribing to our newsletter. We're thrilled to have you on board!
          You will now receive the latest news, tech reviews, and editorial content directly in your inbox.
        </p>
        
        <a href={siteUrl} style={buttonStyle}>
          Start Reading
        </a>
        
        <p style={textStyle}>
          Best regards,<br />
          The {siteName} Team
        </p>
        
        <hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />
        
        <p style={footerStyle}>
          You received this email because you signed up on our website.<br/>
          If you didn't sign up, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
};

export interface AdminAlertTemplateProps {
  title: string;
  slug: string;
  status: string;
  siteUrl: string;
}

export const AdminAlertTemplate: React.FC<AdminAlertTemplateProps> = ({ title, slug, status, siteUrl }) => {
  return (
    <div style={mainStyle}>
      <div style={containerStyle}>
        <h2 style={headingStyle}>🤖 New Content Generated</h2>
        
        <p style={textStyle}>
          <strong>Gemini AI</strong> has successfully generated a new post for your blog.
        </p>
        
        <ul style={{ ...textStyle, paddingLeft: '20px' }}>
          <li><strong>Title:</strong> {title}</li>
          <li><strong>Status:</strong> {status}</li>
          <li><strong>Slug:</strong> {slug}</li>
        </ul>
        
        <a href={`${siteUrl}/#/admin/edit/${slug}`} style={buttonStyle}>
          Review & Edit Post
        </a>
        
        <p style={footerStyle}>
          This is an automated system notification from your CMS.
        </p>
      </div>
    </div>
  );
};

export const GenericNotificationTemplate: React.FC<{ message: string; siteName: string }> = ({ message, siteName }) => {
    return (
      <div style={mainStyle}>
        <div style={containerStyle}>
          <h2 style={headingStyle}>Notification from {siteName}</h2>
          <div style={{...textStyle, whiteSpace: 'pre-wrap'}}>
            {message}
          </div>
          <hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />
          <p style={footerStyle}>
            {siteName} Team
          </p>
        </div>
      </div>
    );
};
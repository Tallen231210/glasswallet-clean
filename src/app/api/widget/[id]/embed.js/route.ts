import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const widgetId = params.id;
  
  try {
    // Find widget
    const widget = await prisma.leadWidget.findFirst({
      where: { 
        id: widgetId,
        status: 'active' 
      }
    });

    if (!widget) {
      return new NextResponse(
        `console.error('GlassWallet Widget ${widgetId} not found or inactive');`,
        {
          status: 404,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const settings = widget.settings as any;
    const { fields, styling, behavior } = settings;
    
    // Generate widget JavaScript with current settings
    const widgetJS = `
(function() {
  'use strict';
  
  // GlassWallet Widget Configuration
  const WIDGET_ID = '${widgetId}';
  const API_URL = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/widget/lead-capture';
  
  const config = ${JSON.stringify({ fields, styling, behavior }, null, 2)};
  
  // Widget HTML Template
  const createWidgetHTML = () => {
    const formFields = config.fields.map(field => {
      switch(field.type) {
        case 'select':
          const options = field.options.map(opt => 
            \`<option value="\${opt}">\${opt}</option>\`
          ).join('');
          return \`
            <div class="gw-field-group">
              <label class="gw-label">\${field.label}\${field.required ? ' *' : ''}</label>
              <select name="\${field.name}" class="gw-input gw-select" \${field.required ? 'required' : ''}>
                <option value="">Select...</option>
                \${options}
              </select>
            </div>
          \`;
        case 'textarea':
          return \`
            <div class="gw-field-group">
              <label class="gw-label">\${field.label}\${field.required ? ' *' : ''}</label>
              <textarea 
                name="\${field.name}" 
                class="gw-input gw-textarea" 
                placeholder="\${field.placeholder || ''}"
                \${field.required ? 'required' : ''}
              ></textarea>
            </div>
          \`;
        default:
          return \`
            <div class="gw-field-group">
              <label class="gw-label">\${field.label}\${field.required ? ' *' : ''}</label>
              <input 
                type="\${field.type}" 
                name="\${field.name}" 
                class="gw-input" 
                placeholder="\${field.placeholder || ''}"
                \${field.required ? 'required' : ''}
              />
            </div>
          \`;
      }
    }).join('');
    
    return \`
      <div class="gw-widget gw-theme-\${config.styling.theme}" id="gw-\${WIDGET_ID}">
        <form class="gw-form" id="gw-form-\${WIDGET_ID}">
          <div class="gw-header">
            <h3 class="gw-title">Get Started</h3>
            <p class="gw-subtitle">Fill out the form below and we'll get back to you.</p>
          </div>
          
          <div class="gw-fields">
            \${formFields}
          </div>
          
          <div class="gw-actions">
            <button type="submit" class="gw-submit-btn">
              <span class="gw-btn-text">Submit</span>
              <span class="gw-btn-loading" style="display: none;">
                <svg class="gw-spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                        d="M12 2a10 10 0 0 1 10 10" opacity="0.8"/>
                </svg>
                Processing...
              </span>
            </button>
          </div>
          
          <div class="gw-footer">
            <p class="gw-powered">Powered by <a href="https://glasswallet.com" target="_blank">GlassWallet</a></p>
          </div>
        </form>
        
        <div class="gw-success-message" id="gw-success-\${WIDGET_ID}" style="display: none;">
          <div class="gw-success-icon">✓</div>
          <h3 class="gw-success-title">Thank You!</h3>
          <p class="gw-success-text">We've received your information and will get back to you soon.</p>
        </div>
      </div>
    \`;
  };
  
  // Widget CSS Styles
  const createWidgetCSS = () => {
    const { primaryColor, borderRadius, width, height, theme } = config.styling;
    
    return \`
      <style id="gw-styles-\${WIDGET_ID}">
        .gw-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: \${width}px;
          width: 100%;
          margin: 0 auto;
          border-radius: \${borderRadius}px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gw-theme-glass {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        
        .gw-theme-light {
          background: white;
          color: #333;
        }
        
        .gw-theme-dark {
          background: #1a1a1a;
          color: white;
        }
        
        .gw-form {
          padding: 24px;
        }
        
        .gw-header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .gw-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .gw-subtitle {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
        
        .gw-field-group {
          margin-bottom: 16px;
        }
        
        .gw-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .gw-input, .gw-select, .gw-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: \${borderRadius * 0.5}px;
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          font-size: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .gw-input:focus, .gw-select:focus, .gw-textarea:focus {
          outline: none;
          border-color: \${primaryColor};
          box-shadow: 0 0 0 2px \${primaryColor}33;
        }
        
        .gw-textarea {
          min-height: 80px;
          resize: vertical;
        }
        
        .gw-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: \${primaryColor};
          color: white;
          border: none;
          border-radius: \${borderRadius * 0.5}px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .gw-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px \${primaryColor}40;
        }
        
        .gw-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .gw-btn-loading {
          display: flex !important;
          align-items: center;
          gap: 8px;
        }
        
        .gw-spinner {
          width: 16px;
          height: 16px;
          animation: gw-spin 1s linear infinite;
        }
        
        @keyframes gw-spin {
          to { transform: rotate(360deg); }
        }
        
        .gw-success-message {
          padding: 40px 24px;
          text-align: center;
        }
        
        .gw-success-icon {
          width: 60px;
          height: 60px;
          background: \${primaryColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px auto;
        }
        
        .gw-success-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .gw-success-text {
          margin: 0;
          opacity: 0.8;
        }
        
        .gw-footer {
          text-align: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gw-powered {
          margin: 0;
          font-size: 12px;
          opacity: 0.6;
        }
        
        .gw-powered a {
          color: \${primaryColor};
          text-decoration: none;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .gw-widget {
            max-width: 100%;
            border-radius: 0;
          }
          
          .gw-form {
            padding: 16px;
          }
        }
      </style>
    \`;
  };
  
  // Form submission handler
  const handleSubmit = async (form) => {
    const submitBtn = form.querySelector('.gw-submit-btn');
    const btnText = form.querySelector('.gw-btn-text');
    const btnLoading = form.querySelector('.gw-btn-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    try {
      const formData = new FormData(form);
      const leadData = {
        firstName: formData.get('firstName') || formData.get('name') || '',
        lastName: formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        source: 'widget',
        customFields: {},
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ip: '', // Will be populated server-side
          timestamp: new Date().toISOString()
        }
      };
      
      // Add custom fields
      for (const [key, value] of formData.entries()) {
        if (!['firstName', 'lastName', 'email', 'phone'].includes(key)) {
          leadData.customFields[key] = value;
        }
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgetId: WIDGET_ID,
          leadData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        form.style.display = 'none';
        document.getElementById(\`gw-success-\${WIDGET_ID}\`).style.display = 'block';
        
        // Handle redirect or auto-close
        if (config.behavior.redirectUrl) {
          setTimeout(() => {
            window.location.href = config.behavior.redirectUrl;
          }, config.behavior.closeDelay * 1000);
        } else if (config.behavior.autoClose) {
          setTimeout(() => {
            const widget = document.getElementById(\`gw-\${WIDGET_ID}\`);
            if (widget && widget.parentNode) {
              widget.parentNode.removeChild(widget);
            }
          }, config.behavior.closeDelay * 1000);
        }
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('glassWalletLeadCaptured', {
          detail: { leadId: result.data.leadId, tags: result.data.appliedTags }
        }));
        
        // Track widget conversion
        if (window.gtag) {
          window.gtag('event', 'lead_capture', {
            'custom_parameter': WIDGET_ID
          });
        }
        
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
      
    } catch (error) {
      console.error('GlassWallet Widget Error:', error);
      alert('Sorry, there was an error submitting your information. Please try again.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  };
  
  // Initialize widget
  const initWidget = () => {
    const containers = document.querySelectorAll('[data-widget-id="${widgetId}"]');
    
    containers.forEach(container => {
      // Add CSS
      if (!document.getElementById(\`gw-styles-\${WIDGET_ID}\`)) {
        document.head.insertAdjacentHTML('beforeend', createWidgetCSS());
      }
      
      // Add HTML
      container.innerHTML = createWidgetHTML();
      
      // Add form handler
      const form = container.querySelector('.gw-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleSubmit(form);
        });
      }
    });
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
  
  // Expose for manual initialization
  window.GlassWalletWidget = window.GlassWalletWidget || [];
  window.GlassWalletWidget.push({
    id: WIDGET_ID,
    init: initWidget
  });
  
})();
    `;

    return new NextResponse(widgetJS, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Widget embed error:', error);
    return new NextResponse(
      `console.error('GlassWallet Widget Error: ${error}');`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
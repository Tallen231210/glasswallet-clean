/**
 * GlassWallet Lead Integration Widget
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="https://glasswallet.io/widget.js"></script>
 * <script>
 *   GlassWallet.init({
 *     apiKey: 'your_api_key_here',
 *     autoCheck: true,
 *     consentRequired: true,
 *     webhook: 'https://your-crm.com/webhook',
 *     autoTag: {
 *       whitelist: { minCreditScore: 720, minIncome: 80000 },
 *       blacklist: { maxCreditScore: 580, maxIncome: 30000 }
 *     }
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  // Prevent multiple initialization
  if (window.GlassWallet) {
    return;
  }

  // Configuration defaults
  const DEFAULT_CONFIG = {
    apiKey: null,
    clientId: null,
    baseUrl: 'https://glasswallet.io',
    autoCheck: true,
    consentRequired: true,
    webhook: null,
    debug: false,
    autoTag: {
      whitelist: { minCreditScore: 720, minIncome: 80000 },
      blacklist: { maxCreditScore: 580, maxIncome: 30000 }
    }
  };

  let config = { ...DEFAULT_CONFIG };
  let initialized = false;

  // Utility functions
  function log(...args) {
    if (config.debug) {
      console.log('[GlassWallet Widget]', ...args);
    }
  }

  function error(...args) {
    console.error('[GlassWallet Widget]', ...args);
  }

  // Create FCRA consent checkbox
  function createConsentCheckbox(form, leadData) {
    const existingConsent = form.querySelector('.glasswallet-consent');
    if (existingConsent) {
      return existingConsent.querySelector('input[type="checkbox"]');
    }

    const consentContainer = document.createElement('div');
    consentContainer.className = 'glasswallet-consent';
    consentContainer.style.cssText = `
      margin: 15px 0;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f8f9fa;
      font-size: 14px;
      line-height: 1.4;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'glasswallet-consent-' + Math.random().toString(36).substr(2, 9);
    checkbox.required = true;
    checkbox.style.cssText = 'margin-right: 8px; transform: scale(1.2);';

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.innerHTML = `
      I authorize <strong>${window.location.hostname}</strong> to obtain my consumer credit report 
      from a consumer reporting agency for pre-qualification purposes. I understand that this 
      authorization will result in a soft credit inquiry that will not affect my credit score.
    `;
    label.style.cursor = 'pointer';

    consentContainer.appendChild(checkbox);
    consentContainer.appendChild(label);

    // Insert before submit button or at end of form
    const submitButton = form.querySelector('input[type="submit"], button[type="submit"], button:not([type])');
    if (submitButton) {
      form.insertBefore(consentContainer, submitButton);
    } else {
      form.appendChild(consentContainer);
    }

    return checkbox;
  }

  // Create loading overlay
  function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'glasswallet-loading';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        color: white;
        backdrop-filter: blur(10px);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #00ff88;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: glasswallet-spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <div style="font-size: 16px; font-weight: 500;">
          Processing Credit Check...
        </div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
          This may take a few seconds
        </div>
      </div>
    `;

    // Add keyframe animation
    if (!document.querySelector('#glasswallet-styles')) {
      const styles = document.createElement('style');
      styles.id = 'glasswallet-styles';
      styles.textContent = `
        @keyframes glasswallet-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styles);
    }

    return overlay;
  }

  // Show result notification
  function showResult(success, message, leadData) {
    const notification = document.createElement('div');
    notification.className = 'glasswallet-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      padding: 20px;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      line-height: 1.5;
      z-index: 10001;
      backdrop-filter: blur(10px);
      border: 1px solid ${success ? '#00ff88' : '#ef4444'};
      background: ${success 
        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'
      };
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: glasswallet-slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 20px;">
          ${success ? '✅' : '❌'}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 5px;">
            ${success ? 'Credit Check Complete' : 'Credit Check Failed'}
          </div>
          <div style="opacity: 0.9;">
            ${message}
          </div>
          ${leadData && success ? `
            <div style="margin-top: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 6px;">
              <div><strong>Credit Score:</strong> ${leadData.credit_score}</div>
              <div><strong>Status:</strong> ${leadData.qualification}</div>
              ${leadData.lead_quality !== 'untagged' ? `<div><strong>Quality:</strong> ${leadData.lead_quality}</div>` : ''}
            </div>
          ` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
    `;

    // Add slide-in animation
    if (!document.querySelector('#glasswallet-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'glasswallet-notification-styles';
      styles.textContent = `
        @keyframes glasswallet-slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  // Extract lead data from form
  function extractLeadData(form) {
    const formData = new FormData(form);
    const data = {};

    // Common field mappings
    const fieldMap = {
      name: ['name', 'full_name', 'fullname', 'first_name', 'fname'],
      email: ['email', 'email_address', 'e_mail'],
      phone: ['phone', 'phone_number', 'telephone', 'mobile']
    };

    // Try to extract name, email, phone
    for (const [key, alternatives] of Object.entries(fieldMap)) {
      for (const alt of alternatives) {
        if (formData.get(alt)) {
          data[key] = formData.get(alt);
          break;
        }
      }
    }

    // If no name found but first_name and last_name exist
    if (!data.name) {
      const firstName = formData.get('first_name') || formData.get('fname');
      const lastName = formData.get('last_name') || formData.get('lname');
      if (firstName || lastName) {
        data.name = `${firstName || ''} ${lastName || ''}`.trim();
      }
    }

    log('Extracted lead data:', data);
    return data;
  }

  // Submit lead to GlassWallet API
  async function submitLead(leadData, form) {
    const overlay = createLoadingOverlay();
    document.body.appendChild(overlay);

    try {
      const payload = {
        client_id: config.clientId || window.location.hostname,
        api_key: config.apiKey,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        consent: true,
        source: 'widget',
        webhook_url: config.webhook,
        timestamp: new Date().toISOString()
      };

      log('Submitting lead:', payload);

      const response = await fetch(`${config.baseUrl}/api/integrate/widget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        log('Lead processed successfully:', result.lead);
        showResult(true, 'Your information has been processed successfully!', result.lead);
        
        // Trigger success callback if provided
        if (typeof config.onSuccess === 'function') {
          config.onSuccess(result.lead);
        }

        // Continue with original form submission if configured
        if (config.allowOriginalSubmit !== false) {
          // Remove our consent checkbox to avoid duplicate submission
          const consentBox = form.querySelector('.glasswallet-consent');
          if (consentBox) {
            consentBox.remove();
          }
          return true;
        }
      } else {
        throw new Error(result.error || 'Credit check failed');
      }

    } catch (err) {
      error('Lead submission failed:', err);
      showResult(false, err.message || 'An error occurred during processing');
      
      // Trigger error callback if provided
      if (typeof config.onError === 'function') {
        config.onError(err);
      }
      
      return false;
    } finally {
      overlay.remove();
    }
  }

  // Form submission handler
  function handleFormSubmit(event) {
    if (!config.autoCheck) return;

    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    const leadData = extractLeadData(form);

    // Validate required fields
    if (!leadData.name || !leadData.email) {
      showResult(false, 'Please fill in all required fields (name and email)');
      return false;
    }

    // Check consent if required
    if (config.consentRequired) {
      const consentBox = form.querySelector('.glasswallet-consent input[type="checkbox"]');
      if (!consentBox || !consentBox.checked) {
        showResult(false, 'Please provide consent for credit check authorization');
        return false;
      }
    }

    // Submit to GlassWallet
    submitLead(leadData, form).then(success => {
      if (success && config.allowOriginalSubmit !== false) {
        // Remove our event listener and resubmit
        form.removeEventListener('submit', handleFormSubmit);
        form.submit();
      }
    });

    return false;
  }

  // Auto-detect and enhance forms
  function enhanceForms() {
    const forms = document.querySelectorAll('form');
    log(`Found ${forms.length} forms to enhance`);

    forms.forEach((form, index) => {
      // Skip if already enhanced
      if (form.hasAttribute('data-glasswallet-enhanced')) {
        return;
      }

      // Look for email fields as indicator this might be a lead form
      const emailField = form.querySelector('input[type="email"], input[name*="email"]');
      if (!emailField) {
        return;
      }

      log(`Enhancing form ${index + 1}`);

      // Mark as enhanced
      form.setAttribute('data-glasswallet-enhanced', 'true');

      // Add consent checkbox if required
      if (config.consentRequired) {
        createConsentCheckbox(form, {});
      }

      // Add form submit listener
      form.addEventListener('submit', handleFormSubmit);
    });
  }

  // Public API
  window.GlassWallet = {
    init: function(options = {}) {
      if (initialized) {
        log('Already initialized');
        return;
      }

      // Merge config
      config = { ...DEFAULT_CONFIG, ...options };

      // Validate required options
      if (!config.apiKey) {
        error('API key is required');
        return false;
      }

      initialized = true;
      log('Initialized with config:', { ...config, apiKey: '***' });

      // Auto-enhance existing forms
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceForms);
      } else {
        enhanceForms();
      }

      // Watch for dynamically added forms
      if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1 && (node.tagName === 'FORM' || node.querySelector('form'))) {
                setTimeout(enhanceForms, 100); // Small delay to allow form to fully render
              }
            });
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }

      return true;
    },

    // Manual form enhancement
    enhanceForm: function(formSelector) {
      const form = typeof formSelector === 'string' 
        ? document.querySelector(formSelector)
        : formSelector;

      if (!form || form.tagName !== 'FORM') {
        error('Invalid form selector');
        return false;
      }

      if (config.consentRequired) {
        createConsentCheckbox(form, {});
      }

      form.addEventListener('submit', handleFormSubmit);
      form.setAttribute('data-glasswallet-enhanced', 'true');

      log('Manually enhanced form:', form);
      return true;
    },

    // Manual lead submission
    submitLead: function(leadData, callback) {
      if (!initialized) {
        error('Widget not initialized');
        return;
      }

      submitLead(leadData, null).then(success => {
        if (callback) callback(success);
      });
    },

    // Health check
    healthCheck: async function() {
      try {
        const response = await fetch(`${config.baseUrl}/api/integrate/health?api_key=${config.apiKey}&client_id=${config.clientId || window.location.hostname}`);
        return await response.json();
      } catch (err) {
        error('Health check failed:', err);
        return { status: 'error', error: err.message };
      }
    },

    // Configuration
    config: function(key, value) {
      if (arguments.length === 0) {
        return { ...config, apiKey: '***' };
      }
      if (arguments.length === 1) {
        return config[key];
      }
      config[key] = value;
      log(`Config updated: ${key} =`, value);
    },

    version: '1.0.0'
  };

  log('GlassWallet Widget loaded');

})(window);
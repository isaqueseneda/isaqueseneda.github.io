class WhatsAppButton extends HTMLElement {
    constructor() {
      super();
  
      const shadow = this.attachShadow({ mode: 'open' });
  
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'whatsapp-button');
  
      const icon = document.createElement('span');
      icon.setAttribute('class', 'icon');
      icon.textContent = '💬';
  
      const ctaText = document.createElement('span');
      ctaText.setAttribute('class', 'cta-text');
      ctaText.textContent = 'Questions?';
  
      wrapper.appendChild(icon);
      wrapper.appendChild(ctaText);
  
      const style = document.createElement('style');
      style.textContent = `
        .whatsapp-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #25D366;
          border-radius: 50px;
          padding: 15px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          transition: background-color 0.3s;
        }
        .whatsapp-button:hover {
          background-color: #1ebe57;
        }
        .whatsapp-button .icon {
          font-size: 24px;
          margin-right: 10px;
        }
        .whatsapp-button .cta-text {
          font-size: 16px;
          color: #ffffff;
          font-family: Arial, sans-serif;
        }
      `;
  
      wrapper.addEventListener('click', () => {
        window.location.href = 'https://wa.me/31646555655';
      });
  
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
    }
  }
  
  window.customElements.define('whatsapp-button', WhatsAppButton);
  
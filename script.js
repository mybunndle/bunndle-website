/* =============================================
   BUNNDLE – script.js
   All dynamic content is driven by assets.js
   ============================================= */

/* ---- Inject ASSETS into the DOM ---- */
(function applyAssets() {

  // 0. Logo — use image if set, fallback to text
  ['navLogo', 'footerLogo'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const img  = el.querySelector('.logo-img');
    const text = el.querySelector('.logo-text');
    if (ASSETS.logo) {
      img.src          = ASSETS.logo;
      img.style.display  = 'block';
      text.style.display = 'none';
    } else {
      img.style.display  = 'none';
      text.style.display = 'inline';
    }
  });
  document.querySelectorAll('[data-social]').forEach(el => {
    const key = el.getAttribute('data-social');
    if (ASSETS.social[key]) {
      el.href = ASSETS.social[key];
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  });

  // 2. Contact info
  document.querySelectorAll('[data-contact]').forEach(el => {
    const key = el.getAttribute('data-contact');
    if (ASSETS.contact[key]) el.textContent = ASSETS.contact[key];
  });

  // 3. Car showcase cards
  const carCards = document.querySelectorAll('[data-car-index]');
  carCards.forEach(card => {
    const i   = parseInt(card.getAttribute('data-car-index'));
    const car = ASSETS.cars[i];
    if (!car) return;
    const imgWrap = card.querySelector('.car-img-wrap');
    const h3      = card.querySelector('h3');
    const desc    = card.querySelector('.car-desc');
    const rent    = card.querySelector('.rent-badge');
    if (h3)   h3.textContent   = car.label;
    if (desc) desc.textContent = car.desc;
    if (rent) rent.textContent = car.rent;
    if (imgWrap) {
      if (car.src) {
        imgWrap.innerHTML = `<img src="${car.src}" alt="${car.label}" />`;
      } else {
        imgWrap.innerHTML = `<div class="img-placeholder car-img-placeholder"><span>${car.label}</span></div>`;
      }
    }
  });

  // 4. Carousel slides — built from ASSETS.carousel
  const track = document.getElementById('carouselTrack');
  if (track) {
    track.innerHTML = ASSETS.carousel.map(item => {
      const inner = item.src
        ? `<img src="${item.src}" alt="${item.label}" />`
        : `<div class="img-placeholder carousel-placeholder"><span>${item.label}</span></div>`;
      return `<div class="carousel-slide">${inner}</div>`;
    }).join('');
  }

  // 5. List Your Car banner
  const bannerEl = document.getElementById('listCarBanner');
  if (bannerEl && ASSETS.promoBanner && ASSETS.promoBanner.src) {
    bannerEl.innerHTML = `<img src="${ASSETS.promoBanner.src}" alt="${ASSETS.promoBanner.label || 'Banner'}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />`;
    bannerEl.classList.remove('img-placeholder');
    bannerEl.style.background = 'none';
    bannerEl.style.border = 'none';
  }

})();

/* ---- Navbar scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- Hamburger menu ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ---- Smooth scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Fade-in on scroll ---- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ---- EmailJS + Google Sheets Contact Form ---- */
(function () {

  // ============================================
  // EMAILJS CREDENTIALS
  // ============================================
  const EMAILJS_PUBLIC_KEY   = 'u6OKb8Nzixhz3xcUz';
  const EMAILJS_SERVICE_ID   = 'service_2zmoif1';
  const EMAILJS_TEMPLATE_ID  = 'template_4x63ueg';   // notification → you
  const EMAILJS_AUTOREPLY_ID = 'template_d2b935o';   // confirmation → user
  // ============================================

  // ============================================
  // GOOGLE SHEETS WEB APP URL
  // Paste your deployed Apps Script URL here
  // ============================================
  const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxiE1EvbGaeYwPIMD_bBiNcKEnsht6z3VM-cpvimPDRS1X-hPtrcs1_4uxquVAQ6c63/exec';
  // ============================================

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');
  const btnLoader  = document.getElementById('btnLoader');
  const successBox = document.getElementById('formSuccess');
  const errorBox   = document.getElementById('formError');

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) { return /^[0-9]{10}$/.test(v.trim()); }

  function clearErrors() {
    form.querySelectorAll('input, textarea, select').forEach(el => el.style.borderColor = '');
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    successBox.hidden = true;
    errorBox.hidden   = true;
  }

  function showFieldError(input, msg) {
    input.style.borderColor = '#ef4444';
    const hint = document.createElement('span');
    hint.className = 'field-error';
    hint.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:4px;display:block;';
    hint.textContent = msg;
    input.parentElement.appendChild(hint);
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    btnText.hidden     = on;
    btnLoader.hidden   = !on;
  }

  // Send data to Google Sheets (non-blocking — won't fail the form if sheet fails)
  async function saveToSheets(data) {
    try {
      await fetch(SHEETS_URL, {
        method  : 'POST',
        mode    : 'no-cors',   // required for Google Apps Script
        headers : { 'Content-Type': 'text/plain' },
        body    : JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Google Sheets save failed (non-critical):', err);
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const purpose = form.elements['purpose'].value;
    const name    = form.elements['name'].value.trim();
    const email   = form.elements['email'].value.trim();
    const phone   = form.elements['phone'].value.trim();
    const message = form.elements['message'].value.trim();

    let hasError = false;
    if (!purpose) { showFieldError(form.elements['purpose'], 'Please select a purpose.'); hasError = true; }
    if (!name)    { showFieldError(form.elements['name'],    'Full name is required.');    hasError = true; }
    if (!email || !isValidEmail(email)) { showFieldError(form.elements['email'], 'Enter a valid email address (e.g. name@example.com).'); hasError = true; }
    if (!phone || !isValidPhone(phone)) { showFieldError(form.elements['phone'], 'Enter a valid 10-digit phone number.');  hasError = true; }
    if (!message) { showFieldError(form.elements['message'], 'Please enter your message.'); hasError = true; }
    if (hasError) return;

    setLoading(true);

    const purposeLabel =
      purpose === 'lease' ? 'Lease a car from Bunndle' :
      purpose === 'list'  ? 'List my car with Bunndle'  : 'General enquiry';

    const templateParams = {
      purpose    : purposeLabel,
      from_name  : name,
      from_email : email,
      phone      : phone,
      message    : message,
    };

    const sheetsData = {
      purpose, name, email, phone, message,
    };

    try {
      // Run EmailJS + Sheets in parallel
      await Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_ID, templateParams),
        saveToSheets(sheetsData),
      ]);

      successBox.hidden = false;
      form.reset();
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('Submit error:', err);
      errorBox.hidden = false;
    } finally {
      setLoading(false);
    }
  });
})();

/* ---- Hero Carousel ---- */
(function () {
  const carousel  = document.getElementById('heroCarousel');
  const track     = document.getElementById('carouselTrack');
  const dotsWrap  = document.getElementById('carouselDots');
  const prevBtn   = document.getElementById('carouselPrev');
  const nextBtn   = document.getElementById('carouselNext');
  let current     = 0;
  let autoTimer   = null;

  function getSlides() { return track.querySelectorAll('.carousel-slide'); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    getSlides().forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(index) {
    const total = getSlides().length;
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { autoTimer = setInterval(next, 3500); }
  function stopAuto()  { clearInterval(autoTimer); }

  // Init after applyAssets() has built the slides
  buildDots();
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  startAuto();

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // Swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    startAuto();
  }, { passive: true });
})();

/* ---- Chatbot Widget ---- */
(function () {
  const widget = document.getElementById('chatbotWidget');
  const toggle = document.getElementById('chatbotToggle');
  const window_el = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const messagesContainer = document.getElementById('chatbotMessages');
  const optionsContainer = document.getElementById('chatbotOptions');

  let currentState = 'welcome';
  let userName = '';

  const botResponses = {
    welcome: {
      message: 'Hi 👋 Welcome to Bunndle\n\nEarn fixed monthly income by leasing your car with us 🚗💰\n\nPlease choose an option:',
      options: [
        { label: '1️⃣ Lease my car', action: 'option1' },
        { label: '2️⃣ How it works', action: 'option2' },
        { label: '3️⃣ Rental estimate', action: 'option3' },
        { label: '4️⃣ Documents required', action: 'option4' },
        { label: '5️⃣ Talk to executive', action: 'option5' },
        { label: '6️⃣ FAQ', action: 'faq_menu' }
      ]
    },
    faq_menu: {
      message: 'Frequently Asked Questions 📚\n\nChoose a category to learn more:',
      options: [
        { label: '🔹 Basic Understanding', action: 'faq_basic' },
        { label: '💰 Payments & Earnings', action: 'faq_payments' },
        { label: '📄 Documents & Agreement', action: 'faq_documents' },
        { label: '🚗 Vehicle Usage & Safety', action: 'faq_usage' },
        { label: '🛠 Maintenance & Responsibility', action: 'faq_maintenance' },
        { label: '🔄 Flexibility & Exit', action: 'faq_flexibility' },
        { label: '📍 Onboarding Process', action: 'faq_onboarding' },
        { label: '⚠️ Important Points', action: 'faq_important' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_basic: {
      message: '🔹 Basic Understanding\n\n1️⃣ What is your car leasing model?\nWe lease your car from you for a fixed monthly rental. You earn steady income without worrying about daily usage or finding customers.\n\n2️⃣ Who can lease their car to you?\nAny individual, company, or fleet owner with a registered vehicle can partner with us.\n\n3️⃣ What types of cars do you accept?\nHatchbacks, Sedans, SUVs, and Premium/Luxury cars (selectively).',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_payments: {
      message: '💰 Payments & Earnings\n\n4️⃣ How much rental will I get?\nDepends on car model, year, condition & market demand. Contact us for a customized quote.\n\n5️⃣ When will I receive payment?\nMonthly payments between 5th-10th of every month.\n\n6️⃣ Is the payment fixed or variable?\nIt is FIXED monthly income, regardless of car usage.',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_documents: {
      message: '📄 Documents & Agreement\n\n7️⃣ What documents are required?\n• RC (Registration Certificate)\n• Insurance\n• PUC (Pollution Certificate)\n• Owner ID proof\n• Bank details\n\n8️⃣ Will there be a legal agreement?\nYes, a proper agreement mentioning rental amount, duration & terms.\n\n9️⃣ What is the lease duration?\nTypically 12-24 months, depending on mutual agreement.',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_usage: {
      message: '🚗 Vehicle Usage & Safety\n\n🔟 Who will use my car?\nYour car will be used by verified drivers or corporate clients.\n\n1️⃣1️⃣ Is my car insured?\nYes, insurance must be active at all times. We\'ll guide with renewals.\n\n1️⃣2️⃣ What happens in case of accident?\nInsurance claim will be processed. Repairs handled as per agreement terms.\n\n1️⃣3️⃣ Will my car be tracked?\nYes, GPS tracking may be installed for safety & monitoring.',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_maintenance: {
      message: '🛠 Maintenance & Responsibility\n\n1️⃣4️⃣ Who is responsible for maintenance?\nCompany-managed. We handle all maintenance.\n\n1️⃣5️⃣ Who pays for servicing & repairs?\nCompany will pay for all servicing and repairs.',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_flexibility: {
      message: '🔄 Flexibility & Exit\n\n1️⃣6️⃣ Can I take my car back anytime?\nEarly termination is possible with prior notice as per agreement terms.\n\n1️⃣7️⃣ What happens after lease ends?\nYou can:\n• Renew the contract\n• Take your car back\n• Upgrade to another plan',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_onboarding: {
      message: '📍 Onboarding Process\n\n1️⃣8️⃣ How do I start?\nSimple steps:\n1. Share car details (model, year, photos)\n2. Get rental quote\n3. Vehicle inspection\n4. Agreement signing\n5. Start earning!',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    faq_important: {
      message: '⚠️ Important Points\n\n1️⃣9️⃣ Will my car\'s value decrease?\nUsage may cause normal depreciation, but regular maintenance ensures good condition.\n\n2️⃣0️⃣ Why lease instead of self-driving?\n✅ Fixed income\n✅ No daily hassle\n✅ No driver management\n✅ Verified & safe usage',
      options: [
        { label: 'More FAQ Categories', action: 'faq_menu' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    option1: {
      message: 'Great! Let\'s get started 🚀\n\nPlease share the following details through the form:\n\n📌 Car Model:\n📌 Year of Manufacture:\n📌 City:\n📌 Our team will review and send you a rental offer within 24 hours.',
      options: [
        { label: 'Submit Form', action: 'submit_form' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    option1_submitted: {
      message: '✅ Thank you! Our team is reviewing your details.\n\nWe\'ll get back to you shortly with the best rental offer.',
      options: [
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    option2: {
      message: 'Here\'s how our car leasing model works:\n\n1️⃣ You give us your car\n2️⃣ We pay you fixed monthly rent 💰\n3️⃣ We manage usage & operations\n4️⃣ You enjoy hassle-free income\n\nNo daily driver issues. No tension 👍\n\nChoose next option:',
      options: [
        { label: 'Get rental estimate', action: 'option3' },
        { label: 'Start leasing', action: 'option1' },
        { label: 'Talk to executive', action: 'option5' }
      ]
    },
    option3: {
      message: 'To provide accurate rental, we need some details:\n\n📌 Car Model:\n📌 Year:\n📌 City:\n\n(Example: Fortuner 2026, Delhi)\n\nSend details through the form now 👇',
      options: [
        { label: 'Submit Form', action: 'submit_form' },
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    option3_submitted: {
      message: 'Perfect! We\'ve received your car details.\n\nOur team will send you a rental estimate within 24 hours based on your car specifications.',
      options: [
        { label: 'Back to Menu', action: 'welcome' }
      ]
    },
    option4: {
      message: 'You\'ll need the following documents:\n\n📄 RC (Registration Certificate)\n📄 Insurance (Active)\n📄 PUC Certificate\n📄 ID Proof\n📄 Bank Details\n\nSimple process. 100% transparent 👍\n\nChoose next step:',
      options: [
        { label: 'Start leasing', action: 'option1' },
        { label: 'Get rental estimate', action: 'option3' },
        { label: 'Talk to executive', action: 'option5' }
      ]
    },
    option5: {
      message: '👨‍💼 Connecting you to our executive...\n\nOr chat with us on WhatsApp:\n<a href="https://wa.me/919220576848?text=Hi%20Bunndle,%20I%20want%20to%20lease%20my%20car" target="_blank" style="display: inline-block; margin: 8px 0; padding: 10px 16px; background: #25D366; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">💬 Message on WhatsApp</a>\n\n📧 Email us: support@bunndle.in\n\nWe\'ll assist you with everything 👍',
      isHTML: true,
      options: [
        { label: 'Back to Menu', action: 'welcome' }
      ]
    }
  };

  function addMessage(text, isBot = true, isHTML = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-message ' + (isBot ? 'message-bot' : 'message-user');
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    if (isHTML) {
      textDiv.innerHTML = text;  // Support HTML content
    } else {
      textDiv.textContent = text;
    }
    
    msgDiv.appendChild(textDiv);
    messagesContainer.appendChild(msgDiv);
    
    // Auto scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }

  function showOptions(options) {
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-option-btn';
      btn.textContent = opt.label;
      btn.onclick = () => handleOptionClick(opt.action, opt.label);
      optionsContainer.appendChild(btn);
    });
  }

  function handleOptionClick(action, label) {
    // Add user message
    const displayLabel = label.replace(/^[0-9️⃣]+\s/, '');
    addMessage(displayLabel, false);

    // Check if this is a form submission
    if (action === 'submit_form') {
      addMessage('Great! Please fill out the contact form below to submit your details. After submission, you\'ll receive a confirmation message here.');
      scrollToContact();
      return;
    }

    // Update state and show response
    currentState = action;
    const response = botResponses[action];
    
    if (response) {
      setTimeout(() => {
        addMessage(response.message, true, response.isHTML);
        showOptions(response.options);
      }, 400);
    }
  }

  function scrollToContact() {
    const contact = document.getElementById('contact');
    if (contact) {
      setTimeout(() => {
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }

  function open() {
    if (!window_el) return;
    window_el.hidden = false;
    // Auto-init if messages are empty
    if (messagesContainer && messagesContainer.children.length === 0) {
      const welcomeMsg = botResponses.welcome;
      addMessage(welcomeMsg.message, true);
      showOptions(welcomeMsg.options);
    }
  }

  function close() {
    if (!window_el) return;
    window_el.hidden = true;
    // return focus to toggle for accessibility
    if (toggle && typeof toggle.focus === 'function') toggle.focus();
  }

  // Defensive: ensure elements exist before attaching handlers
  if (toggle) {
    toggle.addEventListener('click', () => {
      if (!window_el) return;
      if (window_el.hidden) open(); else close();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && window_el && !window_el.hidden) {
      close();
    }
  });
})();



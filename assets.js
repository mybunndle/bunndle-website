/* =============================================
   BUNNDLE – assets.js
   Central config for all images & social links.
   Edit here → changes reflect across the site.
   ============================================= */

const ASSETS = {

  // ── LOGO ───────────────────────────────────
  // Set path to your logo image. Leave empty '' to show text logo fallback.
  logo: 'images/bunndle_website_logo.svg',

  // ── HERO CAROUSEL ──────────────────────────
  // Replace the src values with your image paths or URLs.
  // Label is shown as alt text.
  carousel: [
    { src: 'images/banner_1.png',  label: 'Car Image 1' },
    { src: 'images/banner_2.png',  label: 'Car Image 2' },
    { src: 'images/banner_3.png',  label: 'Car Image 3' },
    { src: 'images/banner_4.png',  label: 'Car Image 4' },
    { src: 'images/banner_5.png',  label: 'Car Image 5' },
  ],

  // ── CAR SHOWCASE CARDS ─────────────────────
  cars: [
    { src: 'images/car_fortuner.png', label: 'SUV – Premium',    desc: 'Ideal for corporate & daily commute',    rent: '₹1.1 Lakh/month' },
    { src: 'images/car_creta.png', label: 'SUV – Executive',    desc: 'Perfect for long-term & family leasing', rent: '₹0.5 Lakh/month' },
    { src: 'images/car_baleno.png', label: 'Hatchback – Compact',desc: 'Great for city commutes & short trips',  rent: '₹0.3 Lakh/month' },
  ],

  // ── PROMO / LIST-YOUR-CAR BANNER ───────────
  promoBanner: { src: 'images/list_your_car.png', label: 'Promotional Banner' },

  // ── SOCIAL MEDIA LINKS ─────────────────────
  // Replace '#' with your actual profile URLs.
  social: {
    instagram : 'https://www.instagram.com/bunndleindia',
    whatsapp  : 'https://wa.me/919220576848',  
    facebook  : 'https://www.facebook.com/profile.php?id=61574308196817',
    linkedin  : 'https://www.linkedin.com/in/bunndel-group',
    twitter   : 'https://x.com/BunndleIndia',
  },

  // ── CONTACT INFO ───────────────────────────
  contact: {
    phone   : '+91 92205 76848',
    email   : 'support@bunndle.in',
    website : 'www.bunndle.in',
  },

};

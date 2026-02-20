/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Service = {
  id: string;
  name: string;
  icon: string;
  description: string;
  pricingType: "dimension" | "quantity";
};

type Dimension = {
  label: string;
  price: number;
};

type Review = {
  name: string;
  role: string;
  text: string;
  rating: number;
};

type PortfolioItem = {
  title: string;
  category: string;
  color: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  { id: "banners", name: "Banners", icon: "🏳️", description: "Large-format vinyl banners for indoor & outdoor events, shops, and promotions.", pricingType: "dimension" },
  { id: "posters", name: "Posters", icon: "🖼️", description: "High-resolution posters on glossy or matte finish for advertising and décor.", pricingType: "dimension" },
  { id: "signage", name: "2D | 3D Signage", icon: "📌", description: "Custom flat and dimensional signs for businesses, offices, and retail spaces.", pricingType: "quantity" },
  { id: "sublimation", name: "Sublimation", icon: "👕", description: "Full-colour sublimation printing on mugs, jerseys, caps, phone cases & more.", pricingType: "quantity" },
  { id: "plotting", name: "Plotting & Vinyl Cutting", icon: "✂️", description: "Precision-cut vinyl decals, stickers, and vehicle wraps in any shape or colour.", pricingType: "quantity" },
  { id: "business-cards", name: "Business Cards", icon: "💼", description: "Premium business cards – glossy, matte, spot UV, or textured finishes.", pricingType: "quantity" },
  { id: "heat-press", name: "Heat Press", icon: "🔥", description: "Transfer printing on t-shirts, hoodies, bags, and other fabric items.", pricingType: "quantity" },
  { id: "dtf", name: "DTF No-Cut", icon: "🎨", description: "Direct-to-film transfers with vivid colours on any garment without weeding.", pricingType: "quantity" },
];

const BANNER_DIMENSIONS: Dimension[] = [
  { label: '1ft × 1ft', price: 300 },
  { label: '2ft × 1ft', price: 500 },
  { label: '3ft × 2ft', price: 900 },
  { label: '4ft × 2ft', price: 1400 },
  { label: '5ft × 3ft', price: 2200 },
  { label: '6ft × 3ft', price: 2800 },
  { label: '8ft × 4ft', price: 4500 },
  { label: '10ft × 5ft', price: 7000 },
  { label: 'Custom', price: 0 },
];

const POSTER_DIMENSIONS: Dimension[] = [
  { label: 'A4 (21×29.7cm)', price: 150 },
  { label: 'A3 (29.7×42cm)', price: 250 },
  { label: 'A2 (42×59.4cm)', price: 450 },
  { label: 'A1 (59.4×84.1cm)', price: 800 },
  { label: 'A0 (84.1×118.9cm)', price: 1400 },
  { label: '18×24 in', price: 600 },
  { label: '24×36 in', price: 1100 },
  { label: 'Custom', price: 0 },
];

const QUANTITY_PRICING: Record<string, { base: number; unit: string }> = {
  signage: { base: 1500, unit: "piece" },
  sublimation: { base: 350, unit: "piece" },
  plotting: { base: 200, unit: "sq ft" },
  "business-cards": { base: 800, unit: "100 cards" },
  "heat-press": { base: 300, unit: "piece" },
  dtf: { base: 250, unit: "piece" },
};

const REVIEWS: Review[] = [
  { name: "Aisha Kamau", role: "Event Organiser, Nairobi", text: "Frankstat delivered 50 banners overnight for our conference. Absolutely stunning quality — every colour popped perfectly!", rating: 5 },
  { name: "Brian Otieno", role: "Retail Shop Owner", text: "My shop signage looks incredible. The 3D letters really make the facade stand out. Customers keep complimenting it.", rating: 5 },
  { name: "Cynthia Wanjiku", role: "HR Manager, Safaricom", text: "We order branded merchandise quarterly. Frankstat's sublimation work is consistently world-class. Never missed a deadline.", rating: 5 },
  { name: "David Mwangi", role: "Startup Founder", text: "Got 500 business cards with spot UV. Feels premium, looks premium. My clients always ask where I printed them.", rating: 5 },
];

const PORTFOLIO: PortfolioItem[] = [
  { title: "Rift Valley Marathon Banners", category: "Banners", color: "#C17B3F" },
  { title: "Westgate Mall 3D Signage", category: "3D Signage", color: "#8B7355" },
  { title: "Corporate Jersey Set – 200 pcs", category: "Sublimation", color: "#A0522D" },
  { title: "Food Court Vinyl Wraps", category: "Vinyl Cutting", color: "#CD853F" },
  { title: "Tech Startup Business Cards", category: "Business Cards", color: "#8B6914" },
  { title: "School Sports Kit – Heat Press", category: "Heat Press", color: "#B8860B" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FrankstatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState({
    service: "",
    dimension: "",
    customW: "",
    customH: "",
    quantity: 1,
    paperType: "glossy",
    imageFile: null as File | null,
    mpesa: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

  const formRef = useRef<HTMLDivElement>(null);

  // Auto-scroll reviews
  useEffect(() => {
    const t = setInterval(() => setActiveReview(p => (p + 1) % REVIEWS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Pricing calculator
  useEffect(() => {
    const svc = SERVICES.find(s => s.id === formData.service);
    if (!svc) { setTotalPrice(0); setDeposit(0); return; }

    let unit = 0;
    if (svc.pricingType === "dimension") {
      const dims = svc.id === "banners" ? BANNER_DIMENSIONS : POSTER_DIMENSIONS;
      const dim = dims.find(d => d.label === formData.dimension);
      unit = dim ? dim.price : 0;
    } else {
      unit = QUANTITY_PRICING[svc.id]?.base ?? 0;
    }

    const total = unit * formData.quantity;
    setTotalPrice(total);
    setDeposit(Math.ceil(total / 2));
  }, [formData.service, formData.dimension, formData.quantity]);

  const selectedService = SERVICES.find(s => s.id === formData.service);
  const dimensions = formData.service === "banners" ? BANNER_DIMENSIONS : POSTER_DIMENSIONS;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setActiveSection(id);
  };

  const handleOrder = (serviceId: string) => {
    setFormData(f => ({ ...f, service: serviceId }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --cream: #F5EFE6;
          --cream-dark: #EDE3D4;
          --cream-deeper: #D9CAAF;
          --white: #FFFFFF;
          --ink: #1C1410;
          --brown: #8B5E3C;
          --gold: #C19A4A;
          --gold-light: #E8C97A;
          --shadow: rgba(28,20,16,0.12);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          font-family: 'monospace', sans-serif;
          background: var(--cream);
          color: var(--ink);
          overflow-x: hidden;
        }

        h1, h2, h3 { font-family: 'Lucida sans', serif; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(245,239,230,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--cream-deeper);
          padding: 0 5vw;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }
        .nav-logo {
          font-family: Monospace, serif;
          font-size: 1.5rem; font-weight: 900;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .nav-logo span { color: var(--gold); }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a {
          font-size: 0.85rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink); text-decoration: none;
          opacity: 0.7; transition: opacity 0.2s;
          cursor: pointer;
        }
        .nav-links a:hover { opacity: 1; }
        .nav-cta {
          background: var(--ink); color: var(--cream);
          border: none; border-radius: 4px;
          padding: 0.55rem 1.3rem;
          font-family: 'Segoe UI', sans-serif;
          font-size: 0.85rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
        }
        .nav-cta:hover { background: var(--brown); }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .hamburger span {
          display: block; width: 24px; height: 2px;
          background: var(--ink); transition: 0.3s;
        }
        .mobile-menu {
          display: none; position: fixed; top: 68px; left: 0; right: 0;
          background: var(--cream); z-index: 99;
          padding: 1.5rem 5vw 2rem;
          border-bottom: 1px solid var(--cream-deeper);
          flex-direction: column; gap: 1.2rem;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-size: 1rem; font-weight: 500; color: var(--ink);
          text-decoration: none; opacity: 0.8; cursor: pointer;
        }

        /* OFFER BANNER */
        .offer-banner {
          background: var(--ink); color: var(--gold-light);
          text-align: center; padding: 0.6rem 1rem;
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.05em;
          margin-top: 68px;
          overflow: hidden;
        }
        .offer-ticker {
          display: inline-flex; gap: 4rem;
          animation: ticker 22s linear infinite;
          white-space: nowrap;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* HERO */
        .hero {
          min-height: calc(100vh - 108px);
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 6rem 8vw 4rem;
          gap: 4rem;
          background: var(--cream);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 80% 50%, rgba(193,154,74,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-text { position: relative; z-index: 1; }
        .hero-eyebrow {
          display: inline-block;
          font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 1.2rem;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 0.4rem;
        }
        .hero h1 {
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 900; line-height: 1.08;
          color: var(--ink); margin-bottom: 1.4rem;
        }
        .hero h1 em { font-style: italic; color: var(--gold); }
        .hero-desc {
          font-size: 1.05rem; line-height: 1.75;
          color: #5C4A38; max-width: 460px; margin-bottom: 2.5rem;
        }
        .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn-primary {
          background: var(--ink); color: var(--cream);
          border: none; border-radius: 4px;
          padding: 0.85rem 2rem;
          font-family: monospace, sans-serif;
          font-size: 0.9rem; font-weight: 600;
          letter-spacing: 0.05em; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: var(--brown); transform: translateY(-1px); }
        .btn-secondary {
          background: transparent; color: var(--ink);
          border: 1.5px solid var(--ink); border-radius: 4px;
          padding: 0.85rem 2rem;
          font-size: 0.9rem; font-weight: 600;
          letter-spacing: 0.05em; cursor: pointer;
          transition: background 0.2s;
        }
        .btn-secondary:hover { background: var(--cream-dark); }
        .hero-stats {
          display: flex; gap: 2.5rem; margin-top: 3rem; flex-wrap: wrap;
        }
        .stat-item { }
        .stat-number {
          font-family: monospace, serif;
          font-size: 2rem; font-weight: 900; color: var(--ink);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #8B7355; margin-top: 0.2rem;
        }

        /* HERO IMAGE */
        .hero-visual {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-img-wrap {
          width: 100%; max-width: 520px;
          aspect-ratio: 4/3;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(28,20,16,0.22);
          position: relative;
        }
        .hero-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--cream-dark) 0%, var(--cream-deeper) 50%, #C8B89A 100%);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 1rem;
        }
        .hero-img-icon { font-size: 5rem; opacity: 0.6; }
        .hero-badge {
          position: absolute; bottom: -16px; left: -16px;
          background: var(--gold); color: var(--ink);
          border-radius: 50%; width: 100px; height: 100px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: monospace, serif;
          box-shadow: 0 8px 24px rgba(193,154,74,0.4);
        }
        .hero-badge-num { font-size: 1.5rem; font-weight: 900; line-height: 1; }
        .hero-badge-txt { font-size: 0.6rem; font-weight: 600; text-align: center; line-height: 1.2; }

        /* SECTION COMMONS */
        section { padding: 5rem 8vw; }
        .section-label {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 0.6rem;
        }
        .section-title {
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 900; color: var(--ink); line-height: 1.15;
          margin-bottom: 1rem;
        }
        .section-desc {
          font-size: 1rem; color: #6B5440; line-height: 1.7;
          max-width: 560px; margin-bottom: 3rem;
        }
        .section-divider {
          width: 48px; height: 3px;
          background: var(--gold); margin-bottom: 1.5rem;
        }

        /* SERVICES */
        .services-section { background: var(--white); }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .service-card {
          background: var(--cream);
          border: 1px solid var(--cream-deeper);
          border-radius: 10px;
          padding: 1.8rem;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          cursor: pointer;
          position: relative; overflow: hidden;
        }
        .service-card::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--gold);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px var(--shadow); border-color: var(--gold); }
        .service-card:hover::after { transform: scaleX(1); }
        .service-icon { font-size: 2rem; margin-bottom: 1rem; }
        .service-name {
          font-family: monospace, serif;
          font-size: 1.15rem; font-weight: 700;
          color: var(--ink); margin-bottom: 0.5rem;
        }
        .service-desc { font-size: 0.88rem; color: #7A6050; line-height: 1.6; margin-bottom: 1.2rem; }
        .service-price {
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--gold);
        }
        .service-order-btn {
          width: 100%; margin-top: 1rem;
          background: var(--ink); color: var(--cream);
          border: none; border-radius: 4px;
          padding: 0.6rem 1rem;
          font-family: 'Segoe UI', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
        }
        .service-order-btn:hover { background: var(--brown); }

        /* PORTFOLIO */
        .portfolio-section { background: var(--cream); }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.2rem;
        }
        .portfolio-card {
          border-radius: 8px; overflow: hidden;
          aspect-ratio: 4/3;
          position: relative; cursor: pointer;
          transition: transform 0.25s;
        }
        .portfolio-card:hover { transform: scale(1.02); }
        .portfolio-card:hover .portfolio-overlay { opacity: 1; }
        .portfolio-bg {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
          font-family: 'Segoe UI', serif
        }
        .portfolio-overlay {
          position: absolute; inset: 0;
          background: rgba(28,20,16,0.72);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
          padding: 1rem; text-align: center;
        }
        .portfolio-overlay-cat {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--gold-light);
          margin-bottom: 0.4rem;
        }
        .portfolio-overlay-title {
          font-family: 'Segoe UI', serif;
          font-size: 1rem; font-weight: 700; color: var(--white);
        }

        /* CALCULATOR / FORM */
        .form-section { background: var(--white); }
        .form-layout {
          display: grid; grid-template-columns: 1fr 1.2fr;
          gap: 4rem; align-items: start;
        }
        .form-info-box { position: sticky; top: 90px; }
        .price-display {
          background: var(--cream);
          border: 1px solid var(--cream-deeper);
          border-radius: 10px; padding: 2rem;
          margin-top: 2rem;
        }
        .price-label { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #8B7355; margin-bottom: 0.3rem; }
        .price-total {
          font-family: sans-serif, serif;
          font-size: 3rem; font-weight: 900; color: var(--ink); line-height: 1;
        }
        .price-currency { font-size: 1.2rem; vertical-align: super; margin-right: 2px; }
        .price-deposit {
          margin-top: 1rem; padding-top: 1rem;
          border-top: 1px solid var(--cream-deeper);
        }
        .price-deposit-amount {
          font-family: sans-serif, serif;
          font-size: 1.8rem; font-weight: 700; color: var(--gold);
        }

        /* FORM CARD */
        .form-card {
          background: var(--cream);
          border: 1px solid var(--cream-deeper);
          border-radius: 12px; padding: 2.5rem;
        }
        .form-group { margin-bottom: 1.4rem; }
        .form-label {
          display: block;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #6B5440; margin-bottom: 0.5rem;
        }
        .form-control {
          width: 100%;
          background: var(--white);
          border: 1.5px solid var(--cream-deeper);
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-family: 'Segoe UI', sans-serif;
          font-size: 0.95rem; color: var(--ink);
          transition: border-color 0.2s;
          outline: none;
        }
        .form-control:focus { border-color: var(--gold); }
        select.form-control { cursor: pointer; }
        .dim-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        .dim-option {
          border: 1.5px solid var(--cream-deeper);
          border-radius: 6px; padding: 0.6rem 0.8rem;
          background: var(--white); cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: left; font-family: 'DM Sans', sans-serif;
        }
        .dim-option.selected {
          border-color: var(--gold); background: rgba(193,154,74,0.08);
        }
        .dim-option-label { font-size: 0.88rem; font-weight: 600; color: var(--ink); display: block; }
        .dim-option-price { font-size: 0.75rem; color: var(--gold); display: block; margin-top: 1px; }
        .file-upload {
          border: 2px dashed var(--cream-deeper);
          border-radius: 8px; padding: 2rem;
          text-align: center; cursor: pointer;
          transition: border-color 0.2s;
          position: relative;
        }
        .file-upload:hover { border-color: var(--gold); }
        .file-upload input[type="file"] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
        }
        .file-upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .file-upload-text { font-size: 0.85rem; color: #8B7355; }
        .qty-control {
          display: flex; align-items: center; gap: 0;
          border: 1.5px solid var(--cream-deeper);
          border-radius: 6px; overflow: hidden; width: fit-content;
        }
        .qty-btn {
          background: var(--cream-dark); border: none;
          width: 40px; height: 42px;
          font-size: 1.2rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .qty-btn:hover { background: var(--cream-deeper); }
        .qty-value {
          width: 60px; text-align: center;
          background: var(--white); border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 600; color: var(--ink);
          outline: none; height: 42px;
        }
        .mpesa-wrap { position: relative; }
        .mpesa-prefix {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          font-weight: 600; color: #8B7355; font-size: 0.9rem;
        }
        .mpesa-input { padding-left: 3.5rem !important; }
        .submit-btn {
          width: 100%;
          background: var(--ink); color: var(--cream);
          border: none; border-radius: 6px;
          padding: 1rem; margin-top: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          letter-spacing: 0.05em; cursor: pointer;
          transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
        }
        .submit-btn:hover { background: var(--brown); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* REVIEWS */
        .reviews-section { background: var(--cream-dark); }
        .reviews-track {
          position: relative; overflow: hidden;
          max-width: 760px; margin: 0 auto;
        }
        .review-card {
          background: var(--white);
          border-radius: 12px; padding: 2.5rem;
          box-shadow: 0 4px 20px var(--shadow);
          transition: opacity 0.4s;
        }
        .review-stars { font-size: 1.1rem; margin-bottom: 1.2rem; }
        .review-text {
          font-size: 1.05rem; line-height: 1.75;
          color: var(--ink); font-style: italic;
          margin-bottom: 1.5rem;
          font-family: 'Segoe UI', serif; font-weight: 400;
        }
        .review-author { display: flex; align-items: center; gap: 1rem; }
        .review-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--cream-deeper);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; font-weight: 700;
          font-family: monospace, serif; color: var(--brown);
        }
        .review-name { font-weight: 700; font-size: 0.95rem; color: var(--ink); }
        .review-role { font-size: 0.8rem; color: #8B7355; }
        .review-dots {
          display: flex; justify-content: center; gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--cream-deeper); cursor: pointer;
          transition: background 0.2s;
        }
        .dot.active { background: var(--gold); }

        /* WHY US */
        .why-section { background: var(--ink); color: var(--cream); }
        .why-section .section-label { color: var(--gold-light); }
        .why-section .section-title { color: var(--cream); }
        .why-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 2rem; margin-top: 1rem;
        }
        .why-item { }
        .why-icon {
          font-size: 2.2rem; margin-bottom: 1rem;
          width: 56px; height: 56px;
          background: rgba(193,154,74,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .why-title {
          font-family: 'Segoe UI', serif;
          font-size: 1.05rem; font-weight: 700;
          color: var(--cream); margin-bottom: 0.5rem;
        }
        .why-desc { font-size: 0.88rem; color: #C8B89A; line-height: 1.6; }

        /* FOOTER */
        footer {
          background: #0E0A07; color: #C8B89A;
          padding: 4rem 8vw 2rem;
        }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem; margin-bottom: 3rem;
        }
        .footer-brand-name {
          font-family: Monospace, serif;
          font-size: 1.6rem; font-weight: 900;
          color: var(--white); margin-bottom: 0.8rem;
        }
        .footer-brand-name span { color: var(--gold); }
        .footer-brand-desc { font-size: 0.88rem; line-height: 1.7; color: #8B7355; }
        .footer-social { display: flex; gap: 0.8rem; margin-top: 1.2rem; }
        .social-btn {
          width: 36px; height: 36px; border-radius: 6px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .social-btn:hover { background: rgba(193,154,74,0.25); }
        .footer-col-title {
          font-family: 'Segoe UI', serif;
          font-size: 0.95rem; font-weight: 700;
          color: var(--white); margin-bottom: 1rem;
          letter-spacing: 0.04em;
        }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-links a {
          font-size: 0.85rem; color: #8B7355;
          text-decoration: none; cursor: pointer;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--gold-light); }
        .footer-contact-item {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.85rem; color: #8B7355; margin-bottom: 0.6rem;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.5rem;
        }
        .footer-copy { font-size: 0.78rem; color: #5C4A38; }

        /* SUCCESS */
        .success-box {
          background: rgba(193,154,74,0.08);
          border: 1.5px solid var(--gold);
          border-radius: 10px; padding: 2rem;
          text-align: center;
        }
        .success-icon { font-size: 3rem; margin-bottom: 0.8rem; }
        .success-title {
          font-family: sans-serif, serif;
          font-size: 1.4rem; font-weight: 700; color: var(--ink);
          margin-bottom: 0.5rem;
        }
        .success-desc { font-size: 0.92rem; color: #6B5440; line-height: 1.6; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .hero { grid-template-columns: 1fr; padding: 3rem 6vw; min-height: auto; }
          .hero-visual { order: -1; }
          .hero-img-wrap { max-width: 100%; }
          .form-layout { grid-template-columns: 1fr; }
          .form-info-box { position: static; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .portfolio-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          section { padding: 3.5rem 5vw; }
          .hero h1 { font-size: 2.2rem; }
          .hero-stats { gap: 1.5rem; }
          .portfolio-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .dim-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-logo">FRANK<span>STAT</span></div>
        <ul className="nav-links">
          {["home","services","portfolio","order","contact"].map(s => (
            <li key={s}><a onClick={() => scrollTo(s)}>{s}</a></li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => scrollTo("order")}>Order Now</button>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {["home","services","portfolio","order","contact"].map(s => (
          <a key={s} onClick={() => scrollTo(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</a>
        ))}
        <button className="btn-primary" style={{width:"fit-content"}} onClick={() => scrollTo("order")}>Order Now</button>
      </div>

      {/* ── OFFER BANNER ── */}
      <div className="offer-banner">
        <div className="offer-ticker">
          <span>🎉 FREE DELIVERY on orders above KES 5,000 within Nairobi</span>
          <span>⚡ 24-Hour Turnaround on Banners & Posters</span>
          <span>🖨️ 10% OFF first order – use code FRANKSTAT10</span>
          <span>🎉 FREE DELIVERY on orders above KES 5,000 within Nairobi</span>
          <span>⚡ 24-Hour Turnaround on Banners & Posters</span>
          <span>🖨️ 10% OFF first order – use code FRANKSTAT10</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <div className="hero-text">
          <span className="hero-eyebrow">Premium Printing in Nairobi</span>
          <h1>Print that <em>Commands</em> Attention.</h1>
          <p className="hero-desc">
            From vinyl banners to 3D signage, sublimation to business cards — 
            Frankstat delivers sharp, vibrant, professional prints that make your brand impossible to ignore.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("order")}>Get Instant Quote</button>
            <button className="btn-secondary" onClick={() => scrollTo("portfolio")}>View Our Work</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">2,400+</div>
              <div className="stat-label">Projects Delivered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">8+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-wrap">
            <div className="hero-img-placeholder">
              <div className="hero-img-icon">🖨️</div>
              <p style={{fontFamily:"'Segoe UI',serif",fontSize:"1.2rem",opacity:0.5,fontStyle:"italic"}}>Your Brand, Printed Perfectly</p>
            </div>
          </div>
          <div className="hero-badge">
            <div className="hero-badge-num">24h</div>
            <div className="hero-badge-txt">Fast Delivery</div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="services-section">
        <div className="section-label">What We Do</div>
        <div className="section-divider" />
        <h2 className="section-title">Our Printing Services</h2>
        <p className="section-desc">
          Every service is executed with precision-grade equipment and premium materials. 
          What do you need printed today?
        </p>
        <div className="services-grid">
          {SERVICES.map(svc => (
            <div key={svc.id} className="service-card" onClick={() => handleOrder(svc.id)}>
              <div className="service-icon">{svc.icon}</div>
              <div className="service-name">{svc.name}</div>
              <p className="service-desc">{svc.description}</p>
              <div className="service-price">
                {svc.pricingType === "dimension"
                  ? "From KES 150 / print"
                  : `From KES ${QUANTITY_PRICING[svc.id]?.base ?? 200} / ${QUANTITY_PRICING[svc.id]?.unit ?? "piece"}`
                }
              </div>
              <button className="service-order-btn">Order This →</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why-section">
        <div className="section-label">Why Frankstat</div>
        <div className="section-divider" />
        <h2 className="section-title">Built for Quality, Speed & Value</h2>
        <div className="why-grid">
          {[
            { icon: "⚡", title: "24-Hour Turnaround", desc: "Urgent order? We've got you. Most standard jobs are ready within 24 hours." },
            { icon: "🎨", title: "Vibrant, True Colours", desc: "Calibrated wide-format printers ensure your brand colours print exactly as designed." },
            { icon: "🛡️", title: "Weather-Proof Materials", desc: "Outdoor banners and signage built to withstand Nairobi's sun, rain, and wind." },
            { icon: "💬", title: "Free Design Consultation", desc: "Not sure about sizing or format? Our team guides you from concept to final print." },
            { icon: "🚚", title: "Nairobi-Wide Delivery", desc: "We deliver to all Nairobi CBD and suburb locations. Large orders get free delivery." },
            { icon: "📱", title: "M-Pesa Payments", desc: "Pay securely via M-Pesa. A 50% deposit confirms your order and we start immediately." },
          ].map(item => (
            <div key={item.title} className="why-item">
              <div className="why-icon">{item.icon}</div>
              <div className="why-title">{item.title}</div>
              <p className="why-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="portfolio-section">
        <div className="section-label">Our Work</div>
        <div className="section-divider" />
        <h2 className="section-title">Portfolio Showcase</h2>
        <p className="section-desc">
          A glimpse of what we have created for businesses, events, and brands across Nairobi and beyond.
        </p>
        <div className="portfolio-grid">
          {PORTFOLIO.map((item, i) => (
            <div key={i} className="portfolio-card">
              <div className="portfolio-bg" style={{background:`linear-gradient(135deg,${item.color}22,${item.color}55)`}}>
                {SERVICES.find(s => s.name.toLowerCase().includes(item.category.split(" ")[0].toLowerCase()))?.icon ?? "🖼️"}
              </div>
              <div className="portfolio-overlay">
                <div className="portfolio-overlay-cat">{item.category}</div>
                <div className="portfolio-overlay-title">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ORDER FORM ── */}
      <section id="order" className="form-section" ref={formRef as any}>
        <div className="section-label">Pricing Calculator & Order</div>
        <div className="section-divider" />
        <h2 className="section-title">Get an Instant Quote</h2>
        <p className="section-desc">
          Select your service and options below. Pricing updates in real-time. 
          A 50% deposit confirms your order.
        </p>

        <div className="form-layout">
          {/* LEFT: Info + Price Display */}
          <div className="form-info-box">
            <div style={{background:"var(--cream)",border:"1px solid var(--cream-deeper)",borderRadius:"10px",padding:"1.8rem"}}>
              <p style={{fontSize:"0.85rem",color:"#6B5440",lineHeight:"1.7",marginBottom:"1rem"}}>
                <strong style={{color:"var(--ink)"}}>How it works:</strong><br/>
                Choose your service → configure size & quantity → upload your artwork → enter your M-Pesa number → pay the 50% deposit. We will confirm and start production within the hour.
              </p>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                {["✅ Transparent pricing – no hidden fees","📐 Common size presets included","🎨 Artwork review before printing","📱 M-Pesa deposit confirmation via SMS"].map(t => (
                  <li key={t} style={{fontSize:"0.83rem",color:"#6B5440"}}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="price-display">
              <div className="price-label">Estimated Total</div>
              <div className="price-total">
                <span className="price-currency">KES</span>
                {totalPrice.toLocaleString()}
              </div>
              <div className="price-deposit">
                <div className="price-label">50% Deposit (Pay Now)</div>
                <div className="price-deposit-amount">KES {deposit.toLocaleString()}</div>
              </div>
              {selectedService && (
                <p style={{fontSize:"0.78rem",color:"#8B7355",marginTop:"0.8rem"}}>
                  {selectedService.name} × {formData.quantity} {QUANTITY_PRICING[selectedService.id]?.unit ?? "unit(s)"}
                  {formData.dimension && formData.dimension !== "Custom" ? ` — ${formData.dimension}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Form */}
          <div>
            {submitted ? (
              <div className="success-box">
                <div className="success-icon">🎉</div>
                <div className="success-title">Order Request Submitted!</div>
                <p className="success-desc">
                  Thank you! We have received your order for <strong>{selectedService?.name}</strong>. 
                  You will receive an M-Pesa prompt on <strong>{formData.mpesa}</strong> for a deposit of <strong>KES {deposit.toLocaleString()}</strong> shortly. 
                  Our team will confirm production details within 30 minutes.
                </p>
                <button className="btn-primary" style={{marginTop:"1.5rem"}} onClick={() => {setSubmitted(false);setFormData({service:"",dimension:"",customW:"",customH:"",quantity:1,paperType:"glossy",imageFile:null,mpesa:""});}}>
                  Place Another Order
                </button>
              </div>
            ) : (
              <form className="form-card" onSubmit={handleSubmit}>
                {/* Service */}
                <div className="form-group">
                  <label className="form-label">Service *</label>
                  <select className="form-control" required value={formData.service}
                    onChange={e => setFormData(f => ({...f, service: e.target.value, dimension:"", quantity:1}))}>
                    <option value="">— Select a service —</option>
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>

                {/* Dimensions for banners/posters */}
                {(formData.service === "banners" || formData.service === "posters") && (
                  <div className="form-group">
                    <label className="form-label">Size / Dimensions *</label>
                    <div className="dim-grid">
                      {dimensions.map(d => (
                        <button type="button" key={d.label}
                          className={`dim-option${formData.dimension===d.label?" selected":""}`}
                          onClick={() => setFormData(f => ({...f, dimension: d.label}))}>
                          <span className="dim-option-label">{d.label}</span>
                          <span className="dim-option-price">{d.price > 0 ? `KES ${d.price.toLocaleString()}` : "Quoted separately"}</span>
                        </button>
                      ))}
                    </div>
                    {formData.dimension === "Custom" && (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginTop:"0.8rem"}}>
                        <div>
                          <label className="form-label">Width (ft)</label>
                          <input type="number" min="0.5" step="0.5" className="form-control"
                            placeholder="e.g. 5" value={formData.customW}
                            onChange={e => setFormData(f => ({...f, customW: e.target.value}))} />
                        </div>
                        <div>
                          <label className="form-label">Height (ft)</label>
                          <input type="number" min="0.5" step="0.5" className="form-control"
                            placeholder="e.g. 3" value={formData.customH}
                            onChange={e => setFormData(f => ({...f, customH: e.target.value}))} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Paper type for posters */}
                {formData.service === "posters" && (
                  <div className="form-group">
                    <label className="form-label">Finish</label>
                    <select className="form-control" value={formData.paperType}
                      onChange={e => setFormData(f => ({...f, paperType: e.target.value}))}>
                      <option value="glossy">Glossy</option>
                      <option value="matte">Matte</option>
                      <option value="satin">Satin</option>
                    </select>
                  </div>
                )}

                {/* Quantity */}
                {formData.service && (
                  <div className="form-group">
                    <label className="form-label">
                      Quantity {QUANTITY_PRICING[formData.service] ? `(per ${QUANTITY_PRICING[formData.service].unit})` : ""}
                    </label>
                    <div className="qty-control">
                      <button type="button" className="qty-btn"
                        onClick={() => setFormData(f => ({...f, quantity: Math.max(1, f.quantity - 1)}))}>−</button>
                      <input type="number" className="qty-value" min={1} value={formData.quantity}
                        onChange={e => setFormData(f => ({...f, quantity: Math.max(1, parseInt(e.target.value)||1)}))} />
                      <button type="button" className="qty-btn"
                        onClick={() => setFormData(f => ({...f, quantity: f.quantity + 1}))}>+</button>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                {formData.service && (
                  <div className="form-group">
                    <label className="form-label">Upload Artwork / Design *</label>
                    <div className="file-upload">
                      <input type="file" accept="image/*,.pdf,.ai,.eps,.psd"
                        onChange={e => setFormData(f => ({...f, imageFile: e.target.files?.[0] ?? null}))} />
                      <div className="file-upload-icon">
                        {formData.imageFile ? "✅" : "📁"}
                      </div>
                      <div className="file-upload-text">
                        {formData.imageFile
                          ? formData.imageFile.name
                          : "Click or drag your file here\nJPG, PNG, PDF, AI, EPS, PSD"
                        }
                      </div>
                      <p style={{fontSize:"0.72rem",color:"#A89070",marginTop:"0.4rem"}}>
                        Min 300 DPI recommended · Max 100MB
                      </p>
                    </div>
                  </div>
                )}

                {/* M-Pesa */}
                {formData.service && (
                  <div className="form-group">
                    <label className="form-label">M-Pesa Phone Number *</label>
                    <div className="mpesa-wrap">
                      <span className="mpesa-prefix">+254</span>
                      <input type="tel" className="form-control mpesa-input" required
                        placeholder="7XX XXX XXX" maxLength={9}
                        value={formData.mpesa}
                        onChange={e => setFormData(f => ({...f, mpesa: e.target.value.replace(/\D/g,"")}))} />
                    </div>
                    <p style={{fontSize:"0.75rem",color:"#8B7355",marginTop:"0.4rem"}}>
                      You will receive an STK push for the 50% deposit: <strong>KES {deposit.toLocaleString()}</strong>
                    </p>
                  </div>
                )}

                {/* Special notes */}
                {formData.service && (
                  <div className="form-group">
                    <label className="form-label">Special Instructions (optional)</label>
                    <textarea className="form-control" rows={3}
                      placeholder="e.g. Grommets on edges, double-sided, lamination, specific colour codes..." />
                  </div>
                )}

                <button type="submit" className="submit-btn"
                  disabled={!formData.service || (["banners","posters"].includes(formData.service) && !formData.dimension) || !formData.mpesa || formData.mpesa.length < 9}>
                  <span>📱</span>
                  Pay Deposit — KES {deposit.toLocaleString()} via M-Pesa
                </button>
                <p style={{fontSize:"0.75rem",color:"#8B7355",textAlign:"center",marginTop:"0.6rem"}}>
                  Balance of KES {(totalPrice - deposit).toLocaleString()} payable on collection / delivery
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div className="section-label" style={{justifyContent:"center",display:"flex"}}>Customer Reviews</div>
          <div className="section-divider" style={{margin:"0.6rem auto 1rem"}} />
          <h2 className="section-title" style={{textAlign:"center"}}>What Our Clients Say</h2>
        </div>
        <div className="reviews-track">
          <div className="review-card">
            <div className="review-stars">{"★".repeat(REVIEWS[activeReview].rating)}</div>
            <div className="review-text">|{REVIEWS[activeReview].text}|</div>
            <div className="review-author">
              <div className="review-avatar">{REVIEWS[activeReview].name[0]}</div>
              <div>
                <div className="review-name">{REVIEWS[activeReview].name}</div>
                <div className="review-role">{REVIEWS[activeReview].role}</div>
              </div>
            </div>
          </div>
          <div className="review-dots">
            {REVIEWS.map((_, i) => (
              <div key={i} className={`dot${i===activeReview?" active":""}`} onClick={() => setActiveReview(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">FRANK<span>STAT</span></div>
            <p className="footer-brand-desc">
              Nairobi is a trusted printing partner for businesses, events, and entrepreneurs. 
              Premium prints. Fast turnaround. Fair pricing.
            </p>
            <div className="footer-social">
              {["📘","📸","🐦","💼"].map((icon, i) => (
                <a key={i} className="social-btn">{icon}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Services</div>
            <ul className="footer-links">
              {SERVICES.map(s => <li key={s.id}><a onClick={() => scrollTo("order")}>{s.name}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              {["Home","Services","Portfolio","Order","Contact"].map(l => (
                <li key={l}><a onClick={() => scrollTo(l.toLowerCase())}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Contact Us</div>
            {[
              {icon:"📍",text:"Westlands, Nairobi, Kenya"},
              {icon:"📞",text:"+254 700 000 000"},
              {icon:"📧",text:"hello@frankstat.co.ke"},
              {icon:"🕐",text:"Mon–Sat: 8am – 7pm"},
            ].map(c => (
              <div key={c.text} className="footer-contact-item">
                <span>{c.icon}</span><span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} Frankstat Printing Solutions. All rights reserved.</div>
          <div className="footer-copy">Designed with ❤️ in Nairobi</div>
        </div>
      </footer>
    </>
  );
}

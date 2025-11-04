import ScrollReveal from 'scrollreveal';

// Configuração global do ScrollReveal
const sr = ScrollReveal({
  reset: false,
  distance: '60px',
  duration: 2000,
  delay: 300,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  viewFactor: 0.2,
});

// Função para inicializar todas as animações ScrollReveal
export const initScrollReveal = () => {
  // Fade animations
  sr.reveal('.sr-fade', {
    duration: 1000,
    distance: '0px',
    opacity: 0,
    scale: 1,
    easing: 'ease-out',
    delay: 100
  });

  sr.reveal('.sr-fade-up', {
    duration: 1000,
    distance: '40px',
    easing: 'ease-out',
    origin: 'bottom',
    delay: 200
  });

  sr.reveal('.sr-fade-down', {
    duration: 1000,
    distance: '40px',
    easing: 'ease-out',
    origin: 'top',
    delay: 100
  });

  // Slide animations
  sr.reveal('.sr-slide-left', {
    duration: 1200,
    distance: '60px',
    easing: 'ease-out',
    origin: 'left',
    delay: 300
  });

  sr.reveal('.sr-slide-right', {
    duration: 1200,
    distance: '60px',
    easing: 'ease-out',
    origin: 'right',
    delay: 300
  });

  // Zoom animations
  sr.reveal('.sr-zoom', {
    duration: 1000,
    scale: 0.8,
    easing: 'ease-out',
    delay: 400
  });

  sr.reveal('.sr-zoom-in', {
    duration: 1200,
    scale: 0.7,
    easing: 'ease-out',
    delay: 200
  });

  // Tilt animation
  sr.reveal('.sr-tilt', {
    duration: 1000,
    distance: '20px',
    easing: 'ease-out',
    origin: 'bottom',
    rotate: { x: 0, y: 0, z: 5 },
    delay: 200
  });

  // Flip animation
  sr.reveal('.sr-flip', {
    duration: 1200,
    rotate: { x: 0, y: 180, z: 0 },
    easing: 'ease-out',
    delay: 300
  });

  // Stagger animation (para elementos em sequência)
  sr.reveal('.sr-stagger', {
    duration: 800,
    distance: '30px',
    easing: 'ease-out',
    origin: 'bottom',
    interval: 150
  });

  // Bounce animation
  sr.reveal('.sr-bounce', {
    duration: 1000,
    distance: '40px',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    origin: 'bottom',
    delay: 200
  });

  // Elastic animation
  sr.reveal('.sr-elastic', {
    duration: 1500,
    distance: '50px',
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    origin: 'bottom',
    scale: 0.9,
    delay: 100
  });

  // Animações personalizadas para elementos específicos
  sr.reveal('.sr-header-logo', {
    duration: 800,
    distance: '30px',
    origin: 'left',
    easing: 'ease-out',
    delay: 100
  });

  sr.reveal('.sr-hero-badge', {
    duration: 1000,
    scale: 0.9,
    easing: 'ease-out',
    delay: 200
  });

  sr.reveal('.sr-hero-title', {
    duration: 1200,
    distance: '50px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 400
  });

  sr.reveal('.sr-hero-description', {
    duration: 1000,
    distance: '30px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 600
  });

  sr.reveal('.sr-hero-buttons', {
    duration: 1000,
    distance: '30px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 800
  });

  // Animações para cards de features
  sr.reveal('.sr-feature-card', {
    duration: 800,
    distance: '40px',
    origin: 'bottom',
    easing: 'ease-out',
    interval: 200,
    delay: 100
  });

  // Animações para seções
  sr.reveal('.sr-section-title', {
    duration: 1000,
    distance: '40px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 100
  });

  sr.reveal('.sr-section-description', {
    duration: 1000,
    distance: '30px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 300
  });

  // Animação para o dashboard preview
  sr.reveal('.sr-dashboard-preview', {
    duration: 1500,
    scale: 0.9,
    easing: 'ease-out',
    delay: 200
  });

  // Animações para pricing cards
  sr.reveal('.sr-pricing-card', {
    duration: 1000,
    distance: '40px',
    origin: 'bottom',
    easing: 'ease-out',
    interval: 200,
    delay: 100
  });

  // Animações para testimonials
  sr.reveal('.sr-testimonial', {
    duration: 800,
    distance: '30px',
    origin: 'bottom',
    easing: 'ease-out',
    interval: 150,
    delay: 100
  });

  // Animação para FAQ items
  sr.reveal('.sr-faq-item', {
    duration: 600,
    distance: '20px',
    origin: 'bottom',
    easing: 'ease-out',
    interval: 100,
    delay: 50
  });

  // Animação para footer
  sr.reveal('.sr-footer', {
    duration: 1000,
    distance: '30px',
    origin: 'bottom',
    easing: 'ease-out',
    delay: 100
  });
};

export default sr;
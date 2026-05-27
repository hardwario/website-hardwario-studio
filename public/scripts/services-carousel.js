document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-service-card]').forEach((card) => {
    const slides = Array.from(card.querySelectorAll('[data-service-slide]'));
    const previousButton = card.querySelector('[data-service-prev]');
    const nextButton = card.querySelector('[data-service-next]');
    const meta = card.querySelector('[data-service-meta]');

    if (slides.length <= 1) {
      return;
    }

    let activeIndex = 0;

    const updateSlides = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      if (meta) {
        meta.classList.add('is-updating');
        window.setTimeout(() => {
          meta.textContent = slides[activeIndex]?.getAttribute('data-meta') || '';
          window.requestAnimationFrame(() => {
            meta.classList.remove('is-updating');
          });
        }, 180);
      }
    };

    previousButton?.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      updateSlides();
    });

    nextButton?.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % slides.length;
      updateSlides();
    });

    updateSlides();
  });
});
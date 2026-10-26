import '@testing-library/jest-dom';

// Polyfill window.scrollTo in jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSelector() {
  const { lang, setLang, languages, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        type="button"
        className={`lang-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Cambiar idioma / Change language"
        title={currentLanguage.label}
      >
        <span className="lang-flag">{currentLanguage.flag}</span>
        <span className="lang-code">{currentLanguage.short}</span>
        <FiChevronDown className={`lang-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          <div className="lang-dropdown-header">
            <FiGlobe /> Seleccionar Idioma
          </div>
          <div className="lang-options">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`lang-option ${lang === item.code ? 'selected' : ''}`}
                onClick={() => handleSelect(item.code)}
              >
                <span className="lang-option-flag">{item.flag}</span>
                <span className="lang-option-name">{item.label}</span>
                <span className="lang-option-short">{item.short}</span>
                {lang === item.code && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

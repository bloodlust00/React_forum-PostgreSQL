import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, RotateCcw } from 'lucide-react';

const QUALIFICATION_OPTIONS = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA"];
const LANGUAGE_OPTIONS = ["English", "French", "German", "Hindi", "Russian", "Spanish", "Mandarin"];

export default function StudentForm({ onSubmit, isLoading, initialData = null, onCancel = null }) {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    qualification: '',
    languages_known: []
  });

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Populate data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        middle_name: initialData.middle_name || '',
        last_name: initialData.last_name || '',
        dob: initialData.dob || '',
        qualification: initialData.qualification || '',
        languages_known: initialData.languages_known || []
      });
    }
  }, [initialData]);

  // Dropdown close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set focus on dropdown search input when opened
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
  }, [isDropdownOpen]);

  const validate = () => {
    const tempErrors = {};
    if (!formData.first_name.trim()) tempErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) tempErrors.last_name = "Last name is required.";
    
    if (!formData.dob) {
      tempErrors.dob = "Date of birth is required.";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate >= today) {
        tempErrors.dob = "Date of birth must be in the past.";
      } else {
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 3) tempErrors.dob = "Student must be at least 3 years old.";
      }
    }

    if (!formData.qualification) tempErrors.qualification = "Qualification is required.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => {
      const languages = prev.languages_known.includes(lang)
        ? prev.languages_known.filter(l => l !== lang)
        : [...prev.languages_known, lang];
      return { ...prev, languages_known: languages };
    });
  };

  const handleSelectQualification = (qual) => {
    setFormData(prev => ({ ...prev, qualification: qual }));
    setIsDropdownOpen(false);
    setSearchTerm('');
    if (errors.qualification) {
      setErrors(prev => ({ ...prev, qualification: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      if (!initialData) {
        handleReset();
      }
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      dob: '',
      qualification: '',
      languages_known: []
    });
    setErrors({});
    setSearchTerm('');
  };

  const filteredQualifications = QUALIFICATION_OPTIONS.filter(q =>
    q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 focus-glow text-sm ${
                errors.first_name ? "border-rose-500/60 ring-2 ring-rose-500/10" : "border-slate-200"
              }`}
              placeholder="e.g. John"
            />
            {errors.first_name && (
              <span className="text-[11px] text-rose-500 mt-1 block px-1">{errors.first_name}</span>
            )}
          </div>

          <div>
            <label htmlFor="middle_name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Middle Name
            </label>
            <input
              type="text"
              name="middle_name"
              id="middle_name"
              value={formData.middle_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus-glow text-sm"
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              id="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 focus-glow text-sm ${
                errors.last_name ? "border-rose-500/60 ring-2 ring-rose-500/10" : "border-slate-200"
              }`}
              placeholder="e.g. Doe"
            />
            {errors.last_name && (
              <span className="text-[11px] text-rose-500 mt-1 block px-1">{errors.last_name}</span>
            )}
          </div>
        </div>

        {/* Date of Birth & Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dob" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 focus-glow text-sm ${
                errors.dob ? "border-rose-500/60 ring-2 ring-rose-500/10" : "border-slate-200"
              }`}
            />
            {errors.dob && (
              <span className="text-[11px] text-rose-500 mt-1 block px-1">{errors.dob}</span>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Academic Stream *
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-4 py-2.5 rounded-xl border text-left bg-white flex items-center justify-between text-slate-900 transition-all duration-200 text-sm ${
                errors.qualification ? "border-rose-500/60 ring-2 ring-rose-500/10" : "border-slate-200"
              } focus:outline-hidden focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950`}
            >
              <span className={formData.qualification ? "font-medium" : "text-slate-400"}>
                {formData.qualification || "Choose Qualification..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute z-30 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="flex items-center border-b border-slate-150 px-3 bg-slate-50/50">
                    <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      ref={searchInputRef}
                      placeholder="Search stream..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 bg-transparent border-0 text-xs text-slate-900 focus:ring-0 focus:outline-hidden"
                    />
                  </div>

                  <ul className="max-h-40 overflow-y-auto py-1">
                    {filteredQualifications.length > 0 ? (
                      filteredQualifications.map((opt) => (
                        <li key={opt}>
                          <button
                            type="button"
                            onClick={() => handleSelectQualification(opt)}
                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors font-semibold"
                          >
                            <span>{opt}</span>
                            {formData.qualification === opt && (
                              <Check className="w-4 h-4 text-slate-900" />
                            )}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-xs text-slate-400 text-center">
                        No matches found
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.qualification && (
              <span className="text-[11px] text-rose-500 mt-1 block px-1">{errors.qualification}</span>
            )}
          </div>
        </div>

        {/* Languages Known */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Known Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isChecked = formData.languages_known.includes(lang);
              return (
                <div key={lang}>
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={isChecked}
                    onChange={() => handleLanguageToggle(lang)}
                    className="sr-only chip-checkbox"
                  />
                  <motion.label
                    htmlFor={`lang-${lang}`}
                    whileHover={{ y: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 select-none block border-slate-200 text-slate-600 bg-white hover:bg-slate-50 ${
                      isChecked ? "bg-slate-100 border-slate-900 text-slate-900 ring-1 ring-slate-900/10" : ""
                    }`}
                  >
                    {lang}
                  </motion.label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          {!initialData && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              title="Reset Fields"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : initialData ? (
              "Save Student"
            ) : (
              "Register Student"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

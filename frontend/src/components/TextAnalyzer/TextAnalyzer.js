import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './TextAnalyzer.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ErrorSection = ({ title, count, errors, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="error-section">
      <div className="error-header" onClick={() => setIsOpen(!isOpen)}>
        <span className={`error-icon ${icon}`}></span>
        <span className="error-title">{count} {title}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {isOpen && (
        <ul className="error-list">
          {errors.map((error, index) => (
            <li key={index} className="error-item">
              {error.error} 
              {error.correction && <span className="correction"> - Correction: "{error.correction}"</span>}
              {error.suggestion && <span className="suggestion"> - Suggestion: {error.suggestion}</span>}
              {error.position && <span className="position"> (position: {error.position})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function TextAnalyzer() {
  const [prompt, setPrompt] = useState('');
  const [essayText, setEssayText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [prompts, setPrompts] = useState([]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/analyze', { 
        prompt: prompt,
        essay: essayText 
      });
      setAnalysis(JSON.parse(response.data.analysis));
      setAnalysisKey(prevKey => prevKey + 1);

      if (!prompts.includes(prompt)) {
        setPrompts([...prompts, prompt]);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, essayText, prompts]);

  const renderAnalysis = useCallback(() => {
    if (!analysis) return null;

    return (
      <div className="analysis-results">
        <h2>Analysis Results</h2>
        
        <h3>Content Feedback:</h3>
        <p>{analysis.content_feedback}</p>

        <ErrorSection 
          title="Spelling Errors" 
          count={analysis.spelling_errors.length}
          errors={analysis.spelling_errors}
          icon="spelling-icon"
        />

        <ErrorSection 
          title="Grammar Errors" 
          count={analysis.grammar_errors.length}
          errors={analysis.grammar_errors}
          icon="grammar-icon"
        />

        <ErrorSection 
          title="Punctuation Errors" 
          count={analysis.punctuation_errors.length}
          errors={analysis.punctuation_errors}
          icon="punctuation-icon"
        />

        <ErrorSection 
          title="Improvement Suggestions" 
          count={analysis.improvement_suggestions.length}
          errors={analysis.improvement_suggestions.map(suggestion => ({ error: suggestion }))}
          icon="suggestion-icon"
        />
      </div>
    );
  }, [analysis]);

  return (
    <div className="container">
      <header className="header">
        <img src="logo.png" alt="Next Level Tutors" className="logo" />
      </header>
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            id="essay-prompt" 
            className="prompt" 
            list="prompt-options"
            placeholder="Enter Essay Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <datalist id="prompt-options">
            {prompts.map((promptOption, index) => (
              <option key={index} value={promptOption} />
            ))}
          </datalist>
        </div>
        <div className="form-group">
          <label htmlFor="essay-text">Enter Essay Text</label>
          <textarea 
            id="essay-text" 
            className="essay-input" 
            placeholder="Enter Essay Text"
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
          />
        </div>
        <div className="word-count">{essayText.trim().split(/\s+/).length} words</div>
        <button className="refresh-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Refresh Suggestions'}
        </button>
      </form>
      <div key={analysisKey}>
        {renderAnalysis()}
      </div>
    </div>
  );
}

export default TextAnalyzer;

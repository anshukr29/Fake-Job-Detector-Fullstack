import React, { useState } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, Search, AlertCircle, Info, RefreshCw } from 'lucide-react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [hasLogo, setHasLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 6) {
      setError('Please paste a complete job message, email, or offer letter (at least 6-10 words).');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        text: text,
        has_logo: hasLogo
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to Python FastAPI server. Ensure backend is running at http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="max-w-3xl w-full text-center my-6">
        <div className="flex justify-center items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-indigo-500 animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            AI Job Scam Detector
          </h1>
        </div>
        <p className="text-slate-400 text-sm md:text-base">
          Paste any Job Offer, WhatsApp Message, or Email below to instantly verify its authenticity using NLP & Machine Learning.
        </p>
      </header>

      {/* Main Single Box Container */}
      <main className="max-w-3xl w-full bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Input Text Area */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            📥 Paste Message / Email Text Here:
          </label>
          <textarea
            rows="7"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm leading-relaxed"
            placeholder="Example: Congratulations! You are selected for Work From Home Data Entry job. Earn $3000/week. Pay $50 for registration starter kit fee..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Checkbox Toggle */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
          <input
            type="checkbox"
            id="logoCheck"
            checked={hasLogo}
            onChange={(e) => setHasLogo(e.target.checked)}
            className="w-5 h-5 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          <label htmlFor="logoCheck" className="text-sm text-slate-300 cursor-pointer select-none">
            Does this email/posting have an official company logo or domain email?
          </label>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Scanning Text Patterns...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Scan & Audit Text</span>
            </>
          )}
        </button>

        {/* Audit Report Results */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-700/80 space-y-6">
            
            {/* Status Card */}
            <div className={`p-5 rounded-xl border ${
              result.status === 'FRAUDULENT' 
                ? 'bg-rose-950/40 border-rose-600/50 text-rose-300' 
                : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
            }`}>
              <div className="flex items-center gap-3">
                {result.status === 'FRAUDULENT' ? (
                  <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                )}
                <div>
                  <h3 className="text-lg font-bold">
                    {result.status === 'FRAUDULENT' ? '🚨 HIGH RISK / SUSPICIOUS SCAM' : '✅ LOW RISK / LIKELY LEGITIMATE'}
                  </h3>
                  <p className="text-sm opacity-90">
                    Estimated Fraud Risk Score: <span className="font-extrabold">{result.fraud_probability}%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Factors List */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Identified Risk Indicators:
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {result.risk_factors.length > 0 ? (
                  result.risk_factors.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-amber-300/90">
                      <span className="text-amber-400">•</span>
                      <span>{rf}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No common structural or keyword risk flags detected.</li>
                )}
              </ul>
            </div>

            {/* Guidance Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                AI Safety Guidance:
              </h4>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {result.status === 'FRAUDULENT' 
                  ? "👉 Never pay money upfront for registration fees, laptops, or equipment. Legitimate recruiters will never insist on conducting interviews exclusively over informal messaging apps like Telegram or personal WhatsApp."
                  : "👉 Message text aligns with standard communication. Always verify that emails come from official company domain names before sending personal documents or bank details."
                }
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;
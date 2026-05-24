import { useState } from 'react';
import '../styles/BMI.css';

const TIPS = [
  'Maintain a balanced diet with fruits and vegetables',
  'Exercise regularly for at least 30 minutes daily',
  'Stay hydrated by drinking plenty of water',
  'Get adequate sleep (7–9 hours per night)',
  'Reduce stress through meditation or relaxation',
  'Consult a doctor for personalized health advice',
];

export default function BMI() {
  const [metric,   setMetric]   = useState(true);
  const [height,   setHeight]   = useState('');
  const [weight,   setWeight]   = useState('');
  const [result,   setResult]   = useState(null);   // { value, category, color, rowId }
  const [highlight, setHighlight] = useState(null);

  const switchUnit = (isMetric) => {
    setMetric(isMetric);
    setHeight('');
    setWeight('');
    setResult(null);
    setHighlight(null);
  };

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) { alert('Please enter valid height and weight.'); return; }

    let bmi = metric ? w / ((h / 100) ** 2) : (w / (h * h)) * 703;
    bmi = Math.round(bmi * 10) / 10;

    let category, color, rowId;
    if      (bmi < 18.5) { category = 'Underweight';   color = '#3b82f6'; rowId = 'under';  }
    else if (bmi < 25)   { category = 'Normal weight';  color = '#16a34a'; rowId = 'normal'; }
    else if (bmi < 30)   { category = 'Overweight';     color = '#d97706'; rowId = 'over';   }
    else                 { category = 'Obese';           color = '#dc2626'; rowId = 'obese';  }

    setResult({ value: bmi, category, color });
    setHighlight(rowId);
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setResult(null);
    setHighlight(null);
  };

  return (
    <>
      {/* Hero */}
      <section className="bmi-hero">
        <div className="bmi-hero-icon">⚖️</div>
        <h1>BMI Calculator</h1>
        <p>Calculate your Body Mass Index to understand your health status</p>
      </section>

      <div className="bmi-layout">
        {/* ── Left column ── */}
        <div>
          <div className="bmi-card">
            <h2>Enter Your Details</h2>

            <div className="field-group">
              <label className="field-label">Unit System</label>
              <div className="unit-toggle">
                <label>
                  <input type="radio" name="bmi-unit" checked={metric}  onChange={() => switchUnit(true)}  /> Metric (cm, kg)
                </label>
                <label>
                  <input type="radio" name="bmi-unit" checked={!metric} onChange={() => switchUnit(false)} /> Imperial (in, lbs)
                </label>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">{metric ? 'Height (cm)' : 'Height (in)'}</label>
              <input
                className="bmi-input"
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder={metric ? '170' : '67'}
                min="1"
                onKeyDown={e => e.key === 'Enter' && calculate()}
              />
            </div>

            <div className="field-group">
              <label className="field-label">{metric ? 'Weight (kg)' : 'Weight (lbs)'}</label>
              <input
                className="bmi-input"
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={metric ? '70' : '154'}
                min="1"
                onKeyDown={e => e.key === 'Enter' && calculate()}
              />
            </div>

            <div className="btn-row-bmi">
              <button className="btn-calc" onClick={calculate}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                </svg>
                Calculate BMI
              </button>
              <button className="btn-reset-bmi" onClick={reset}>Reset</button>
            </div>

            {result && (
              <div className="result-box visible">
                <p className="result-label">Your BMI is</p>
                <div className="result-value" style={{ color: result.color }}>{result.value}</div>
                <div className="result-category" style={{ color: result.color }}>{result.category}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          <div className="bmi-card">
            <h2>BMI Categories &amp; Advice</h2>
            <table className="bmi-table">
              <thead>
                <tr><th>BMI</th><th>Category</th><th>Advice</th></tr>
              </thead>
              <tbody>
                <tr className={highlight === 'under'  ? 'highlight' : ''}><td><span className="bmi-range bmi-c-blue">&lt;18.5</span></td><td>Underweight</td><td>Eat nutritious food, maintain calorie surplus</td></tr>
                <tr className={highlight === 'normal' ? 'highlight' : ''}><td><span className="bmi-range bmi-c-green">18.5–24.9</span></td><td>Normal weight</td><td>Keep eating healthy and stay active</td></tr>
                <tr className={highlight === 'over'   ? 'highlight' : ''}><td><span className="bmi-range bmi-c-yellow">25–29.9</span></td><td>Overweight</td><td>Balanced diet + regular exercise advised</td></tr>
                <tr className={highlight === 'obese'  ? 'highlight' : ''}><td><span className="bmi-range bmi-c-red">≥30</span></td><td>Obese</td><td>Strict diet + exercise to stay healthy</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bmi-card tips-card">
            <div className="tips-header">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Health Tips
            </div>
            {TIPS.map((tip, i) => (
              <div key={i} className="tip-item">
                <span className="tip-dot"></span>
                {tip}
              </div>
            ))}
            <div className="bmi-note">
              <strong>Note:</strong> BMI is a screening tool and does not diagnose body fatness or health. Consult with a healthcare professional for a comprehensive health assessment.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
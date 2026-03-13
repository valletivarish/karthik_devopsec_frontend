import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import forecastService from '../../services/forecastService';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = { Calories: '#4f46e5', Protein: '#10b981', Carbs: '#f59e0b', Fat: '#ef4444' };

/**
 * Nutritional forecast page showing ML-predicted trends using
 * Apache Commons Math SimpleRegression on the backend.
 * Displays line charts for predicted calorie and macronutrient intake.
 */
function NutritionForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadForecast(); }, []);

  const loadForecast = async () => {
    try {
      const response = await forecastService.getForecast();
      setForecast(response.data);
    } catch { toast.error('Failed to load forecast data'); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  if (!forecast || !forecast.forecasts || forecast.forecasts.length === 0) {
    return (
      <div>
        <div className="page-header"><h1>Nutritional Forecast</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p>Not enough meal plan data to generate forecasts.</p>
          <p style={{ color: 'var(--text-light)', marginTop: 8 }}>
            Create meal plans with recipes to see predicted nutritional trends.
          </p>
        </div>
      </div>
    );
  }

  /* Build chart data from forecast predictions */
  const chartData = forecast.forecasts[0]?.predictedValues?.map((_, i) => {
    const point = { day: `Day ${i + 1}` };
    forecast.forecasts.forEach(f => {
      point[f.nutrientName] = Number(f.predictedValues[i]?.toFixed(1));
    });
    return point;
  }) || [];

  return (
    <div>
      <div className="page-header"><h1>Nutritional Forecast</h1></div>

      {/* Confidence cards */}
      <div className="summary-cards">
        {forecast.forecasts.map(f => (
          <div key={f.nutrientName} className="summary-card">
            <h3>{f.nutrientName.charAt(0).toUpperCase() + f.nutrientName.slice(1)}</h3>
            <div className="summary-value" style={{ color: COLORS[f.nutrientName] || 'var(--primary)' }}>
              {((f.rsquared ?? f.confidence ?? 0) * 100).toFixed(0)}%
            </div>
            <p>R-squared confidence</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>7-Day Predicted Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {forecast.forecasts.map(f => (
              <Line key={f.nutrientName} type="monotone" dataKey={f.nutrientName}
                    stroke={COLORS[f.nutrientName] || '#8884d8'} strokeWidth={2} dot={{ r: 4 }}
                    name={f.nutrientName.charAt(0).toUpperCase() + f.nutrientName.slice(1)} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast details table */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Forecast Details</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              {forecast.forecasts.map(f => (
                <th key={f.nutrientName}>{f.nutrientName.charAt(0).toUpperCase() + f.nutrientName.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i}>
                <td>{row.day}</td>
                {forecast.forecasts.map(f => (
                  <td key={f.nutrientName}>{row[f.nutrientName]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NutritionForecast;

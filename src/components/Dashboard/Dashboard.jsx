import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiBook, FiCalendar, FiPackage, FiShoppingCart } from 'react-icons/fi';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';

/* Color palette for chart segments */
const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626'];

/**
 * Dashboard page displaying summary statistics cards,
 * daily nutrition bar chart, and macro distribution pie chart.
 * Fetches aggregated data from the dashboard API endpoint.
 */
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getDashboard();
      setData(response.data);
    } catch {
      /* Dashboard loads even if API fails - shows empty state */
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  /* Prepare chart data from API response */
  const dailyData = data?.dailyNutrition || [];
  const macroData = data?.macroDistribution
    ? Object.entries(data.macroDistribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Summary statistics cards showing entity counts */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-icon blue"><FiBook /></div>
          <div className="summary-card-info">
            <h3>{data?.totalRecipes || 0}</h3>
            <p>Total Recipes</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon green"><FiCalendar /></div>
          <div className="summary-card-info">
            <h3>{data?.totalMealPlans || 0}</h3>
            <p>Meal Plans</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon orange"><FiPackage /></div>
          <div className="summary-card-info">
            <h3>{data?.totalIngredients || 0}</h3>
            <p>Ingredients</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon red"><FiShoppingCart /></div>
          <div className="summary-card-info">
            <h3>{data?.totalShoppingLists || 0}</h3>
            <p>Shopping Lists</p>
          </div>
        </div>
      </div>

      {/* Charts grid for daily nutrition and macro distribution */}
      <div className="charts-grid">
        {/* Daily nutrition bar chart showing calories, protein, carbs, fat per day */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daily Nutrition (Current Meal Plan)</h3>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#2563eb" name="Calories" />
                <Bar dataKey="protein" fill="#059669" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#d97706" name="Carbs (g)" />
                <Bar dataKey="fat" fill="#dc2626" name="Fat (g)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <h3>No meal plan data yet</h3>
              <p>Create a meal plan to see daily nutrition breakdown</p>
            </div>
          )}
        </div>

        {/* Macronutrient distribution pie chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Macro Distribution</h3>
          </div>
          {macroData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {macroData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <h3>No macro data available</h3>
              <p>Add recipes to your meal plan to see distribution</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

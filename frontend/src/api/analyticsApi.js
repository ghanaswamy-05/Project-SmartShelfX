// src/api/analyticsApi.js
const BASE_URL = "http://localhost:8080/api/analytics";

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getDashboardData = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const getSalesTrends = async (period = "MONTH", warehouse = "ALL") => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/sales-trends?period=${period}&warehouse=${warehouse}`, {
      method: "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    throw error;
  }
};
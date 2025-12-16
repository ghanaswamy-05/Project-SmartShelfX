const BASE_URL = "http://localhost:8080/api/products";

const handleResponse = async (response) => {
  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  const contentLength = response.headers.get('Content-Length');
  if (contentLength === '0' || response.status === 204) {
    return null;
  }

  return response.json();
};

export const getProducts = async () => {
  try {
    console.log('🔄 Fetching products from:', BASE_URL);
    const response = await fetch(BASE_URL);
    const data = await handleResponse(response);
    console.log('✅ Products loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (formData) => {
  try {
    console.log('🔄 Adding product with FormData');
    const response = await fetch(BASE_URL, {
      method: "POST",
      body: formData,
      // Don't set Content-Type - let browser set it with boundary
    });
    const data = await handleResponse(response);
    console.log('✅ Product added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, formData) => {
  try {
    console.log('🔄 Updating product ID:', id);
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: formData,
      // Don't set Content-Type - let browser set it with boundary
    });
    const data = await handleResponse(response);
    console.log('✅ Product updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    console.log('🔄 Deleting product ID:', id);
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE"
    });
    const data = await handleResponse(response);
    console.log('✅ Product deleted successfully');
    return data;
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
};
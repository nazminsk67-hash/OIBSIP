import api from './axiosConfig'

export const pizzaApi = {
  // Get all pizza varieties for the dashboard
  getAllPizzas: () =>
    api.get('/pizza'),

  // Get all builder options (base, sauce, cheese, veggies)
  getBuilderOptions: () =>
    api.get('/pizza/builder-options'),

  // Catalog pizza endpoints
  getPizzaById: (id) =>
    api.get(`/pizza/${id}`),
  getByCategory: (cat) =>
    api.get(`/pizza/category/${cat}`),
  createPizza: (data) =>
    api.post('/pizza/admin', data),
  updatePizza: (id, data) =>
    api.put(`/pizza/admin/${id}`, data),
  deletePizza: (id) =>
    api.delete(`/pizza/admin/${id}`),

  // Admin: update stock quantity for an ingredient
  updateStock: (ingredientId, data) =>
    api.patch(`/pizza/inventory/${ingredientId}`, data),

  // Admin: get full inventory
  getInventory: () =>
    api.get('/pizza/inventory'),
}

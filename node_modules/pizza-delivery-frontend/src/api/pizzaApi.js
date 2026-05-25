import api from './axiosConfig'

export const pizzaApi = {
  // Get all pizza varieties for the dashboard
  getAllPizzas: () =>
    api.get('/pizza'),

  // Get all builder options (base, sauce, cheese, veggies)
  getBuilderOptions: () =>
    api.get('/pizza/builder-options'),

  // Admin: update stock quantity for an ingredient
  updateStock: (ingredientId, data) =>
    api.patch(`/pizza/inventory/${ingredientId}`, data),

  // Admin: get full inventory
  getInventory: () =>
    api.get('/pizza/inventory'),
}

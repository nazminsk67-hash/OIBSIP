import toast from 'react-hot-toast'

/**
 * Notification utility for consistent app-wide notifications
 */

export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    })
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    })
  },

  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        position: 'top-right',
      }
    )
  },

  // Notification patterns for common actions
  paymentSuccess: () => notify.success('Payment processed successfully!'),
  paymentFailed: (reason) => notify.error(`Payment failed: ${reason}`),
  orderPlaced: () => notify.success('Order placed successfully! Track it in your orders.'),
  orderUpdated: () => notify.success('Order status updated.'),
  profileUpdated: () => notify.success('Profile updated successfully.'),
  passwordChanged: () => notify.success('Password changed successfully.'),
  itemAdded: (item) => notify.success(`${item} added to cart.`),
  itemRemoved: (item) => notify.success(`${item} removed from cart.`),
  favoritesAdded: (item) => notify.success(`${item} added to favorites.`),
  favoritesRemoved: (item) => notify.success(`${item} removed from favorites.`),
  pizzaCreated: () => notify.success('Pizza created successfully!'),
  pizzaUpdated: () => notify.success('Pizza updated successfully!'),
  pizzaDeleted: () => notify.success('Pizza deleted successfully!'),
  imageUploaded: () => notify.success('Image uploaded successfully!'),
}

export default notify

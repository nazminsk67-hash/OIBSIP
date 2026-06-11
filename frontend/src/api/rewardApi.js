import api from './axiosConfig'

export const rewardApi = {
  getMyRewards: () => api.get('/rewards'),
  getMyRewardHistory: () => api.get('/rewards/history'),
}

import axios from 'axios'

export const loadRequests = ({commit}, payload) => {
	axios.get(process.env.API_URL + '/requests').then((response) => {
		console.log(response.data)
		commit('loadRequests', response.data)
	})
}
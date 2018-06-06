import axios from 'axios'
import localForage from 'localforage'
import {isEmpty} from 'lodash'
import {setHttpToken} from '@/helpers'

export const register = ({commit, dispatch}, {payload, context}) => {
	context.loading = true
	context.error = null

	axios.post(process.env.API_URL + '/auth/register', {
		username: payload.username,
		password: payload.password,
		firstname: payload.firstname,
		lastname: payload.lastname,
		email: payload.email
	}).then((response) => {
		dispatch('login', {payload, context})
	}).catch((error) => {
		context.loading = false
		if (error.response) {
			context.error = error.response.data.Error
		} else {
			context.error = "Something went wrong. Please Try Again Later."
		}
	})
}

export const login = ({commit, dispatch}, {payload, context}) => {
	context.loading = true
	context.error = null
	axios.post(process.env.API_URL + '/auth/login', {
		username: payload.username,
		password: payload.password
	}).then((response) => {
		dispatch('setToken', response.data.token).then(() => {
			dispatch('getUser').then(() => {
				context.$router.push({
					name: 'requests'
				})
			})
		})
	}).catch((error) => {
		context.loading = false
		if (error.response) {
			context.error = error.response.status === 401 ? "Username and Password do not match." : "Something went wrong, please try again later"
		} else {
			context.error = "Something went wrong, please try again later (there was no response from the server)"
		}
	})
}

export const setToken = ({commit, dispatch}, token) => {
	// trigger the setToken mutation
	commit('setToken', token)
}

export const getUserIfNull = ({commit, state, dispatch}, payload) => {
	if (state.user == null) {
		return dispatch('getUser')
	} else {
		return Promise.resolve(true)
	}
}

export const getUser = ({commit}, payload) => {
	return axios.get(process.env.API_URL + '/auth/user').then((response) => {
		// set the user data in the store
		commit('setUser', response.data)
		// set the authenticated state in the store to true
		commit('setAuthenticated', true)
	}).catch((error) => {
		console.log(error)
	})
}

export const refreshToken = ({commit, dispatch}, payload) => {
	return axios.get(process.env.API_URL + '/refresh_token').then((response) => {
		dispatch('setToken', response.data.token)
		return Promise.resolve(response.data.token)
	}).catch((error) => {
		dispatch('setToken', null)
		return Promise.reject('REFRESHING_TOKEN_FAILED')
	})
}

export const checkTokenExists = ({commit, dispatch}, payload) => {
	return localForage.getItem('authtoken').then((token) => {
		if (isEmpty(token)) {
			return Promise.reject('NO_STORAGE_TOKEN')
		}
		return dispatch('refreshToken').then((token) => {
			return Promise.resolve(token)
		}).catch((error) => {
			return Promise.reject(error)
		})

	})
}

export const logout = ({commit, dispatch}, payload) => {
	dispatch('setToken', null)
	commit('setUser', null)
	commit('setAuthenticated', false)
}

export const updateProfile = ({commit, dispatch}, {payload, context}) => {
	context.profile.loading = true
	context.profileerror = null

	axios.put(process.env.API_URL + '/vendor/' + payload.ID, payload).then((response) => {
		dispatch('common/addAlert', {
			payload: {
				message: "Your Settings Have Been Updated",
				id: null
			}
		}, {root: true})
		context.profile.loading = false
	}).catch((error) => {
		context.profile.loading = false
		context.profile.error = error;
	})
}

export const updatePassword = ({commit, dispatch}, {payload, context}) => {
	context.password.loading = true
	context.password.error = ''

	axios.put(process.env.API_URL + '/vendor/' + payload.ID + '/updatePassword', payload.passwordData).then((response) => {
		dispatch('common/addAlert', {
			payload: {
				message: "Your Password Has Been Updated"
			}
		}, {root: true})
		context.password.loading = false
		context.password.oldpassword = ''
		context.password.newpassword = ''
		context.password.newpasswordconfirm = ''
	}).catch((error) => {
		context.password.loading = false
		context.password.error = error.response.data.Error
		console.log(error.response.data.Error)
	})
}
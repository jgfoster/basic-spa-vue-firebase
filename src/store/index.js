import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import axios from 'axios'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    appTitle: 'Mastery Grading',
    user: null,
    error: null,
    lastCall: null,
    loading: false,
    thisCall: null
  },
  mutations: {
    setError (state, payload) {
      state.error = payload
    },
    setIsCallInProgress (state, payload) {
      state.isCallInProgress = payload
    },
    setLastCall (state, payload) {
      state.lastCall = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setThisCall (state, payload) {
      state.thisCall = payload
    },
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    // payload = { path: "method.gs", args: {}}
    server ({commit}, payload) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true)
        var seconds = 0
        var msStart = (new Date()).getTime()
        commit('setThisCall', payload.path + ' (0)')
        var timer = setInterval(() => {
          seconds = seconds + 1
          commit('setThisCall', payload.path + ' (' + seconds + ')')
        }, 1000) // milliseconds
        var args = payload.args ? payload.args : { }
        args.session = this.state.session
        commit('setIsCallInProgress', true)
        var ensure = (data) => {
          clearInterval(timer)
          commit('setThisCall', null)
          commit('setIsCallInProgress', false)
          var msStop = (new Date()).getTime()
          var string = payload.path + ' ('
          if (data.time) {
            string = string + data.time + 'ms server + ' + (msStop - msStart - data.time)
          } else {
            string = string + (msStop - msStart)
          }
          string = string + 'ms other)'
          console.log(string)
          commit('setLastCall', string)
          commit('setLoading', false)
        }
        axios.post(payload.path, args)
          .then(result => {
            ensure(result.data)
            var flag = result.data.success
            delete result.data.success
            delete result.data.time
            store.commit('setUser', result.data.username)
            delete result.data.username
            if (flag) {
              resolve(result.data)
            } else {
              commit('setError', result.data.error)
              reject(result.data.error)
            }
          }, error => {
            ensure(error)
            if (error.response.status === 404) {
              commit('setError', error.response.statusText + ': ' + error.request.responseURL)
            } else {
              commit('setError', error)
            }
            reject(error)
          })
      })
    },
    autoSignIn (store, payload) {
      store.commit('setLoading', true)
      store.dispatch(
        'server', { path: 'username.gs' })
        .then(result => {
          console.log('autoSignIn as', result.username)
          store.commit('setLoading', false)
          if (result.username) {
            store.commit('setUser', result.username)
            router.push('/home')
          }
        },
        error => {
          store.commit('setLoading', false)
          console.log(error)
        })
    },
    userSignOut (store) {
      store.commit('setUser', null)
      store.dispatch('server', { path: 'signout.gs' })
      router.push('/')
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.user !== null && state.user !== undefined
    },
    isCallInProgress (state) {
      return state.isCallInProgress
    }
  }
})

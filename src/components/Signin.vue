<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center" mt-5>
        <h1>Sign In</h1>
      </v-flex>
      <v-flex xs12 sm6 offset-sm3 mt-3>
        <form @submit.prevent="userSignIn">
          <v-layout column>
            <v-flex>
              <v-alert type="error" dismissible v-model="alert">
                {{ error }}
              </v-alert>
            </v-flex>
            <v-flex>
              <v-text-field
                name="username"
                label="CS Lab LDAP User ID (six characters)"
                id="username"
                type="text"
                v-model="username"
                autocomplete="username"
                required></v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                name="password"
                label="Password"
                id="password"
                type="password"
                v-model="password"
                autocomplete="current-password"
                required></v-text-field>
            </v-flex>
            <v-flex class="text-xs-center" mt-5>
              <v-btn color="primary" type="submit">Sign In</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      username: '',
      password: '',
      alert: false
    }
  },
  methods: {
    userSignIn () {
      this.$store.commit('setLoading', true)
      this.$store.commit('setError', null)
      this.$store.dispatch(
        'server',
        {
          path: 'signin.gs',
          args: { username: this.username, password: this.password }
        })
        .then(result => {
          this.$store.commit('setLoading', false)
          this.$store.commit('setUser', result.username)
          this.$router.push('/home')
        },
        error => {
          console.log('Signin error from dispatch to server: ', error)
          this.$store.commit('setLoading', false)
        })
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    loading () {
      return this.$store.state.loading
    }
  },
  watch: {
    error (value) {
      if (value) {
        this.alert = true
      }
    },
    alert (value) {
      if (!value) {
        this.$store.commit('setError', null)
      }
    }
  }
}
</script>

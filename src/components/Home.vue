<template>
  <v-container fluid>
    <v-layout row>
      <v-flex xs6>
        <v-card>
          <v-toolbar color="teal" dark>
            <v-toolbar-title>Courses</v-toolbar-title>
          </v-toolbar>
          <v-list>
            <v-list-group
              v-for="course in courses"
              v-model="course.active"
              :key="course.id"
              prepend-icon="school"
              no-action
            >
              <v-list-tile
                slot="activator"
                @click="setCourse(course)"
              >
                <v-list-tile-content>
                  <v-list-tile-title>{{ course.id }}: {{ course.name }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile
                v-for="student in course.students"
                :key="student.id"
                @click="setStudent(student)"
              >
                <v-icon>account_circle</v-icon>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ student.csLabId }}: {{ student.name }} ({{ student.id }})
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs6>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      course: null,
      courses: [],
      students: []
    }
  },
  methods: {
    setCourse (course) {
      console.log(course.name)
      this.course = course
    },
    setStudent (student) {
      console.log(student.name)
    }
  },
  destroyed () {
  },
  mounted () {
    this.$store.commit('setLoading', true)
    this.$store.dispatch(
      'server', { path: 'courses.gs' })
      .then(result => {
        this.courses = result.courses
        this.$store.commit('setLoading', false)
      },
      error => {
        console.log(error)
        this.$store.commit('setLoading', false)
      })
  }
}
</script>

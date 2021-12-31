<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        Light Show Validator for Tesla Vehicles
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/teslamotors/light-show"
        target="_blank"
        text
      >
        <span class="mr-2">Light Show Docs</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Validator/>
    </v-main>
  </v-app>
</template>

<script>
import Validator from './components/Validator';

export default {
  name: 'App',

  components: {
    Validator,
  },

  data: () => ({
    //
  }),
};
</script>

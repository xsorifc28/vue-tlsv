<template>
  <v-app id="inspire">
    <v-main class="grey lighten-3">
      <v-container>
        <v-stepper v-model="stepperStep" vertical>
          <v-stepper-step :complete="stepperStep > 1" step="1">Select FSEQ File</v-stepper-step>

          <v-stepper-content step="1">
            <v-container>
              <v-row>
                <v-col cols="8" offset="2" class="drop" align-self="center">
                  <input ref="fseqFile"
                      id="file"
                      type="file"
                      accept=".fseq"
                      @change="fileSelected" />
                  <label id="label" for="file">
                    <v-icon x-large>mdi-file-upload-outline</v-icon>
                    <br />
                    <br />
                    <span class="text-h5">Choose an FSEQ file</span>
                    <br />
                  </label>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>

          <v-stepper-step :complete="stepperStep > 2" step="2">
            Validate File
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-container>
              <v-row>
                <v-col cols="8" offset="2" class="drop" align-self="center">
                  <div>
                    <br />
                    <v-progress-circular :size="50" color="secondary" indeterminate v-show="processingFile"></v-progress-circular>
                    <v-alert :type="overallAlertType">{{ overallAlertMessage }}</v-alert>

                    <div v-for="warning in warningMessages" :key="warning">
                      <v-alert type="warning" outlined>{{ warning }}</v-alert>
                    </div>

                    <div v-for="error in errorMessages" :key="error">
                      <v-alert type="error" outlined>{{ error }}</v-alert>
                    </div>

                    <div v-for="success in successMessages" :key="success">
                      <v-alert type="success" outlined>{{ success }}</v-alert>
                    </div>
                  </div>
                  <v-btn text @click="resetStepper"> Start Over </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper>
        <br>
        By selecting a file, you are agreeing to the <Disclaimer />.
        <br>
        This website and its contents are not affiliated with or endorsed by Tesla Inc.
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

import { Validator, ErrorType, buildErrorMessages } from '@xsor/tlsv';
import Disclaimer from '@/components/Disclaimer';

export default {
  name: 'Validator',
  components: {Disclaimer},
  data() {
    return {
      fileName: null,
      hasFile: false,
      stepperStep: 1,
      processingFile: false,

      overallAlertType: 'success',
      overallAlertMessage: '',
      successMessages: [],
      warningMessages: [],
      errorMessages: [],
    };
  },
  methods: {
    async fileSelected(event) {
      let file = event.target.files[0];
      if (!file) {
        // File select canceled
        this.hasFile = false;
        return;
      }

      this.hasFile = true;
      this.fileName = file.name;
      this.stepperStep = 2;
      this.processingFile = true;

      // Reset
      this.successMessages = []
      this.warningMessages = []
      this.errorMessages = []

      let validation = await this.validate(file);
      this.errorMessages = buildErrorMessages(validation);

      if(this.fileName !== 'lightshow.fseq') {
        this.warningMessages.push('Filename should be \'lightshow.fseq\'');
      } else {
        this.successMessages.push('Filename is lightshow.fseq');
      }

      if (!validation.errors.includes(ErrorType.Duration)) {
        let durationFormatted = new Date(validation.duration * 1000).toISOString().substr(11, 12);
        this.successMessages.push(`Found ${validation.frameCount} frames, step time of ${validation.stepTime} ms for a total duration of ${durationFormatted}`);
      }

      if (!validation.errors.includes(ErrorType.Memory)) {
        const memoryUsage = parseFloat((validation.memoryUsage * 100).toFixed(2));
        this.successMessages.push(`Used ${memoryUsage}% of the available memory (using ${validation.commandCount} out of 681 allowed commands)`);
      }

      if (validation.errors > 0) {
        this.overallAlertType = 'error';
        this.overallAlertMessage = 'Light Show is invalid';
      } else {
        this.overallAlertType = 'success';
        this.overallAlertMessage = 'Light Show is Valid';
      }

      this.processingFile = false;
    },

    async validate(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(Validator(e.target.result));
        };

        reader.onerror = function(e) {
          resolve({
            error: 'Error reading file: ' + e.message
          });
        };

        reader.readAsArrayBuffer(file);
      });
    },
    resetStepper() {
      this.stepperStep = 1;
    },
  },
};
</script>

<style scoped>
.v-tab {
  justify-content: left !important;
}
.v-card {
  height: 50vh !important;
}
.drop {
  text-align: center;
  padding: 30px 20px 50px 20px;
}

.drop.hover {
  outline-offset: -10px;
  background-color: rgba(255, 255, 255, 0.15);
}
#file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  z-index: -1;
}
#label {
  cursor: pointer;
}
#label:hover strong {
  color: #8bb5ba;
}
#select {
  position: absolute;
  left: 0;
  right: 0;
  visibility: hidden;
}
</style>
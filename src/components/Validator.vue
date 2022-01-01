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
                    <v-alert v-show="hasFile && !processingFile && fileNameAlertMessage" outlined :type="fileNameAlertType">{{ fileNameAlertMessage }}</v-alert>
                    <v-alert v-show="hasFile && !processingFile && durationAlertMessage" outlined :type="durationAlertType">{{ durationAlertMessage }}</v-alert>
                    <v-alert v-show="hasFile && !processingFile && memoryAlertMessage" outlined :type="memoryAlertType">{{ memoryAlertMessage }}</v-alert>
                    <v-alert v-show="hasFile && !processingFile && otherErrorAlertMessage" outlined :type="otherErrorAlertType">{{ otherErrorAlertMessage }}</v-alert>
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

import { Validator } from '@xsor/tlsv';
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
      fileNameAlertType: 'success',
      fileNameAlertMessage: '',
      memoryAlertType: 'success',
      memoryAlertMessage: '',
      durationAlertType: 'success',
      durationAlertMessage: '',
      otherErrorAlertType: 'success',
      otherErrorAlertMessage: '',
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

      // Reset values to defaults. This needs to be done because subsequent file uploads wouldn't always overwrite these values,
      // and this could lead to the website displaying error messages from previous analyzations.
      this.durationAlertType = 'success'
      this.durationAlertMessage = ''
      this.memoryAlertMessage = 'success'
      this.memoryAlertMessage = ''
      this.otherErrorAlertType = 'success';
      this.otherErrorAlertMessage = '';

      let validation = await this.validate(file);
      let resultsKeys = Object.keys(validation.results);

      if(this.fileName !== 'lightshow.fseq') {
        this.fileNameAlertType = 'warning';
        this.fileNameAlertMessage = 'Filename should be \'lightshow.fseq\'';
      } else {
        this.fileNameAlertType = 'success';
        this.fileNameAlertMessage = 'Filename is lightshow.fseq';
      }

      let anyErrorExists = false;

      if (resultsKeys.includes('4')) {
        let durationResults = validation.results[4];
        if (durationResults.isValid) {
          let durationFormatted = new Date(validation.duration * 1000).toISOString().substr(11, 12);
          this.durationAlertType = 'success';
          this.durationAlertMessage = `Found ${validation.frameCount} frames, step time of ${validation.stepTime} ms for a total duration of ${durationFormatted}`;
        } else {
          this.durationAlertType = 'error';
          this.durationAlertMessage = durationResults.message;
          anyErrorExists = true;
        }
      }

      if (resultsKeys.includes('5')) {
        let memoryResults = validation.results[5];
        if (memoryResults.isValid) {
          const memoryUsage = parseFloat((validation.memoryUsage * 100).toFixed(2));
          this.memoryAlertType = 'success';
          this.memoryAlertMessage = `Used ${memoryUsage}% of the available memory (using ${validation.commandCount} out of 681 allowed commands)`;
        } else {
          this.memoryAlertType = 'error';
          this.memoryAlertMessage = memoryResults.message;
          anyErrorExists = true;
        }
      }

      resultsKeys.forEach(function(key) {
        if (['1', '2', '3'].includes(key)) {
          let value = validation.results[key];
          console.log(value)
          if (!value.isValid) {
            this.otherErrorAlertType = 'error';
            this.otherErrorAlertMessage = value.message;
            anyErrorExists = true
          }
        }
      }, this)

      if (anyErrorExists) {
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
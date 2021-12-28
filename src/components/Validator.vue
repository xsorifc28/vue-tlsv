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
                  <div class="text-subtitle-1">
                    Validating file...
                  </div>
                  <br />
                  <div>
                    <br />
                    <v-progress-circular
                        :size="50"
                        color="secondary"
                        indeterminate
                        v-show="processingDfu"
                    ></v-progress-circular>

                    <v-alert v-show="hasFile && !processingFile" outlined :type="alertType">{{ validationMessage }}</v-alert>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

import fseqValidator from '../utils/validator';

export default {
  name: 'Validator',
  data() {
    return {
      fileName: null,
      fileValid: false,
      processingFile: false,
      hasFile: false,
      stepperStep: 1,
      processingDfu: false,
      alertType: 'success'

    };
  },
  methods: {
    async fileSelected(event) {
      let file = event.target.files[0];
      if (!file) {
        // File select canceled
        this.processingFile = false;
        this.hasFile = false;
        this.fileValid = false;
        return;
      }
      this.processingFile = true;
      this.fileValid = false;
      this.hasFile = true;
      this.fileName = file.name;
      if(this.fileName !== 'lightshow.fseq') {
        console.error('Filename should be lightshow.fseq')
      }
      this.stepperStep = 2;
      this.processingDfu = true;
      let validation = await this.validate(file);
      this.processingFile = false;
      console.log(validation);

      if(validation.error) {
        this.validationMessage = validation.error;
        console.error(validation.error);
        this.alertType = 'error';
      }
      this.processingDfu = false;
    },

    async validate(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(fseqValidator(e.target.result));
        };

        reader.onerror = function(e) {
          resolve({
            error: 'Error reading file: ' + e.message
          });
        };

        reader.readAsArrayBuffer(file);
      });
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
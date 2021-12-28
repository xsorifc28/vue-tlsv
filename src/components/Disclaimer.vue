<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ on, attrs }">
      <a href="#" v-bind="attrs" v-on="on">disclaimer</a>
    </template>
    <v-card>
      <v-card-title class="text-h5">
        Disclaimer
      </v-card-title>
      <v-card-text>
        <p>Last updated: December 28, 2021</p>
        <p><b>Interpretation</b></p>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions.
          The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        <p><b>Definitions</b></p>
        <p>For the purposes of this Disclaimer:</p>
        <ul>
          <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Disclaimer) refers to Light Show Validator.</li>
          <li><strong>Service</strong> refers to the Website.</li>
          <li><strong>You</strong> means the individual accessing the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          <li><strong>Website</strong> refers to Light Show Validator</li>
        </ul>
        <br>
        <p><b>Disclaimer</b></p>
        <p>The information contained on the Service is for general information purposes only.</p>
        <p>The Company assumes no responsibility for errors or omissions in the contents of the Service.</p>
        <p>In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. The Company reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.</p>
        <p>The Company does not warrant that the Service is free of viruses or other harmful components.</p>
        <p><b>Errors and Omissions Disclaimer</b></p>
        <p>The information given by the Service is for general guidance on matters of interest only. Even if the Company takes every precaution to insure that the content of the Service is both current and accurate, errors can occur. Plus, given the changing nature of laws, rules and regulations, there may be delays, omissions or inaccuracies in the information contained on the Service.</p>
        <p>The Company is not responsible for any errors or omissions, or for the results obtained from the use of this information.</p>
        <p>All information in the Service is provided &quot;as is&quot;, with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose.</p>
        <p>The Company will not be liable to You or anyone else for any decision made or action taken in reliance on the information given by the Service or for any consequential, special or similar damages, even if advised of the possibility of such damages.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Disclaimer'
}
</script>

<style scoped>

</style>
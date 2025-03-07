<template>
  <div v-if="artifact_local">
    <v-sheet border class="my-2">
      <v-card class="mx-auto" elevation="0">
        <v-card-title> {{ artifact_local.title }} </v-card-title>
        <v-card-text>
          <a target="_blank" :href="artifact_local.url" rel="noopener">
            {{ artifact_local.url }}
          </a>
        </v-card-text>
      </v-card>
    </v-sheet>
    <v-sheet border class="my-2">
      <v-card class="mx-auto" elevation="0">
        
        <v-card-title>Edit Relationship</v-card-title>
        <v-card-text>Want to edit content? <v-btn variant="text" size="small" color="primary" :to="`/artifact/${artifact_local.artifact_group_id}/${artifact_local.id}?edit=true`">Click here</v-btn></v-card-text>

        <v-divider></v-divider>

        <ArtifactRelationView :artifact_group="artifact_local.artifact_group" edit></ArtifactRelationView>

        <div>
          <v-dialog
            transition="dialog-bottom-transition"
            persistent
            fullscreen
            v-model="artifactdialog"
          >
            <template v-slot:activator="{ props }">
              <v-card-actions class="mt-n4">
                <v-row>
                  <v-col cols="12" md="2"></v-col>
                  <v-col cols="12" md="10">
                    <v-btn
                      color="primary"
                      id="btn-open-relation-modal"
                      block variant="tonal"
                      v-bind="props"
                      :disabled="artifact_local.id ? false : true"
                    >
                      Add New Relation
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </template>
            <template v-slot:default>
              <v-card>
                <v-card-title>
                  <span class="text-h5">Search for Related Artifacts</span>
                </v-card-title>
                <SearchCard :search="search" related></SearchCard>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    id="btn-close-relation-modal"
                    class="bg-error ml-2 mb-2"
                    variant="text"
                    @click="artifactdialog = false"
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </div>
      </v-card>
    </v-sheet>

  </div>
  <!-- The loading is needed because otherwise the var dereferences above would cause a failure to load if the data is not available yet -->
  <div v-else>
    {{ loadingMessage }}
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import schemaWithPointers from '~/schema/artifact.json'
import affiliationSchemaWithPointers from '~/schema/affiliation.json'
import ArtifactRelationView from './ArtifactRelationView.vue'

export default defineComponent({
  name: 'KGArtifactEditRelation',
  props: {
    record: {
      type: Object,
      required: true
    },
    create: {
      type: Boolean,
      required: false
    }
  },
  components: {
    SearchCard: defineAsyncComponent(() => import("@/components/SearchCard")),
    ArtifactRelationView: defineAsyncComponent(() => import("@/components/ArtifactRelationView")),
},
  data() {
    return {
      loading: true,
      loadingMessage: 'Loading...',
      artifact_local: {},
      meta: {
        creators: [],
        keywords: [],
        files: [],
        languages: [],
        relations: [],
        badges: []
      },
      artifactdialog: false,
      search: '',
      possibleLicenses: [],
    }
  },
  async created() {
    this.$resolver.resolve(schemaWithPointers).then(schema => {
      this.schema = schema.result
      this.schemaLoaded = true
    }).catch(err => {
      // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
      // including referenced files, combined into a single object
      console.error(err)
    })
    this.$resolver.resolve(affiliationSchemaWithPointers).then(schema => {
      this.affiliationSchema = schema.result
      this.schemaLoaded = true
    }).catch(err => {
      // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
      // including referenced files, combined into a single object
      console.error(err)
    });
    this.artifact_local = JSON.parse(JSON.stringify(this.record.artifact))
    this.meta.languages = this.getLanguages()
    this.meta.keywords = this.getPossibleTags()
    let response = await this.$licenseEndpoint.index({ verified: 1, all: 1 })
    this.possibleLicenses =
      typeof response !== 'undefined' ? response.licenses : []
  },
  mounted() {
    // force title and description to refresh on page load
    if (this.title && this.description) return true
    setTimeout(() => {
      this.loadingMessage = 'Error loading'
    }, 5000)
    this.$on('close', this.closeHandler)
    this.$userStore.fetchOrgs()
    this.$userStore.fetchBadges()
  },
  watch: {
    record(val) {
      this.artifact_local = JSON.parse(JSON.stringify(val.artifact))
      this.meta.languages = this.getLanguages()
      this.meta.keywords = this.getPossibleTags()
    },
    artifact_local(val) {
      this.meta.languages = this.getLanguages()
      this.meta.keywords = this.getPossibleTags()
    }
  },
  methods: {
    getPossibleTags() {
      let tags = []
      // console.log(this.artifact_local)
      if (typeof this.artifact_local.tags === 'undefined' 
        || this.artifact_local.tags.length > 0) return []
      let top = this.artifact_local.meta
        ? this.artifact_local.meta.find(o => o.name == 'top_keywords')
        : null
      if (top) {
        tags = tags.concat(JSON.parse(top.value).map(e => e[0]))
      }
      top = this.artifact_local.meta
        ? this.artifact_local.meta.find(o => o.name == 'top_ngram_keywords')
        : null
      if (top) {
        tags = tags.concat(JSON.parse(top.value).map(e => e[0]))
      }
      // return only unique
      let t = [...new Set(tags)]
      t = t.filter(el => !this.artifact_local.tags.map(e => e.tag).includes(el))
      return t
    },
    getLanguages() {
      let csv = this.artifact_local.meta.find(o => o.name == 'languages')
      if (csv) {
        return csv.value ? csv.value.split(',') : []
      } else {
        return []
      }
    },
    closeHandler(dialog) {
      switch (dialog) {
        case 'artifactdialog': {
          this.artifactdialog = false
        }
      }
    },
  }
});
</script>

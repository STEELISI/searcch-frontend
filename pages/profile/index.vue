<template>
  <v-container>
    <v-row justify="start" align="start">
      <v-container fill-height fluid>
        <v-row justify="center">
          <v-col cols="12" md="4" v-if="localuser">
            <LazyHydrate never>
              <material-card class="v-card-profile">
                <v-avatar
                  slot="offset"
                  class="mx-auto d-block elevation-6"
                  size="130"
                >
                  <v-img :src="profileImage(localuser.email)"></v-img>
                </v-avatar>
                <v-card-text class="text-center">
                  <h6 class="text-overline mb-3">
                    {{ localuser.name }}
                  </h6>
                  <h6
                    class="text-overline mb-3"
                    v-if="userAffiliation"
                    v-for="affil in userAffiliation"
                  >
                    <div v-if="affil.org">{{ affil.org.name }}</div>
                  </h6>

                  <p class="font-weight-light">
                    {{ localuser.email }}
                  </p>
                </v-card-text>
              </material-card>
            </LazyHydrate>
          </v-col>

          <v-col cols="12" md="8">
            <material-card
              color="primary"
              title="Edit Profile"
              text="Complete your profile"
            >
              <v-form>
                <v-container class="py-0">
                  <v-row v-if="localuser">
                    <v-col cols="12" md="8">
                      <v-text-field
                        label="Name"
                        class="primary-input"
                        v-model="localuser.name"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        label="Email Address"
                        class="primary-input"
                        v-model="localuser.email"
                        readonly
                        disabled
                      />
                    </v-col>

                    <v-col cols="12" md="12">
                      <v-text-field
                        label="Website"
                        class="primary-input"
                        v-model="localuser.website"
                      />
                    </v-col>
                    <v-col cols="12" md="12">
                      <v-combobox
                        v-if="localuser"
                        label="Interests"
                        multiple
                        chips
                        closable-chips
                        persistent-hint
                        :items="hardcodedInterests"
                        v-model="researchInterests"
                        hint="Select applicable items from the list or type in your own"
                        v-model:search-input="interestSearch"
                        return-object
                      >
                        <template v-slot:no-data>
                          <v-list-item>
                            <v-list-item-title>
                              No results matching "<strong>{{
                                interestSearch
                              }}</strong
                              >". Press <kbd>tab</kbd> to create a new one item.
                            </v-list-item-title>
                          </v-list-item>
                        </template>
                      </v-combobox>
                    </v-col>

                    <v-col cols="12" md="12">
                      <v-combobox
                        label="Affiliation"
                        multiple
                        chips
                        closable-chips
                        persistent-hint
                        :items="orgNames"
                        v-model="userAffiliation"
                        hint="Select applicable organization from the list or type in your own"
                        v-model:search-input="orgSearch"
                        item-title="org.name"
                        item-value="org.name"
                        return-object
                      >
                        <template v-slot:no-data>
                          <v-list-item>
                            <v-list-item-title>
                              No results matching "<strong>{{
                                orgSearch
                              }}</strong
                              >". Press <kbd>tab</kbd> to create a new one
                            </v-list-item-title>
                          </v-list-item>
                        </template>
                      </v-combobox>
                    </v-col>

                    <v-col cols="12" class="text-right">
                      <v-btn color="success" @click="updateProfile">
                        Update Profile
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </material-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container fluid>
        <v-row>
          <v-col cols="12" lg="12">
            <LazyHydrate when-visible>
              <material-card class="card-tabs" color="primary">
                <template v-slot:header>
                  <v-tabs
                    v-model="tabs"
                    bg-color="transparent"
                    slider-color="white"
                    class="ml-4"
                  >
                    <v-tab class="mr-3">
                      <v-icon class="mr-2">
                        mdi-database
                      </v-icon>
                      Artifacts
                    </v-tab>
                    <v-tab class="mr-3">
                      <v-icon class="mr-2">
                        mdi-star
                      </v-icon>
                      Ratings
                    </v-tab>
                    <v-tab>
                      <v-icon class="mr-2">
                        mdi-heart
                      </v-icon>
                      Favorites
                    </v-tab>
                  </v-tabs>
                </template>

                <v-window v-model="tabs">
                  <v-window-item>
                    <!-- artifacts -->
                    <v-timeline align="start" density="compact" v-if="dashboard.owned_artifacts">
                      <v-timeline-item
                        v-for="item in sortedArtifacts"
                        :key="item.id"
                        :dot-color="iconColor(item.type)"
                        :icon="iconImage(item.type)"
                        size="small"
                      >
                        <div>
                          <div class="font-weight-normal">
                            <strong>{{ new Date(item.ctime) }}</strong>
                          </div>
                          <div>
                            {{ item.title }}
                            <v-btn
                              size="small"
                              variant="plain"
                              :to="`/artifact/${item.artifact_group_id}/${item.id}`"
                              icon="mdi-arrow-top-right-thick"
                            >
                            </v-btn>
                          </div>
                        </div>
                      </v-timeline-item>
                    </v-timeline>
                  </v-window-item>
                  <v-window-item>
                    <!-- ratings -->
                    <v-list
                      single-line
                      class="py-0"
                      v-for="(item, i) in dashboard.given_ratings"
                      :key="i"
                    >
                      <v-list-item>
                        <ArtifactChips
                          :modelValue="[item.type]"
                          :type="item.type"
                        ></ArtifactChips>

                        <v-list-item-title v-text="item.title" />

                        <div class="d-flex">
                          <v-tooltip location="top" content-class="top">
                            <template v-slot:activator="{ attrs, on }">
                              <v-chip
                                color="amber"
                                class="ma-2"
                                label
                                :to="`/artifact/review/${item.artifact_group_id}`"
                              >
                                <v-avatar start>
                                  <v-icon> mdi-star </v-icon>
                                </v-avatar>
                                <div>{{ item.rating }}</div>
                              </v-chip>
                            </template>
                            <span>Goto Rating</span>
                          </v-tooltip>
                        </div>
                      </v-list-item>
                      <v-divider />
                    </v-list>
                  </v-window-item>
                  <v-window-item>
                    <!-- favorites -->
                    <v-list
                      single-line
                      class="py-0"
                      v-for="(item, i) in dashboard.favorite_artifacts"
                      :key="i"
                    >
                      <v-list-item>
                        <ArtifactChips
                          :modelValue="[item.type]"
                          :type="item.type"
                        ></ArtifactChips>
                        <v-list-item-title
                          v-text="item.title"
                        ></v-list-item-title>
                        <div class="d-flex">
                          <v-tooltip location="top" content-class="top">
                            <template v-slot:activator="{ attrs, on }">
                              <v-btn
                                class="v-btn--simple"
                                color="primary"
                                icon
                                v-bind="attrs"
                                v-on="on"
                                :to="`/artifact/${item.artifact_group_id}`"
                              >
                                <v-icon color="primary">
                                  mdi-arrow-top-right-thick
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Goto Artifact</span>
                          </v-tooltip>
                        </div>
                      </v-list-item>
                      <v-divider />
                    </v-list>
                  </v-window-item>
                </v-window>
              </material-card>
            </LazyHydrate>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { mapState } from 'pinia'
import { userStore } from '~/stores/user'
import { artifactIcon, artifactColor } from '@/helpers'
import schemaWithPointers from '~/schema/affiliation.json'
import md5 from 'md5'

export default defineComponent({
  components: {
    ArtifactChips: defineAsyncComponent(() => import('@/components/ArtifactChips'))
  },
  head() {
    return {
      title: 'SEARCCH User Profile',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'SEARCCH User Profile'
        }
      ]
    }
  },
  data() {
    return {
      // TODO: FIXME get dynamically from backend once there are enough entries
      hardcodedInterests: [
        'Application Security',
        'Artificial Intelligence',
        'Biometrics',
        'Cloud Computing',
        'Cybersecurity',
        'Data Security',
        'Human-based Behavior',
        'Internet of Things',
        'Machine Learning',
        'Mobile',
        'Organizational Security Management',
        'Policy',
        'Privacy',
        'Secure Development',
        'Software Development',
        'Testbeds'
      ],
      tabs: 0,
      dashboard: {},
      // owned_artifacts: [],
      schema: {},
      schemaLoaded: false,
      userAffiliation: [],
      orgSearch: null,
      interestSearch: null,
      localuser: null
    }
  },
  computed: {
    ...mapState(userStore, {
      user: state => state.user,
      organization: state => state.organization,
      userid: state => state.userid,
      orgs: state => state.orgs,
      interests: state => state.interests,
      authUser: state => state.authUser
    }),
    orgNames: {
      get: function() {
        return this.orgs ? this.orgs.map(m => m.name) : []
      }
    },
    researchInterests: {
      get: function() {
        return this.localuser.research_interests
          ? this.localuser.research_interests.split(',')
          : ''
      },
      set: function(newValue) {
        this.localuser.research_interests = newValue.join(',')
      }
    },
    types: function() {
      if (this.schemaLoaded) {
        return this.schema.properties.type.enum
      } else return []
    },
    sortedArtifacts: function() {
      if (typeof this.dashboard.owned_artifacts !== 'undefined') {
        return this.dashboard.owned_artifacts.sort(function(a, b) {
          // reverse sort order
          if (a.ctime < b.ctime) return 1
          if (a.ctime > b.ctime) return -1
          return 0
        })
      } else return []
    }
  },
  watch: {
    userAffiliation(newValue, oldValue) {
      // delete case
      let diff = oldValue.filter(
        affil => newValue.findIndex(newAffil => newAffil.id == affil.id) == -1
      )
      if (diff.length > 0) {
        diff.forEach(affil => {
          if (typeof affil === 'object') {
            // cannot use await here as this is inside a foreach loop
            this.$userAffiliationEndpoint.delete(affil.id)
          }
        })
        diff = []
      }
    },
    organization(val) {
      this.userAffiliation = val
    },
    user(val) {
      this.localuser = JSON.parse(JSON.stringify(val))
    }
  },
  async mounted() {
    this.$userStore.fetchUser()
    this.$userStore.fetchOrgs()
    this.$userStore.fetchInterests()
    let response = await this.$dashboardEndpoint.index()
    this.dashboard = response
    this.userAffiliation = this.organization ? this.organization : []
    this.localuser = JSON.parse(JSON.stringify(this.user))
  },
  created() {
    this.$resolver.resolve(schemaWithPointers).then(schema => {
      this.schema = schema.result
      this.schemaLoaded = true
    }).catch(err => {
      // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
      // including referenced files, combined into a single object
      console.error(err)
    })
  },
  methods: {
    async updateProfile() {
      if (!this.$auth.loggedIn) {
        navigateTo('/login')
      } else {
        await this.$userEndpoint.update(this.userid, this.localuser)

        // create any affiliations that were added
        this.userAffiliation.forEach((affil, index, object) => {
          if (typeof affil === 'string') {
            this.$userStore.createAffiliation(affil)
            object.splice(index, 1)
          }
        })
        this.$userStore.fetchUser()
      }
    },
    iconColor(type) {
      return artifactColor(type)
    },
    iconImage(type) {
      return artifactIcon(type)
    },
    profileImage(email) {
      if (typeof this.authUser !== 'undefined') {
        if (typeof this.authUser.avatar_url !== 'undefined'
            && this.authUser.avatar_url.length > 0) {
          return this.authUser.avatar_url + '&size=130'
        }
      }
      const url =
        'https://www.gravatar.com/avatar/' +
        md5(email.toLowerCase().trim()) +
        '?size=130'
      return url
    },
    async fetchGravatar(email) {
      let image = await this.$axios.get(
        '/avatar/' + this.gravatarImage(this.user.email).split('/')[4]
      )
      return Buffer.from(encodeURI(image.data), 'base64')
    }
  }
});
</script>

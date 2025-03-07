<template>
  <v-container>
    <v-row justify="start" align="start">
      <v-col cols="12">
        <v-row align="start" class="mb-n12">
          <v-col cols="2">
            <v-select variant="outlined" density="compact" v-model="status_select" label="Status" :items="status_items"
              @update:model-value="updateImports()"></v-select>
          </v-col>
          <v-col cols="2">
            <v-checkbox density="compact" v-model="archived" @update:model-value="updateImports()" label="Archived"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-text-field variant="outlined" density="compact" v-model="owner_filter" hint="Case-insensitive substring of user name or email" label="Owner"
              @change="updateImports()"></v-text-field>
          </v-col>
          <v-spacer/>
          <v-col cols="1">
            <v-btn @click="updateImports()" size="x-small" icon="mdi-refresh" variant="outlined" class="mt-1" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
          <v-data-table-server :headers="headers" :items="items" :search="search" :custom-filter="specializedFilter"
            :loading="loading" v-model:options="options"
            :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }" :items-length="total" dense>
            <template v-slot:item.id="{ item: { raw: item } }">
              <a v-if="item.id" :href="`/artifact/import/${item.id}`" target="_blank" rel="noopener">View</a>
            </template>
            <template v-slot:item.ctime="{ item: { raw: item } }">
              {{ $moment.utc(item.ctime).fromNow() }}
            </template>
            <template v-slot:item.url="{ item: { raw: item } }">
              <a v-if="item.url" :href="`${item.url}`" target="_blank" rel="noopener">{{ ellipsize(item.url, 32) }}</a>
            </template>
            <template v-slot:item.artifact_id="{ item: { raw: item } }">
              <a v-if="item.artifact_id" :href="`/artifact/${item.artifact_group_id}/${item.artifact_id}`" target="_blank"
                rel="noopener">View</a>
            </template>
            <template v-slot:item.owner.person="{ item: { raw: item } }">
              {{ item.owner.person.email
              }}{{
  item.owner.person.name ? ' (' + item.owner.person.name + ')' : ''
}}
            </template>
          </v-data-table-server>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'pinia'
import { userStore } from '~/stores/user'
import { systemStore } from '~/stores/system'

export default defineComponent({
  data() {
    return {
      loadingMessage: 'Loading imports...',
      timeoutID: null,
      status_select: '',
      status_items: [
        '',
        'pending',
        'scheduled',
        'running',
        'completed',
        'failed'
      ],
      archived: false,
      owner_filter: '',
      headers: [
        { title: 'Import', key: 'id', align: 'start', sortable: true },
        {
          title: 'Created',
          sortable: true,
          align: 'start',
          key: 'ctime',
        },
        { title: 'Status', key: 'status', sortable: true },
        //{ title: "Phase", key: "phase", sortable: true },
        { title: 'URL', key: 'url', sortable: true },
        { title: 'Owner', key: 'owner.person', sortable: false },
        //{ title: "Owner Email", key: "owner.person.email", sortable: false },
        { title: 'Artifact', key: 'artifact_id', sortable: true }
      ],
      loading: true,
      options: {
        itemsPerPage: 20,
        page: 1,
      },
      search: ''
    }
  },
  async mounted() {
    this.$userStore.fetchUser()
    this.loadingMessage = 'Loading imports...'
    this.updateImports()
    this.timeoutID = setTimeout(() => {
      this.loadingMessage = 'No imports found'
    }, 5000)
  },
  computed: {
    ...mapState(systemStore, {
      items: state => state.artifact_imports.artifact_imports,
      page: state => state.artifact_imports.page,
      pages: state => state.artifact_imports.pages,
      total: state => state.artifact_imports.total
    }),
    ...mapState(userStore, ['user_is_admin']),

  },
  methods: {
    ellipsize(s, l) {
      if (s.length > l) return s.substring(0, l) + '...'
      else return s
    },
    updateImports() {
      if (this.user_is_admin) {
        this.loading = true
        var payload = {
          page: this.options.page,
          items_per_page: this.options.itemsPerPage,
          sort: this.options.sortBy,
          allusers: 1
        }
        if (this.status_select) payload['status'] = this.status_select
        if (this.archived) payload['archived'] = 1
        if (this.owner_filter) payload['owner'] = this.owner_filter
        this.$systemStore.fetchArtifactImports(payload)
      }
      clearTimeout(this.timeoutID)
    },
    specializedFilter(value, search, item) {
      if (value != null && search != null) {
        return (
          value != null &&
          search != null &&
          (item.owner.person.name
            .toString()
            .toLowerCase()
            .indexOf(search.toLowerCase()) !== -1 ||
            item.owner.person.email
              .toString()
              .toLowerCase()
              .indexOf(search.toLowerCase()) !== -1 ||
            value
              .toString()
              .toLowerCase()
              .indexOf(search.toLowerCase()) !== -1 ||
            this.$moment
              .utc(item.ctime)
              .fromNow()
              .toString()
              .toLowerCase()
              .indexOf(search.toLowerCase()) !== -1)
        )
      }
    }
  },
  watch: {
    user_is_admin() {
      // had to make this because on refresh, user_is_admin doesn't update until after the mounted has already run,
      // but mounted needs to run when switching pages where the user_is_admin doesn't update
      this.updateImports()
    },
    items() {
      this.loading = false
    },
    options: {
      handler() {
        this.updateImports()
      },
      deep: true
    }
  },
  beforeRouteLeave(to, from, next) {
    clearTimeout(this.timeoutID)
    next()
  }
});
</script>

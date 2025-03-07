<template>
  <v-container>
    <v-row justify="start" align="start">
      <v-col cols="12">
        <v-row align="start" class="mb-n12">
          <v-col cols="2">
            <v-text-field density="compact" variant="outlined" v-model="owner_filter"
              hint="Case-insensitive substring of user name or email" label="User" @change="updateUsers()"></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-checkbox density="compact" v-model="is_admin" label="Is Admin"
              @update:model-value="updateSessions()"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox density="compact" v-model="can_admin" label="Can Admin"
              @update:model-value="updateSessions()"></v-checkbox>
          </v-col>
          <v-spacer />
          <v-col cols="1">
            <v-btn @click="updateSessions()" size="x-small" icon="mdi-refresh" variant="outlined" class="mt-1" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-data-table-server
        :headers="headers"
        :items="items"
        :search="search"
        :custom-filter="specializedFilter"
        :loading="loading"
        v-model:options="options"
        :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"
        :items-length="total"
        dense
      >
        <template v-slot:top>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-sheet
              class="px-7 pt-7 pb-4 mx-auto text-center d-inline-block"
              color="blue-grey-darken-3"
              theme="dark"
            >
              <div class="text-grey-lighten-1 text-body-2 mb-4">
                Are you sure you want to delete this item?
              </div>

              <v-btn variant="plain" color="success" @click="deleteItemConfirm">OK</v-btn>
              <v-btn variant="plain" color="error" @click="closeDelete">Cancel</v-btn>
            </v-sheet>
          </v-dialog>
        </template>
        <template v-slot:item.actions="{ item: { raw: item } }">
          <v-tooltip location="bottom">
            <template v-slot:activator>
              <v-icon
                v-if="item.id"
                size="small"
                color="error"
                @click="deleteItem(item)"
              >
                mdi-delete
              </v-icon>
            </template>
            <span>Delete Session {{ item.id }} </span>
          </v-tooltip>
        </template>
        <template v-slot:item.user.id="{ item: { raw: item } }">
          <v-tooltip location="bottom">
            <template v-slot:activator>
              <a
                v-if="item.user_id"
                :href="`/profile/${item.user_id}`"
                target="_blank"
                rel="noopener"
              >
                <v-icon>mdi-account</v-icon>
              </a>
            </template>
            <span>View User Profile</span>
          </v-tooltip>
        </template>
        <template v-slot:item.expires_on="{ item: { raw: item } }">
          {{ $moment.utc(item.expires_on).fromNow() }}
        </template>
        <template v-slot:item.is_admin="{ item: { raw: item } }">
          <v-icon v-if="item.is_admin">mdi-check</v-icon>
        </template>
        <template v-slot:item.user.can_admin="{ item: { raw: item } }">
          <v-icon v-if="item.user.can_admin">mdi-check</v-icon>
        </template>
        <template v-slot:item.user="{ item: { raw: item } }">
          {{ item.user.person.email
          }}{{
            item.user.person.name ? ' (' + item.user.person.name + ')' : ''
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
      is_admin: false,
      can_admin: false,
      owner_filter: '',
      headers: [
        { title: 'Session ID', key: 'id', align: 'start', sortable: true },
        { title: 'Expires', key: 'expires_on', sortable: true },
        // TODO: disabled as endpoint for viewing specific user profile doesn't exist yet
        // { title: 'User ID', key: 'user.id' },
        { title: 'User', key: 'user' },
        { title: 'Is Admin', key: 'is_admin' },
        { title: 'Can Admin', key: 'user.can_admin' },
        { title: 'Actions', key: 'actions', sortable: false }
      ],
      loading: true,
      options: {
        itemsPerPage: 20,
        page: 1
      },
      search: '',
      dialogDelete: false,
      editedIndex: -1,
      items: []
    }
  },
  async mounted() {
    this.$userStore.fetchUser()
    this.loadingMessage = 'Loading sessions...'
    this.updateSessions()
    this.timeoutID = setTimeout(() => {
      this.loadingMessage = 'No sessions found'
    }, 5000)
  },
  computed: {
    ...mapState(systemStore, {
      sessions: (state) => state.sessions.sessions,
      page: (state) => state.sessions.page,
      pages: (state) => state.sessions.pages,
      total: (state) => state.sessions.total
    }),
    ...mapState(userStore, ['user_is_admin'])
  },
  methods: {
    updateSessions() {
      if (this.user_is_admin) {
        this.loading = true
        var payload = {
          page: this.options.page,
          items_per_page: this.options.itemsPerPage,
          sort: this.options.sortBy,
          allusers: 1
        }
        if (this.is_admin) payload['is_admin'] = 1
        if (this.can_admin) payload['can_admin'] = 1
        if (this.owner_filter) payload['owner'] = this.owner_filter
        this.$systemStore.fetchSessions(payload)
      }
      clearTimeout(this.timeoutID)
    },
    deleteItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      await this.$sessionEndpoint.delete(this.items[this.editedIndex].id)
      this.items.splice(this.editedIndex, 1)
      this.closeDelete()
      this.updateSessions()
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedIndex = -1
      })
    },
    specializedFilter(value, search, item) {
      if (value != null && search != null) {
        return (
          value != null &&
          search != null &&
          (item.user.person.name
            .toString()
            .toLowerCase()
            .indexOf(search.toLowerCase()) !== -1 ||
            item.user.person.email
              .toString()
              .toLowerCase()
              .indexOf(search.toLowerCase()) !== -1 ||
            value
              .toString()
              .toLowerCase()
              .indexOf(search.toLowerCase()) !== -1 ||
            this.$moment
              .utc(item.expires_on)
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
      this.updateSessions()
    },
    sessions() {
      this.loading = false
      this.items = JSON.parse(JSON.stringify(this.sessions))
    },
    options: {
      handler() {
        this.updateSessions()
      },
      deep: true
    },
    dialogDelete(val) {
      val || this.closeDelete()
    }
  },
  beforeRouteLeave(to, from, next) {
    clearTimeout(this.timeoutID)
    next()
  }
});
</script>

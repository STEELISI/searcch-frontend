<template>
  <div>
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="bg-primary text-white">
        <span class="text-h6"
          >Importer {{ importer.id }} ({{ importer.url }})</span
        >
      </v-card-title>
      <v-card-text class="py-0">
        <v-list class="bg-transparent">
          <v-list-item>
            <v-list-item-title>Admin Status</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ importer.admin_status }} ({{
                this.$moment.utc(importer.admin_status_time).fromNow()
              }})
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Status</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ importer.status }} ({{
                this.$moment.utc(importer.status_time).fromNow()
              }})
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Max Tasks</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ importer.max_tasks }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Scheduled Tasks</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ importer.scheduled.length }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-data-table
          v-if="importer.scheduled.length"
          :headers="scheduled_headers"
          :items="scheduled_items"
          :items-per-page="100"
        >
          <template v-slot:item.schedule_time="{ item }">
            {{ $moment.utc(item.schedule_time).fromNow() }}
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn
          v-if="importer.admin_status === 'enabled'"
          color="error"
          @click="disable()"
        >
          Disable
        </v-btn>
        <v-btn
          v-else-if="importer.admin_status === 'disabled'"
          color="success"
          @click="enable()"
        >
          Enable
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default defineComponent({
  props: {
    importer: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      scheduled_headers: [
        {
          text: 'Scheduled At',
          align: 'start',
          sortable: true,
          value: 'schedule_time'
        },
        { text: 'Import ID', value: 'artifact_import_id' },
        // { text: "URL", value: "artifact_import.url" },
        { text: 'Owner', value: 'artifact_import.owner.person.email' },
        { text: 'Status', value: 'artifact_import.status' },
        { text: 'Phase', value: 'artifact_import.phase' },
        { text: 'Artifact ID', value: 'artifact_import.artifact_id' }
      ],
      scheduled_items: this.importer ? this.importer.scheduled : []
    }
  },
  methods: {
    async disable() {
      let response = await this.$importerEndpoint.update(this.importer.id, {
        admin_status: 'disabled'
      })
      this.updateImporters()
    },
    async enable() {
      let response = await this.$importerEndpoint.update(this.importer.id, {
        admin_status: 'enabled'
      })
      this.updateImporters()
    },
    updateImporters() {
      this.$systemStore.fetchImporters()
    }
  }
});
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
</style>

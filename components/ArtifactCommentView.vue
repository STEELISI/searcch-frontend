<template>
  <div>
    <v-card
      class="mx-auto overflow-hidden"
      elevation="3"
      v-if="artifact.artifact"
    >
      <v-row>
        <v-col cols="10">
          <v-card-title class="align-start">
            <div>
              <span class="text-h5">{{
                artifact.artifact.title
              }}</span>
            </div>
          </v-card-title>
        </v-col>
        <v-spacer></v-spacer>
        <v-col>
          <ArtifactChips
            :modelValue="[artifact.artifact.type]"
            :type="artifact.artifact.type"
          ></ArtifactChips>
        </v-col>
      </v-row>

      <span class="ml-4 text-grey-darken-2 font-weight-light text-caption">
        {{ artifact.num_reviews }}
        {{ artifact.num_reviews == 1 ? 'review' : 'reviews' }}
      </span>
      <v-rating
        v-model="artifact.avg_rating"
        color="amber"
        density="compact"
        half-increments
        readonly
        size="18"
        class="ml-3"
      ></v-rating>

      <v-card-text v-html="sanitizedDescription"> </v-card-text>

      <div v-if="comments">
        <v-container fluid>
          <SingleComment
            class="mt-2"
            outlined
            tile
            v-for="(comment, i) in commentsReordered"
            :comment="comment"
            :key="i"
          ></SingleComment>
        </v-container>
      </div>

      <v-card-actions>
        <v-btn
          icon
          @click="favoriteThis()"
          :color="favorite == true ? 'red' : ''"
        >
          <v-icon>{{ favorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn color="primary" :to="`/artifact/${artifact.artifact.artifact_group_id}`" >
          Read More
        </v-btn>
      </v-card-actions>
    </v-card>
    <div v-else>{{ loadingMessage }}</div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import clip from 'text-clipper'
import { mapState } from 'pinia'
import { userStore } from '~/stores/user'
import { artifactsStore } from '~/stores/artifacts'
import { artifactIcon, artifactColor } from '@/helpers'

export default defineComponent({
  components: {
    SingleComment: defineAsyncComponent(() => import('@/components/SingleComment')),
    ArtifactChips: defineAsyncComponent(() => import('@/components/ArtifactChips'))
  },
  props: {
    artifact: {
      type: Object,
      required: true
    },
    comments: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      loadingMessage: 'Loading...',
      expanded: this.comments
        ? Array(this.comments.length)
            .fill(1)
            .map(Number.call, Number)
        : []
    }
  },
  mounted() {
    setTimeout(() => {
      this.loadingMessage = 'Error loading'
    }, 5000)
  },
  computed: {
    ...mapState(userStore, ['userid']),
    ...mapState(artifactsStore, ['favorites']),
    sanitizedDescription: function() {
      let description = ''
      description = this.artifact.artifact.description
      let out = clip(this.$sanitize(description), 2000, {
        html: true,
        maxLines: 40
      })
      if (out == 'null') return '<br>'
      else return out
    },
    favorite: {
      get() {
        return this.favorites[this.artifact.artifact.artifact_group_id] ? true : false
      },
      set(value) {
        if (value)
          this.$artifactsStore.addFavorite(this.artifact.artifact.artifact_group_id)
        else
          this.$artifactsStore.removeFavorite(this.artifact.artifact.artifact_group_id)
      }
    },
    commentsReordered() {
      let first = []
      let rest = []
      for (let comment of this.comments) {
        if (comment.review.reviewer.id === this.$artifactsStore.userid) first.push(comment)
        else rest.push(comment)
      }
      return first.concat(rest)
    }
  },
  methods: {
    async favoriteThis() {
      if (!this.$auth.loggedIn) {
        navigateTo('/login')
      } else {
        let action = !this.favorite
        this.favorite = !this.favorite
        if (action) {
          // FIXME: backend API
          await this.$favoritesEndpoint.post(this.artifact.artifact.artifact_group_id, {})
        } else {
          await this.$favoritesEndpoint.delete(this.artifact.artifact.artifact_group_id)
        }
      }
    },
    iconColor(type) {
      return artifactColor(type)
    },
    iconImage(type) {
      return artifactIcon(type)
    }
  }
});
</script>

export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    if (store.state.user.user_token && config.url.startsWith('/kg/')) {
      // console.log('added header to url: ' + config.url)
      config.headers.common['Authorization'] = store.state.user.user_token
    }
    // Add X-Api-Key to all requests going to your API
    if (config.url.startsWith('/kg/') && $config.kgApiKey) {
      config.headers.common['X-Api-Key'] = $config.kgApiKey
      // For debugging
      console.log('Added X-Api-Key header to:', config.url)
    }
  })
}

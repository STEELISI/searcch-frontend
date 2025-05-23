import createRepository from '~/api/repository'
export default (ctx, inject) => {
  // inject the repository in the context (ctx.app.$repository)
  // And in the Vue instances (this.$repository in your components)
  const repositoryWithAxios = createRepository(ctx.$axios)

  // artifacts
  inject('artifactsEndpoint', repositoryWithAxios('kg/' + 'artifacts'))

  // artifact retrieval
  inject('artifactEndpoint', repositoryWithAxios('kg/' + 'artifact'))

  // artifact request
  inject('artifactRequestEndpoint', repositoryWithAxios('kg/' + 'artifact/request'))

  inject('artifactRequestCartEndpoint', repositoryWithAxios('kg/' + 'artifact/requestCart'))

  inject('artifactRequestStatusEndpoint', repositoryWithAxios('kg/' + 'artifact/status'))

  inject('artifactRequestListEndpoint', repositoryWithAxios('kg/' + 'artifact/requestList'))

  inject('artifactContributeEndpoint', repositoryWithAxios('kg/' + 'artifact/contribute'))

  // artifact searching
  inject(
    'artifactSearchEndpoint',
    repositoryWithAxios('kg/' + 'artifact/search')
  )

  // artifact categories
  inject( 'artifactCategoriesEndpoint' , repositoryWithAxios('kg/' + 'artifact/categories'))

  inject(
    'artifactRecommendationEndpoint',
    repositoryWithAxios('kg/' + 'artifact/recommendation')
  )

  // imports array view/add API
  inject('importsEndpoint', repositoryWithAxios('kg/' + 'artifact/imports'))

  // import view/modify API
  inject('importEndpoint', repositoryWithAxios('kg/' + 'artifact/import'))

  // get relationships
  inject(
    'relationshipsEndpoint',
    repositoryWithAxios('kg/' + 'artifact/relationships')
  )

  // modify relationship
  inject(
    'relationshipEndpoint',
    repositoryWithAxios('kg/' + 'artifact/relationship')
  )

  // compare artifacts
  inject(
    'artifactCompareEndpoint',
    repositoryWithAxios('kg/' + 'artifact/compare')
  )

  // badges
  inject('badgesEndpoint', repositoryWithAxios('kg/' + 'badges'))

  // licenses
  inject('licenseEndpoint', repositoryWithAxios('kg/' + 'licenses'))

  // backend login credentials
  inject('loginEndpoint', repositoryWithAxios('kg/' + 'login'))

  // favorites lookup
  inject('findFavoritesEndpoint', repositoryWithAxios('kg/' + 'favorites'))

  // favorites modify API
  inject('favoritesEndpoint', repositoryWithAxios('kg/' + 'favorite'))

  // ratings modify API
  inject('ratingsEndpoint', repositoryWithAxios('kg/' + 'rating'))

  // reviews modify API
  inject('reviewsEndpoint', repositoryWithAxios('kg/' + 'review'))

  // users index API
  inject('usersEndpoint', repositoryWithAxios('kg/' + 'users'))

  // user API
  inject('userEndpoint', repositoryWithAxios('kg/' + 'user'))

  // user owned artifacts API
  inject('userArtifactsEndpoint', repositoryWithAxios('kg/' + 'user/artifacts'))

  // user affiliations
  inject(
    'userAffiliationsEndpoint',
    repositoryWithAxios('kg/' + 'user/affiliations')
  )

  // user affiliation modification
  inject(
    'userAffiliationEndpoint',
    repositoryWithAxios('kg/' + 'user/affiliation')
  )

  // user affiliations
  inject(
    'userPositionEndpoint',
    repositoryWithAxios('kg/' + 'user/affiliations')
  )



  // organization API
  inject('organizationEndpoint', repositoryWithAxios('kg/' + 'organizations'))

  // interests API
  inject('interestsEndpoint', repositoryWithAxios('kg/' + 'interests'))

  // dashboard API
  inject('dashboardEndpoint', repositoryWithAxios('kg/' + 'dashboard'))

  // importers array view API
  inject('importersEndpoint', repositoryWithAxios('kg/' + 'importers'))

  // importer view/modify API
  inject('importerEndpoint', repositoryWithAxios('kg/' + 'importer'))

  // session operation API
  inject('sessionEndpoint', repositoryWithAxios('kg/' + 'session'))

  // sessions index API
  inject('sessionsEndpoint', repositoryWithAxios('kg/' + 'sessions'))

  // dua API
  inject('duaEndpoint', repositoryWithAxios('kg/' + 'dua'))
  inject('duaPreviewEndpoint', repositoryWithAxios('kg/'+'dua_preview'))

  //provider API
  inject('providerEndpoint', repositoryWithAxios('kg/' + 'provider'))

  inject('providerCollectionEndpoint', repositoryWithAxios('kg/' + 'provider_collection'))
  // labels API
  inject('labelEndpoint', repositoryWithAxios('kg/' + 'labels'))

  inject('adminStatisticsEndpoint', repositoryWithAxios('kg/' + 'adminStats'))

  inject('providerPermissionsList', repositoryWithAxios('kg/' + 'provider_permissions_list'))
}

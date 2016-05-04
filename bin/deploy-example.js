if (!process.env.GH_TOKEN) throw new Error('no token')

var repo = require('url').parse(require('./package.json').repository.url)
repo.auth = process.env.GH_TOKEN

require('gh-pages').publish(require('path').join(__dirname, 'examples'), {
  repo: repo.format(),
  silent: true,
  user: {
    name: 'Livingdocs Automation',
    email: 'dev@livingdocs.io'

  }
}, function (err) {
  if (err) throw err
})

#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const stripEmptyTranslations = require('./prepare/strip-empty-translations')
const stripUselessFlsInPermissionSets = require('./prepare/strip-useless-fls-in-permission-sets')
const stripPartnerRoles = require('./prepare/strip-partner-roles')
const fixProfiles = require('./prepare/fix-profiles')
require('./error-handling')()

program
  .option('-u, --username <username>', 'Username')
  .option('-p, --password <password>', 'Password + Token')
  .option('-s, --sandbox', 'Use sandbox login endpoint')
  .parse(process.argv)

if (!program.username || !program.password) {
  program.outputHelp(txt => { throw Error('Username and password are mandatory\n' + txt) })
}

const configPath = path.resolve(process.cwd(), '.sftx.json')
if (!fs.existsSync(configPath)) throw Error('Missing configuration file .sftx.json')

const config = require(configPath)

;(async () => {
  await stripEmptyTranslations(config)
  await stripUselessFlsInPermissionSets(config)
  stripPartnerRoles(config)
  await fixProfiles(config)
})()

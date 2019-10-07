const path = require('path')
const fs = require('fs')
const _ = require('highland')
const memoize = require('lodash.memoize')
const { parseXml } = require('./xml-utils')

const OBJECTS_PATH = path.resolve(process.cwd(), 'src/objects')

module.exports = {
  getFieldMap: memoize(() => _(fs.readdirSync(OBJECTS_PATH))
    .map(async x => ({
      content: await parseXml(fs.readFileSync(path.resolve(OBJECTS_PATH, x), 'utf8')),
      obj: x.replace('.object', '')
    }))
    .map(x => _(x))
    .sequence()
    .flatMap(objData => (objData.content.CustomObject.fields || []).map(x => `${objData.obj}.${x.fullName[0]}`))
    .flatMap(field => {
      const res = [field]
      if (field.startsWith('Activity.')) {
        res.push(field.replace('Activity.', 'Event.'))
        res.push(field.replace('Activity.', 'Task.'))
      }
      return res
    })
    .collect()
    .map(x => new Set(x))
    .toPromise(Promise)),
  getVersionedObjects: memoize(() => fs.readdirSync(OBJECTS_PATH).map(x => x.replace('.object', '')))
}

const { Schema, model } = require('mongoose')

const schema = new Schema({
    room: {
    type: String,
    required: true
    },
    user: {
    type: String,
    required: true
    },
    text: {
    type: String,
    required: false
    }
})

module.exports = model('Message', schema)
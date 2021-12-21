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
    },
    date: {
        type: Date,
        default: Date.now }
})

module.exports = model('Message', schema)
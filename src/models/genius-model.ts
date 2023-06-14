import mongoose, { Schema, model, Date } from 'mongoose'

const geniusSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        joinDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false
        }
    }
)

export default mongoose.models.Genius || model('Genius', geniusSchema)
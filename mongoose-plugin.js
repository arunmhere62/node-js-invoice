import mongoose from 'mongoose';

// Global options for all schemas
const globalSchemaOptions = {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
};

// Global transform function
function globalTransform(doc, ret) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
    return ret;
}

// Plugin to apply global options and transform
function applyGlobalOptions(schema) {
    schema.set('toJSON', {
        virtuals: globalSchemaOptions.toJSON.virtuals,
        transform: globalTransform
    });
    schema.set('toObject', {
        virtuals: globalSchemaOptions.toObject.virtuals,
        transform: globalTransform
    });
}

// Apply the plugin to all schemas
mongoose.plugin(applyGlobalOptions);

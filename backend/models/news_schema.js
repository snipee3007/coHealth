const mongoose = require('mongoose');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A news must have a name!'],
      unique: true,
      trim: true,
    },
    imgSRC: {
      type: String,
      required: [true, 'A news must have a image source!'],
      trim: true,
    },
    imgAlt: {
      type: String,
      required: [true, "A news' image must have an alt!"],
      trim: true,
    },
    imgFormat: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A news must have a description!'],
    },
    sliderContent: {
      type: String,
      trim: true,
      required: [true, 'A news must have some content to add to slider!'],
    },
    newsContent: {
      type: [String],
      trim: true,
      required: [true, 'A news must have some content in there!'],
    },
    view: {
      type: Number,
      default: 0,
      min: 0,
    },
    slug: String,
  },
  {
    timestamps: {},
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

newsSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, find: ' ', replacement: '_' });
  next();
});

const News = mongoose.model('news', newsSchema);

module.exports = News;

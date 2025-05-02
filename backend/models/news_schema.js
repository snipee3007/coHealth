const mongoose = require('mongoose');
const slugify = require('slugify');
const removeAscent = require('./../utils/removeAscent.js');
const relativeNewsSchema = new mongoose.Schema({
  slug: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    trim: true,
  },
  category: {
    type: [String],
    trim: true,
  },
  _id: false,
});

const attributeSchema = new mongoose.Schema({
  start: Number,
  level: Number,
  src: {
    type: String,
  },
  title: {
    type: String,
  },
  href: {
    type: String,
  },
  _id: false,
});

const marksSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['italic', 'bold', 'underline', 'link'],
  },
  attrs: [attributeSchema],
  _id: false,
});

const newsContentSchema = new mongoose.Schema({ _id: false });
newsContentSchema.add({
  type: {
    type: String,
    required: [true, 'This field must have content!'],
  },
  content: [newsContentSchema],
  text: {
    type: String,
  },
  marks: {
    type: [marksSchema],
  },
  attrs: {
    type: [attributeSchema],
  },
});

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: [
        true,
        'This name has already taken! Please provide different name!',
      ],
      required: [true, 'Please provide the title for this news'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide the description for this news'],
      trim: true,
    },
    category: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: `Please provide category for this news!`,
      },
      trim: true,
    },
    news: {
      type: newsContentSchema,
      required: [true, 'Please provide the content for this news'],
    },
    images: {
      type: [String],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide userID for this news'],
    },
    visit: {
      type: Number,
      default: 0,
      min: [0, 'The visit number must not below 0!'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    relativePost: {
      type: [relativeNewsSchema],
    },
    like: {
      type: Number,
      min: [0, 'The likes number must not below 0!'],
      default: 0,
    },
  },
  {
    timestamps: {},
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

newsSchema.pre('save', function (next) {
  this.slug = slugify(
    this.title
      .replace(/[,]/g, 'cm')
      .replace(/[.]/g, 'dt')
      .replace(/["]/g, 'dq')
      .replace(/[!]/g, 'em')
      .replace(/[']/g, 'qt')
      .replace(/[(]/g, 'ob')
      .replace(/[:]/g, 'td')
      .replace(/[;]/g, 'dc')
      .replace(/[)]/g, 'cb')
      .toLowerCase()
  );
  next();
});

const News = mongoose.model('news', newsSchema);

module.exports = News;

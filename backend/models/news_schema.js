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
  description: {
    type: String,
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
        'This title has already taken! Please provide different title!',
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
      ref: 'user',
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
    relativeNews: {
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

// Recommend posts
newsSchema.post(/^findOne/, async function (result) {
  if (!result) return;
  const categoryList = result.category;
  const relativeNews = [];
  const allCategorySubList = shuffle(subArray(categoryList));
  for (let i = 0; i <= allCategorySubList.length; ++i) {
    const res = await News.find({
      category: { $in: allCategorySubList[i] },
      slug: {
        $ne: result.slug,
        $nin: relativeNews.map((item) => item.slug),
      },
    }).sort('-updatedAt -createdAt visit');
    const randomIdx = Math.floor(Math.random() * res.length);
    if (res.length > 0)
      relativeNews.push({
        title: res[randomIdx]['title'],
        description: res[randomIdx]['description'],
        category: res[randomIdx]['category'],
        coverImage: res[randomIdx]['coverImage'],
        slug: res[randomIdx]['slug'],
      });
    if (relativeNews.length >= 3) break;
  }
  if (relativeNews.length < 3) {
    const newsList = await News.find({
      slug: { $ne: result.slug, $nin: relativeNews.map((item) => item.slug) },
    })
      .sort('-visit -createdAt -updatedAt')
      .limit(3 - relativeNews.length);
    newsList.forEach((news) => {
      relativeNews.push({
        title: news['title'],
        description: news['description'],
        category: news['category'],
        coverImage: news['coverImage'],
        slug: news['slug'],
      });
    });
  }
  result.relativeNews = relativeNews;
  return result;
});

// HELPER FUNCTION
function subArray(arr) {
  const n = arr.length;
  let subarr = [];
  // Pick starting point
  for (let i = 0; i < n; i++) {
    // Pick ending point
    let tmp = [];
    for (let j = i; j < n; j++) {
      // Print subarray between current starting and ending points
      let temp = [];

      for (let k = i; k <= j; k++) {
        temp.push(arr[k]);
      }
      tmp.push(temp);
    }
    subarr.push(...tmp);
  }
  return subarr;
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const News = mongoose.model('news', newsSchema);

module.exports = News;

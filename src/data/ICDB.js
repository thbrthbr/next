const imageContext = require.context(
  '../asset/icon',
  false,
  /\.(jpg|jpeg|png|webp|svg)$/,
);
const typeIcons = imageContext.keys().map(imageContext);

export { typeIcons };

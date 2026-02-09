//findOne
export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  const doc = model.findOne(filter).select(select);
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

//create
export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};

//findById
export const findById = async ({
  model,
  id,
  select = "",
  options = {},
} = {}) => {
  const doc = model.findById(id).select(select);
  if (options.lean) {
    doc.lean();
  }
  return await doc.exec();
};

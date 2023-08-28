// base - Product.find()

// bigQ - //search=coder&page=1&rating[gte]=10

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          $or: [
            {
              name: {
                $regex: this.bigQ.search,
                $options: "i",
              },
            },
            {
              description: {
                $regex: this.bigQ.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this;
  }

  pager(resultperpage) {
    let currentPage = this.bigQ.page ? this.bigQ.page : 1;

    const skip = (currentPage - 1) * resultperpage;
    this.base = this.base.limit(resultperpage).skip(skip);
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["page"];
    delete copyQ["limit"];

    // conevert bigQ to string => copyQ
    let stringQ = JSON.stringify(copyQ);

    stringQ = stringQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`);

    // convert string to object
    const objectQ = JSON.parse(stringQ);

    this.base = this.base.find(objectQ);
    return this;
  }
}

module.exports = WhereClause;

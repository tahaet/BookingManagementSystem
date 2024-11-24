import { Query } from 'mongoose';

export default class APIFeatures {
  private queryString: any;

  public query: Query<any, any>;
  // public get Query(): any {
  //   return this.query;
  // }

  constructor(query: Query<any, any>, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }
  public filter() {
    const { page, sort, limit, fields, ...queryObj } = this.queryString;
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el: any) => {
    //   delete queryObj[el];
    // });
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  public sort() {
    if (this.queryString.sort) {
      //console.log(req.query.sort);

      const sortBy = String(this.queryString.sort).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }
  public project() {
    if (this.queryString.fields) {
      const includes = String(this.queryString.fields).split(',').join(' ');
      this.query = this.query.select(includes);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  public paginate() {
    const page = Number(this.queryString.page);
    const limit = Number(this.queryString.limit);
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

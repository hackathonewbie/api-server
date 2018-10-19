const path = require('path');
const netcdf4 = require('netcdf4');

const filePath = path.resolve(__dirname, '../assets/A2018001.L3m_DAY_CHL_chlor_a_4km.nc');

const file = new netcdf4.File(filePath, 'r');
const res = file.root.variables['chlor_a'].readSlice(0, 10, 1, 10);

class Chlor_a {
  constructor() {
  }

  async find(params) {
    return res;
  }

  async get(id, params) {
    // const message = this.messages.find(message => message.id === parseInt(id, 10));

    // if(!message) {
    //   throw new Error(`Message with id ${id} not found`);
    // }

    // return message;
  }
}

module.exports = Chlor_a;

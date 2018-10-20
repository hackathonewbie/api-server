const path = require('path');
const netcdf4 = require('netcdf4');

const TARGET_VAR_KEY = 'chlor_a';
const FILL_VALUE = -32767;
const size = 50;

const filePath = path.resolve(__dirname, '../assets/A2018001.L3m_DAY_CHL_chlor_a_4km.nc');
const source = new netcdf4.File(filePath, 'r');

const getNearestLatValue = (arr, queryValue) => {
  let result;

  arr.forEach((value, index) => {
    const floatQueryValue = Number.parseFloat(queryValue);
  
    if (floatQueryValue <= value && floatQueryValue >= arr[index + 1]) {
      if (index + 1 < arr.length) {
        result =  index + 1;
      } else {
        result =  index;
      }

      return;
    }
  });

  return result;
};

const getNearestLonValue = (arr, queryValue) => {
  let result;

  arr.forEach((value, index) => {
    const floatQueryValue = Number.parseFloat(queryValue);
  
    if (floatQueryValue >= value && floatQueryValue <= arr[index + 1]) {
      if (index + 1 < arr.length) {
        result =  index + 1;
      } else {
        result =  index;
      }

      return;
    }
  });

  return result;
};

class Chlor_a {
  constructor() {
    this.lats = source.root.variables['lat'].readSlice(0, 4320);
    this.lons = source.root.variables['lon'].readSlice(0, 8640);
  }

  async find(params) {
    const { query } = params;

    const latIndex = getNearestLatValue(this.lats, query.lat);
    const lonIndex = getNearestLonValue(this.lons, query.lon);

    if (!latIndex || !lonIndex) return [];

    const target = source.root.variables[TARGET_VAR_KEY].readSlice(latIndex, size, lonIndex, size);

    return Object.values(target).reduce((arr, value, index) => {
      const lat = this.lats[Math.floor(index / size) + Number.parseInt(latIndex)];
      const lon = this.lons[index % size + Number.parseInt(lonIndex)];
      
      return value === FILL_VALUE ? arr : arr.concat(({
        res: 4,
        pos: { lat, lon },
        val: value,
      }));
    }, []);
  }

  async get(id, params) {
    // const message = this.messages.find(message => message.id === parseInt(id, 10));

    // if(!message) {
    //   throw new Error(`Message with id ${id} not found`);
    // }

    return {};
  }
}

module.exports = Chlor_a;

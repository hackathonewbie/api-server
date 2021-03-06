const path = require('path');
const netcdf4 = require('netcdf4');

const TARGET_VAR_KEY = 'chlor_a';
const FILL_VALUE = -32767;

const filePath = path.resolve(__dirname, '../assets/A2018001.L3m_DAY_CHL_chlor_a_4km.nc');
// const filePath = path.resolve(__dirname, '../assets/A2018292.L3m_DAY_CHL_chlor_a_4km.nc');
const source = new netcdf4.File(filePath, 'r');

const rad2degr = rad => rad * 180 / Math.PI;
const degr2rad = degr => degr * Math.PI / 180;

/**
 * @param latLngInDeg array of arrays with latitude and longtitude
 *   pairs in degrees. e.g. [[latitude1, longtitude1], [latitude2
 *   [longtitude2] ...]
 *
 * @return array with the center latitude longtitude pairs in 
 *   degrees.
 */
const getLatLngCenter = latLngInDegr => {
  const LATIDX = 0;
  const LNGIDX = 1;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (let i = 0; i < latLngInDegr.length; i++) {
    const lat = degr2rad(latLngInDegr[i][LATIDX]);
    const lng = degr2rad(latLngInDegr[i][LNGIDX]);

    sumX += Math.cos(lat) * Math.cos(lng);
    sumY += Math.cos(lat) * Math.sin(lng);
    sumZ += Math.sin(lat);
  }

  const avgX = sumX / latLngInDegr.length;
  const avgY = sumY / latLngInDegr.length;
  const avgZ = sumZ / latLngInDegr.length;

  const lng = Math.atan2(avgY, avgX);
  const hyp = Math.sqrt(avgX * avgX + avgY * avgY);
  const lat = Math.atan2(avgZ, hyp);

  return ([rad2degr(lat), rad2degr(lng)]);
};

const getNearestLatIndex = (arr, queryValue) => {
  let result;

  arr.forEach((value, index) => {
    const floatQueryValue = Number.parseFloat(queryValue);
  
    if (floatQueryValue <= value && floatQueryValue >= arr[index + 1]) {
      if (index + 1 < arr.length) {
        result = index + 1;
      } else {
        result = index;
      }

      return;
    }
  });

  return result;
};

const getNearestLonIndex = (arr, queryValue) => {
  let result;

  arr.forEach((value, index) => {
    const floatQueryValue = Number.parseFloat(queryValue);
  
    if (floatQueryValue >= value && floatQueryValue <= arr[index + 1]) {
      if (index + 1 < arr.length) {
        result = index + 1;
      } else {
        result = index;
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

    const lat1Index = getNearestLatIndex(this.lats, query.lat1);
    const lon1Index = getNearestLonIndex(this.lons, query.lon1);
    const lat2Index = getNearestLatIndex(this.lats, query.lat2);
    const lon2Index = getNearestLonIndex(this.lons, query.lon2);

    if (!lat1Index || !lon1Index || !lon2Index || !lon2Index) return [];

    // const width = lon2Index - lon1Index + 1; // size of indexes
    // const height = lat2Index - lat1Index + 1; // size of indexes
    const size = Math.max(lon2Index - lon1Index + 1, lat2Index - lat1Index + 1);
    const target = source.root.variables[TARGET_VAR_KEY].readSlice(lat1Index, size, lon1Index, size);

    return Object.values(target).reduce((arr, value, index) => {
      const targetLatIndex = Math.floor(index / size) + Number.parseInt(lat1Index);
      const targetLonIndex = index % size + Number.parseInt(lon1Index);

      const lat1 = this.lats[targetLatIndex];
      const lon1 = this.lons[targetLonIndex];
      const lat2 = this.lats[targetLatIndex < this.lons.length ? targetLatIndex + 1 : targetLatIndex];
      const lon2 = this.lons[targetLonIndex < this.lons.length ? targetLonIndex + 1 : targetLonIndex];

      const pos = getLatLngCenter([[lat1, lon1], [lat2, lon2]]);
      
      return value === FILL_VALUE ? arr : arr.concat(({
        res: 4,
        pos: { lat: pos[0], lng: pos[1] },
        val: value,
      }));
    }, []);
  }
}

module.exports = Chlor_a;

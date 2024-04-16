const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<Object|null>} A promise resolving to the user object if found, or null if not found.
 */

const getUserWithEmail = (email) => {

  return pool
    .query(
      `
      SELECT * FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email])
    .then((result) => {
      return result.rows.length > 0 ? result.rows[0] : null;
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.reject(err);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<Object|null>} A promise resolving to the user object if found, or null if not found.
 */
const getUserWithId = function (id) {

  return pool
  .query(
    `
    SELECT * FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id])
  .then((result) => {
    return result.rows.length > 0 ? result.rows[0] : null;
  })
  .catch((err) => {
    console.log(err.message);
    return Promise.reject(err);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<Object|null>} A promise resolving to the user object if found, or null no info is given.
 */
const addUser = function (user) {
  const { name, email, password} = user;
  return pool
  .query(
    `
    INSERT INTO users (
      name, email, password) 
      VALUES (
      $1, $2, $3)
      RETURNING *;
    `,
    [name, email, password])
  .then((result) => {
    return result.rows.length > 0 ? result.rows[0] : null;
  })
  .catch((err) => {
    console.log(err.message);
    return Promise.reject(err);
  });
};



/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<Object|null>} A promise resolving to an array of user reservations if found, or null if not found.
 */
const getAllReservations = function (guest_id, limit = 10) {
  
  return pool
  .query(
    `
    SELECT  reservations.*,
    properties.*,
    AVG(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
    `,
    [guest_id, limit])
    .then((result) => {
      return result.rows.length > 0 ? result.rows : [];
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.reject(err);
    });
  };
    
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise resolving to an array of property objects based on user filters
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  const whereConditions = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options) {
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      whereConditions.push(`city LIKE $${queryParams.length}`)
    }

    if (options.owner_id) {
      queryParams.push(`${options.owner_id}`);
      whereConditions.push(`owner_id = $${queryParams.length}`)
    }

    if (options.minimum_price_per_night) {
      const minPriceInCents = options.minimum_price_per_night * 100;
      queryParams.push(`${minPriceInCents}`);
      whereConditions.push(`cost_per_night >= $${queryParams.length}`)
    }

    if (options.maximum_price_per_night) {
      const MaxPriceInCents = options.maximum_price_per_night * 100;
      queryParams.push(`${MaxPriceInCents}`);
      whereConditions.push(`cost_per_night <= $${queryParams.length}`)
    }

  }
  
  if (whereConditions.length > 0) {
    queryString += `WHERE ${whereConditions.join('\nAND ')} `
  }

  queryString += `\nGROUP BY properties.id `

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `\nHAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return pool.query(queryString, queryParams)
    .then((result) => {
      return result.rows
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.reject(err);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return @return {Promise<Object|null>} A promise resolving to the property object if found, or null no info is given.
 */
const addProperty = function (property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  } = property;
  return pool
  .query(
    `
    INSERT INTO properties (
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `,
    [
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    ])
  .then((result) => {
    return result.rows.length > 0 ? result.rows[0] : null;
  })
  .catch((err) => {
    console.log(err.message);
    return Promise.reject(err);
  });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};

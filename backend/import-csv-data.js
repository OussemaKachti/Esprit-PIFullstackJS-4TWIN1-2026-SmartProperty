const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const { Property, PropertyType, ListingType } = require('./src/models/Property');
const connectDB = require('./src/config/database');

// Category mapping from French to English property types
const categoryMapping = {
  'Appartements': PropertyType.APARTMENT,
  'Maisons et Villas': PropertyType.HOUSE,
  'Terrains et Fermes': PropertyType.LAND,
  'Locations de vacances': PropertyType.VACATION_RENTAL,
  'Magasins, Commerces et Locaux industriels': PropertyType.COMMERCIAL,
  'Bureaux et Plateaux': PropertyType.OFFICE,
  'Colocations': PropertyType.APARTMENT,
};

// Listing type mapping
const listingTypeMapping = {
  'À Vendre': ListingType.FOR_SALE,
  'À Louer': ListingType.FOR_RENT,
};

// Clean and validate data
function cleanData(row) {
  // Skip rows with invalid prices
  if (!row.price || parseFloat(row.price) <= 0 || parseFloat(row.price) > 100000000) {
    return null;
  }

  // Skip rows without category or city
  if (!row.category || !row.city) {
    return null;
  }

  // Map category to property type
  const propertyType = categoryMapping[row.category] || PropertyType.OTHER;

  // Map listing type
  const listingType = listingTypeMapping[row.type] || ListingType.FOR_SALE;

  // Parse numeric fields, treating -1 as null/undefined
  const roomCount = parseFloat(row.room_count);
  const bathroomCount = parseFloat(row.bathroom_count);
  const size = parseFloat(row.size);

  // Create cleaned data object
  const cleanedData = {
    type: propertyType,
    listingType: listingType,
    price: parseFloat(row.price),
    city: row.city.trim(),
    region: row.region ? row.region.trim() : undefined,
    country: 'Tunisia',
  };

  // Only add rooms if valid (not -1)
  if (roomCount > 0) {
    cleanedData.rooms = Math.floor(roomCount);
  }

  // Only add bathrooms if valid (not -1)
  if (bathroomCount > 0) {
    cleanedData.bathrooms = Math.floor(bathroomCount);
  }

  // Only add surface if valid (not -1)
  if (size > 0) {
    cleanedData.surface = parseFloat(size);
  }

  // Generate title
  cleanedData.title = generateTitle(row, cleanedData);

  // Generate address from region or city
  cleanedData.address = row.region ? `${row.region}, ${row.city}` : row.city;

  // Generate description
  cleanedData.description = generateDescription(row, cleanedData);

  return cleanedData;
}

// Generate title from data
function generateTitle(row, cleanedData) {
  const categoryName = row.category || 'Property';
  const listingTypeText = row.type === 'À Vendre' ? 'for Sale' : 'for Rent';
  const location = row.region || row.city;
  
  let title = `${categoryName} ${listingTypeText} in ${location}`;
  
  if (cleanedData.rooms) {
    title = `${cleanedData.rooms} Room ${categoryName} ${listingTypeText} in ${location}`;
  }
  
  return title;
}

// Generate description from data
function generateDescription(row, cleanedData) {
  let description = `Beautiful property located in ${row.city}, ${row.region || 'Tunisia'}. `;
  
  if (cleanedData.surface) {
    description += `Surface area: ${cleanedData.surface}m². `;
  }
  
  if (cleanedData.rooms) {
    description += `${cleanedData.rooms} room(s). `;
  }
  
  if (cleanedData.bathrooms) {
    description += `${cleanedData.bathrooms} bathroom(s). `;
  }
  
  description += `Price: ${cleanedData.price.toLocaleString()} TND.`;
  
  return description;
}

// Process CSV and import data
async function importData() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🗑️  Clearing existing properties...');
    await Property.deleteMany({});
    console.log('✅ Existing properties cleared');

    const csvFilePath = path.join(__dirname, 'Property Prices in Tunisia.csv');
    const properties = [];
    let rowNumber = 0;
    let validRows = 0;
    let skippedRows = 0;

    console.log('📖 Reading CSV file...');

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rowNumber++;
          const cleanedData = cleanData(row);
          
          if (cleanedData) {
            properties.push(cleanedData);
            validRows++;
          } else {
            skippedRows++;
          }
        })
        .on('end', async () => {
          try {
            console.log(`\n📊 CSV Processing Summary:`);
            console.log(`   Total rows processed: ${rowNumber}`);
            console.log(`   Valid rows: ${validRows}`);
            console.log(`   Skipped rows: ${skippedRows}`);

            if (properties.length === 0) {
              console.log('⚠️  No valid properties to import');
              mongoose.connection.close();
              return resolve();
            }

            console.log(`\n💾 Importing ${properties.length} properties...`);
            
            // Import in batches to avoid memory issues
            const batchSize = 500;
            let imported = 0;
            let referenceCounter = await Property.countDocuments(); // Start from current count

            for (let i = 0; i < properties.length; i += batchSize) {
              const batch = properties.slice(i, i + batchSize);
              
              // Generate unique references for each property
              const propertiesWithRefs = batch.map((prop) => {
                referenceCounter++;
                const year = new Date().getFullYear();
                const reference = `PROP-${year}-${String(referenceCounter).padStart(5, '0')}`;
                return { ...prop, reference };
              });
              
              await Property.insertMany(propertiesWithRefs, { ordered: false });
              imported += propertiesWithRefs.length;
              console.log(`   Imported ${imported}/${properties.length} properties...`);
            }

            console.log(`\n✅ Successfully imported ${imported} properties!`);
            
            // Display some statistics
            const stats = await Property.aggregate([
              {
                $group: {
                  _id: '$type',
                  count: { $sum: 1 },
                  avgPrice: { $avg: '$price' },
                }
              },
              { $sort: { count: -1 } }
            ]);

            console.log('\n📈 Import Statistics by Type:');
            stats.forEach(stat => {
              console.log(`   ${stat._id}: ${stat.count} properties (Avg price: ${Math.round(stat.avgPrice).toLocaleString()} TND)`);
            });

            mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
            resolve();
          } catch (error) {
            console.error('❌ Error importing data:', error);
            mongoose.connection.close();
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ Error reading CSV file:', error);
          mongoose.connection.close();
          reject(error);
        });
    });
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importData };

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'providers',
      columns: [
        {name: 'remote_id', type: 'string', isIndexed: true},
        {name: 'name', type: 'string'},
        {name: 'type', type: 'string', isIndexed: true},
        {name: 'address', type: 'string'},
        {name: 'city', type: 'string'},
        {name: 'district', type: 'string', isIndexed: true},
        {name: 'state', type: 'string'},
        {name: 'pin', type: 'string'},
        {name: 'lat', type: 'number', isOptional: true},
        {name: 'lng', type: 'number', isOptional: true},
        {name: 'contact_number', type: 'string', isOptional: true},
        {name: 'emergency_available', type: 'boolean'},
        {name: 'delivery_available', type: 'boolean'},
        {name: 'pickup_available', type: 'boolean'},
        {name: 'hours_json', type: 'string'},
        {name: 'description', type: 'string', isOptional: true},
        {name: 'updated_at_remote', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'doctors',
      columns: [
        {name: 'remote_id', type: 'string', isIndexed: true},
        {name: 'name', type: 'string'},
        {name: 'specialization', type: 'string'},
        {name: 'qualification', type: 'string', isOptional: true},
        {name: 'experience_years', type: 'number', isOptional: true},
        {name: 'availability', type: 'string', isOptional: true},
        {name: 'facility_id', type: 'string', isIndexed: true},
        {name: 'facility_name', type: 'string', isOptional: true},
        {name: 'city', type: 'string', isOptional: true},
        {name: 'district', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'medicines',
      columns: [
        {name: 'remote_id', type: 'string', isIndexed: true},
        {name: 'name', type: 'string'},
        {name: 'generic_name', type: 'string', isOptional: true},
        {name: 'brand_name', type: 'string', isOptional: true},
        {name: 'strength', type: 'string', isOptional: true},
        {name: 'dosage_form', type: 'string', isOptional: true},
        {name: 'facility_id', type: 'string', isIndexed: true},
        {name: 'quantity', type: 'number', isOptional: true},
        {name: 'unit_price', type: 'number', isOptional: true},
        {name: 'prescription_required', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'sync_meta',
      columns: [
        {name: 'key', type: 'string', isIndexed: true},
        {name: 'value', type: 'string'},
      ],
    }),
  ],
});

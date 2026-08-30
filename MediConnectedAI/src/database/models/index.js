import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class Provider extends Model {
  static table = 'providers';
  @field('remote_id') remoteId;
  @field('name') name;
  @field('type') type;
  @field('address') address;
  @field('city') city;
  @field('district') district;
  @field('state') state;
  @field('pin') pin;
  @field('lat') lat;
  @field('lng') lng;
  @field('contact_number') contactNumber;
  @field('emergency_available') emergencyAvailable;
  @field('delivery_available') deliveryAvailable;
  @field('pickup_available') pickupAvailable;
  @field('hours_json') hoursJson;
  @field('description') description;
  @field('updated_at_remote') updatedAtRemote;

  toPublic() {
    let hours = [];
    try {
      hours = JSON.parse(this.hoursJson || '[]');
    } catch {
      hours = [];
    }
    return {
      id: this.remoteId,
      name: this.name,
      type: this.type,
      address: this.address,
      city: this.city,
      district: this.district,
      state: this.state,
      pin: this.pin,
      geo: this.lat != null ? {lat: this.lat, lng: this.lng} : null,
      contactNumber: this.contactNumber,
      emergencyAvailable: this.emergencyAvailable,
      deliveryAvailable: this.deliveryAvailable,
      pickupAvailable: this.pickupAvailable,
      operatingHours: hours,
      description: this.description,
      offline: true,
    };
  }
}

export class Doctor extends Model {
  static table = 'doctors';
  @field('remote_id') remoteId;
  @field('name') name;
  @field('specialization') specialization;
  @field('qualification') qualification;
  @field('experience_years') experienceYears;
  @field('availability') availability;
  @field('facility_id') facilityId;
  @field('facility_name') facilityName;
  @field('city') city;
  @field('district') district;

  toPublic() {
    return {
      id: this.remoteId,
      name: this.name,
      specialization: this.specialization,
      qualification: this.qualification,
      experienceYears: this.experienceYears,
      availability: this.availability,
      facilityId: this.facilityId,
      facility: {id: this.facilityId, name: this.facilityName, city: this.city, district: this.district},
      offline: true,
    };
  }
}

export class Medicine extends Model {
  static table = 'medicines';
  @field('remote_id') remoteId;
  @field('name') name;
  @field('generic_name') genericName;
  @field('brand_name') brandName;
  @field('strength') strength;
  @field('dosage_form') dosageForm;
  @field('facility_id') facilityId;
  @field('quantity') quantity;
  @field('unit_price') unitPrice;
  @field('prescription_required') prescriptionRequired;

  toPublic() {
    return {
      id: this.remoteId,
      name: this.name,
      genericName: this.genericName,
      brandName: this.brandName,
      strength: this.strength,
      dosageForm: this.dosageForm,
      facilityId: this.facilityId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      prescriptionRequired: this.prescriptionRequired,
      offline: true,
    };
  }
}

export class SyncMeta extends Model {
  static table = 'sync_meta';
  @field('key') key;
  @field('value') value;
}

import { createApartment, deleteApartment, updateApartment, updateApartmentStatus } from './apartment/apartmentWrites';
import { bulkUpdateApartments } from './apartment/bulkUpdateApartments';
import { getApartmentById } from './apartment/getApartmentById';
import { ensureLandingToken, getByLandingToken } from './apartment/landingApartment';
import { listApartments } from './apartment/listApartments';

export const apartmentService = {
  getAll: listApartments,
  getById: getApartmentById,
  create: createApartment,
  update: updateApartment,
  updateStatus: updateApartmentStatus,
  delete: deleteApartment,
  getByLandingToken,
  bulkUpdate: bulkUpdateApartments,
  ensureLandingToken,
};

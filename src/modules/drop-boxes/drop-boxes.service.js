// src/modules/drop-boxes/drop-boxes.service.js
import * as dropBoxesRepository from './drop-boxes.repository.js';

export async function createDropBox(dropBoxData) {
  return dropBoxesRepository.createDropBox(dropBoxData);
}

export async function listDropBoxes({ filters }) {
  return dropBoxesRepository.listDropBoxes({ filters });
}

export async function getDropBoxById(id) {
  return dropBoxesRepository.getDropBoxById(id);
}

export async function updateDropBox(id, fields) {
  return dropBoxesRepository.updateDropBox(id, fields);
}

export async function deleteDropBox(id) {
  return dropBoxesRepository.deleteDropBox(id);
}
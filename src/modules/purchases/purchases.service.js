import * as repository from './purchases.repository.js';
import { AppError } from '../../shared/app-error.js';

export async function create(data, userId) {
  // Check if purchase order number already exists
  const existing = await repository.getByPurchaseOrderNo(data.purchase_order_no);
  if (existing) {
    throw new AppError('PURCHASE_ORDER_EXISTS', 'Purchase order number already exists', 409);
  }

  // Validate vendor exists
  const vendor = await repository.getVendorById(data.vendor_id);
  if (!vendor) {
    throw new AppError('VENDOR_NOT_FOUND', 'Vendor not found', 404);
  }

  // Validate org unit exists
  const orgUnit = await repository.getOrgUnitById(data.org_unit_id);
  if (!orgUnit) {
    throw new AppError('ORG_UNIT_NOT_FOUND', 'Organization unit not found', 404);
  }

  // Calculate grand total if not provided
  const totalAmount = parseFloat(data.total_amount);
  const taxAmount = parseFloat(data.tax_amount || 0);
  const shippingCost = parseFloat(data.shipping_cost || 0);
  const otherCharges = parseFloat(data.other_charges || 0);
  const grandTotal = data.grand_total || (totalAmount + taxAmount + shippingCost + otherCharges);

  const purchaseData = {
    ...data,
    grand_total: grandTotal,
    purchased_by: userId,
  };

  return repository.create(purchaseData);
}

export async function getById(id) {
  const purchase = await repository.getById(id);
  if (!purchase) {
    throw new AppError('PURCHASE_NOT_FOUND', 'Purchase not found', 404);
  }
  return purchase;
}

export async function list(filters) {
  const offset = (filters.page - 1) * filters.limit;
  
  const processedFilters = {
    ...filters,
    offset,
  };

  const result = await repository.list(processedFilters);
  
  return {
    items: result.items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      pages: Math.ceil(result.total / filters.limit),
    },
  };
}

export async function update(id, data) {
  // Check if purchase exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('PURCHASE_NOT_FOUND', 'Purchase not found', 404);
  }

  // Check purchase order number uniqueness if updating
  if (data.purchase_order_no && data.purchase_order_no !== existing.purchase_order_no) {
    const orderExists = await repository.getByPurchaseOrderNo(data.purchase_order_no);
    if (orderExists) {
      throw new AppError('PURCHASE_ORDER_EXISTS', 'Purchase order number already exists', 409);
    }
  }

  // Validate vendor if updating
  if (data.vendor_id && data.vendor_id !== existing.vendor_id) {
    const vendor = await repository.getVendorById(data.vendor_id);
    if (!vendor) {
      throw new AppError('VENDOR_NOT_FOUND', 'Vendor not found', 404);
    }
  }

  // Validate org unit if updating
  if (data.org_unit_id && data.org_unit_id !== existing.org_unit_id) {
    const orgUnit = await repository.getOrgUnitById(data.org_unit_id);
    if (!orgUnit) {
      throw new AppError('ORG_UNIT_NOT_FOUND', 'Organization unit not found', 404);
    }
  }

  return repository.update(id, data);
}

export async function deleteById(id) {
  // Check if purchase exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('PURCHASE_NOT_FOUND', 'Purchase not found', 404);
  }

  return repository.deleteById(id);
}

export async function addItem(purchaseId, itemData) {
  // Validate purchase exists
  const purchase = await repository.getById(purchaseId);
  if (!purchase) {
    throw new AppError('PURCHASE_NOT_FOUND', 'Purchase not found', 404);
  }

  // Calculate total price
  const totalPrice = parseFloat(itemData.unit_price) * parseInt(itemData.quantity);
  const data = {
    ...itemData,
    purchase_id: purchaseId,
    total_price: totalPrice,
  };

  return repository.addItem(data);
}

export async function getItems(purchaseId) {
  // Validate purchase exists
  const purchase = await repository.getById(purchaseId);
  if (!purchase) {
    throw new AppError('PURCHASE_NOT_FOUND', 'Purchase not found', 404);
  }

  return repository.getItems(purchaseId);
}

export async function updateItem(itemId, data) {
  // Check if item exists
  const existing = await repository.getItemById(itemId);
  if (!existing) {
    throw new AppError('PURCHASE_ITEM_NOT_FOUND', 'Purchase item not found', 404);
  }

  // Recalculate total price if quantity or unit_price changed
  if (data.quantity || data.unit_price) {
    const quantity = data.quantity || existing.quantity;
    const unitPrice = data.unit_price || existing.unit_price;
    data.total_price = parseFloat(unitPrice) * parseInt(quantity);
  }

  return repository.updateItem(itemId, data);
}

export async function deleteItem(itemId) {
  // Check if item exists
  const existing = await repository.getItemById(itemId);
  if (!existing) {
    throw new AppError('PURCHASE_ITEM_NOT_FOUND', 'Purchase item not found', 404);
  }

  return repository.deleteItem(itemId);
}

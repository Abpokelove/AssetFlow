import axiosInstance from './axiosInstance';

/**
 * Organization Service
 * ====================
 * API calls for Departments, Categories, and Employees.
 */

// ---- Departments ----

/**
 * GET /api/departments
 * Returns: Department[]
 * Department: { id, name, headCount, assetCount, manager }
 */
export const getDepartments = () =>
  axiosInstance.get('/departments');

/**
 * POST /api/departments
 * Body: { name, manager }
 * Returns: Department
 */
export const createDepartment = (data) =>
  axiosInstance.post('/departments', data);

/**
 * PUT /api/departments/:id
 * Body: Partial<Department>
 * Returns: Department
 */
export const updateDepartment = (id, data) =>
  axiosInstance.put(`/departments/${id}`, data);

/**
 * DELETE /api/departments/:id
 * Returns: 204
 */
export const deleteDepartment = (id) =>
  axiosInstance.delete(`/departments/${id}`);

// ---- Categories ----

/**
 * GET /api/categories
 * Returns: Category[]
 * Category: { id, name, description, assetCount, icon }
 */
export const getCategories = () =>
  axiosInstance.get('/categories');

/**
 * POST /api/categories
 * Body: { name, description }
 * Returns: Category
 */
export const createCategory = (data) =>
  axiosInstance.post('/categories', data);

/**
 * PUT /api/categories/:id
 * Body: Partial<Category>
 * Returns: Category
 */
export const updateCategory = (id, data) =>
  axiosInstance.put(`/categories/${id}`, data);

/**
 * DELETE /api/categories/:id
 * Returns: 204
 */
export const deleteCategory = (id) =>
  axiosInstance.delete(`/categories/${id}`);

// ---- Employees ----

/**
 * GET /api/employees
 * Query: { page, pageSize, department, status, search }
 * Returns: { data: Employee[], total: number }
 * Employee: { id, name, email, department, role, status, joinDate, allocatedAssets }
 */
export const getEmployees = (params = {}) =>
  axiosInstance.get('/employees', { params });

/**
 * GET /api/employees/:id
 * Returns: Employee (with full asset allocation history)
 */
export const getEmployeeById = (id) =>
  axiosInstance.get(`/employees/${id}`);

/**
 * POST /api/employees
 * Body: { name, email, department, role }
 * Returns: Employee
 */
export const createEmployee = (data) =>
  axiosInstance.post('/employees', data);

/**
 * PUT /api/employees/:id
 * Body: Partial<Employee>
 * Returns: Employee
 */
export const updateEmployee = (id, data) =>
  axiosInstance.put(`/employees/${id}`, data);

/**
 * DELETE /api/employees/:id
 * Returns: 204
 */
export const deleteEmployee = (id) =>
  axiosInstance.delete(`/employees/${id}`);

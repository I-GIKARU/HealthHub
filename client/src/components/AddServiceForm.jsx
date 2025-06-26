import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useServices from '../utils/useServices';

const AddServiceForm = () => {
  const { addService } = useServices();

  const formik = useFormik({
    initialValues: {
      name: '',
      price: '',
      duration: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      price: Yup.number().required('Required').min(0),
      duration: Yup.number().required('Required').min(1),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await addService(values);
        resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Service</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Service Name</label>
          <input
            type="text"
            name="name"
            className="w-full border px-3 py-2 rounded"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Price</label>
          <input
            type="number"
            name="price"
            className="w-full border px-3 py-2 rounded"
            onChange={formik.handleChange}
            value={formik.values.price}
          />
          {formik.touched.price && formik.errors.price && (
            <p className="text-red-500 text-sm">{formik.errors.price}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Duration (mins)</label>
          <input
            type="number"
            name="duration"
            className="w-full border px-3 py-2 rounded"
            onChange={formik.handleChange}
            value={formik.values.duration}
          />
          {formik.touched.duration && formik.errors.duration && (
            <p className="text-red-500 text-sm">{formik.errors.duration}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Adding...' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default AddServiceForm;

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useInsurances from '../utils/useInsurances';

const AddInsuranceForm = () => {
    const { addInsurance } = useInsurances();

    const formik = useFormik({
        initialValues: {
            name: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Insurance name is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                await addInsurance(values.name);
                resetForm();
            } catch (error) {
                console.error(error);
            }
        },
    });

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Add Insurance Provider</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Insurance Name</label>
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

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={formik.isSubmitting}
                >
                    {formik.isSubmitting ? 'Adding...' : 'Add Insurance'}
                </button>
            </form>
        </div>
    );
};

export default AddInsuranceForm;

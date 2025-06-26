import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import {
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';

import useClinicServices from '../utils/useClinicServices';
import useReviews from '../utils/useReviews';

const ClinicDetail = () => {
  const { id } = useParams();
  const { clinics } = useClinicServices();
  const { reviews, fetchReviewsByClinic } = useReviews();

  const clinic = clinics.find((c) => String(c.id) === String(id));

  useEffect(() => {
    if (id) {
      fetchReviewsByClinic(id);
    }
  }, [id]);

  if (!clinic) {
    return <div className="text-center py-10">Clinic not found</div>;
  }

  const services = clinic.services ?? [];
  const insuranceAccepted = clinic.insurance_accepted ?? [];

  const averageRating =
      reviews.length > 0
          ? (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
          ).toFixed(1)
          : 0;

  return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {clinic.image_url && (
            <img
                src={clinic.image_url}
                alt={clinic.name}
                className="w-full h-64 object-cover"
            />
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">{clinic.name}</h1>
          <p className="text-xl text-gray-600 mb-4">{clinic.specialty}</p>

          <div className="flex items-center mb-6">
            <div className="flex mr-4">
              {[1, 2, 3, 4, 5].map((star) =>
                  star <= Math.round(averageRating) ? (
                      <FaStar key={star} className="text-yellow-400 text-xl" />
                  ) : (
                      <FaRegStar key={star} className="text-yellow-400 text-xl" />
                  )
              )}
            </div>
            <span className="text-gray-700">
            {averageRating} out of 5 ({reviews.length} reviews)
          </span>
          </div>

          {/* Contact Info and Insurance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-blue-600 mr-2" />
                  <span>{clinic.street}, {clinic.city}</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-2" />
                  <span>{clinic.contact}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-600 mr-2" />
                  <span>{clinic.email}</span>
                </div>
              </div>

              {insuranceAccepted.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-800">
                      Insurance Accepted
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {insuranceAccepted.map((insurance, index) => (
                          <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                      {typeof insurance === 'object' ? insurance.name : String(insurance)}
                    </span>
                      ))}
                    </div>
                  </>
              )}
            </div>

            {/* Services */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Services</h2>
              {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4">
                          <h3 className="font-medium text-gray-800">
                            {typeof service === 'object' ? service.name : String(service)}
                          </h3>
                          <div className="flex justify-between text-gray-600 mt-1">
                      <span>
                        Price: {typeof service === 'object' ? service.price : 'N/A'}
                      </span>
                            <span>
                        Duration: {typeof service === 'object' ? service.duration : 'N/A'}
                      </span>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500">No services listed.</p>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">About</h2>
            <p className="text-gray-700">{clinic.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Reviews</h2>
            {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet.</p>
            ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center text-yellow-500 mb-1">
                          {[...Array(5)].map((_, i) =>
                              i < review.rating ? (
                                  <FaStar key={i} />
                              ) : (
                                  <FaRegStar key={i} />
                              )
                          )}
                        </div>
                        <p className="text-gray-800">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          — {review.patient?.name || "Anonymous"}, {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mb-8 space-x-4">
            <Link
                to={`/clinics/${clinic.id}/book`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Book Appointment
            </Link>
            <Link
                to={`/clinics/${clinic.id}/review`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add Review
            </Link>
          </div>

          <Link
              to="/clinics"
              className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Back to Clinics
          </Link>
        </div>
      </div>
  );
};

export default ClinicDetail;

import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaRegStar } from 'react-icons/fa';

const ClinicCard = ({ clinic }) => {
  const averageRating =
      clinic.reviews && clinic.reviews.length > 0
          ? (
              clinic.reviews.reduce((sum, review) => sum + review.rating, 0) /
              clinic.reviews.length
          ).toFixed(1)
          : 'No reviews';

  return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
        {/* Clinic Image */}
        <img
            src={clinic.image_url}
            alt="Clinic"
            className="w-full h-48 object-cover"
        />

        <div className="p-6">
          <h3 className="text-xl font-bold text-blue-800 mb-2">{clinic.name}</h3>
          <p className="text-gray-600 mb-1">{clinic.specialty}</p>

          <div className="flex items-center text-gray-600 mb-3">
            <FaMapMarkerAlt className="mr-1" />
            <span>
            {clinic.street ?? 'Unknown Street'}, {clinic.city ?? 'Unknown City'}
          </span>
          </div>

          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) =>
                averageRating !== 'No reviews' && star <= Math.round(averageRating) ? (
                    <FaStar key={star} className="text-yellow-400" />
                ) : (
                    <FaRegStar key={star} className="text-yellow-400" />
                )
            )}
            <span className="ml-2 text-gray-700">
            {averageRating} ({clinic.reviews?.length ?? 0} reviews)
          </span>
          </div>

          {clinic.insurance_accepted?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-1">
                  Insurance Accepted:
                </h4>
                <div className="flex flex-wrap gap-2">
                    {clinic.insurance_accepted.map((insurance, index) => (
                        <span
                            key={insurance.id || index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
    {insurance.name}
  </span>
                    ))}

                </div>
              </div>
          )}

          <Link
              to={`/clinics/${clinic.id}`}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
  );
};

export default ClinicCard;

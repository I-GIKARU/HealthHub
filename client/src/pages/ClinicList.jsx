import { useState, useEffect } from 'react';
import ClinicCard from '../components/ClinicCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import useInsurances from "../utils/useInsurances.js";
import useServices from "../utils/useServices.js";
import useClinicServices from "../utils/useClinicServices.js";


const ClinicList = () => {
  const { clinics, loading, error } = useClinicServices();
  const { insurances } = useInsurances();
  const { services } = useServices();
  const [filteredClinics, setFilteredClinics] = useState([]);

  useEffect(() => {
    if (clinics) {
      setFilteredClinics(clinics);
    }
  }, [clinics]);

  const handleSearch = (filters) => {
    let results = [...clinics];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(clinic =>
          clinic.name.toLowerCase().includes(term) ||
          clinic.specialty.toLowerCase().includes(term) ||
          clinic.description.toLowerCase().includes(term)
      );
    }

    if (filters.specialty) {
      results = results.filter(clinic =>
          clinic.specialty === filters.specialty
      );
    }

    if (filters.insurance) {
      results = results.filter(clinic =>
          clinic.insurance_accepted.includes(parseInt(filters.insurance))
      );
    }

    setFilteredClinics(results);
  };

  const specialties = [...new Set(clinics?.map(clinic => clinic.specialty) || [])];
  const insuranceOptions = insurances.map(insurance => ({
    value: insurance.id,
    label: insurance.name
  }));


  if (loading) return <div className="text-center py-10">Loading clinics...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar
              onSearch={handleSearch}
              specialties={specialties}
              insurances={insuranceOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map(clinic => (
              <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  insurances={insurances}
                  services={services}
              />
          ))}
        </div>

        {filteredClinics.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No clinics found matching your criteria. Try adjusting your search filters.
            </div>
        )}
      </div>
  );
};

export default ClinicList;
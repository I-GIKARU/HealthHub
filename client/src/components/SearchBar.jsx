import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ onSearch, specialties }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [insuranceFilter, setInsuranceFilter] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      specialty: selectedSpecialty,
      insurance: insuranceFilter,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setInsuranceFilter("");
    onSearch({
      searchTerm: "",
      specialty: "",
      insurance: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Specialties</option>
          {specialties.map((specialty, index) => (
            <option key={index} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>



        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition flex items-center"
          >
            <FaTimes className="mr-1" />
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

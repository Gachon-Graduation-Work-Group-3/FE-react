import React, { useState } from 'react';

const FilterTree = ({ data, onFilterChange }) => {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSubModel, setSelectedSubModel] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);


  const handleManufacturerSelect = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
    onFilterChange({ manufacturer });
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedSubModel(null);
    setSelectedGrade(null);
    onFilterChange({ manufacturer: selectedManufacturer, model });
  };

  // ... 비슷한 방식으로 서브모델과 등급 핸들러 구현

  return (
    <div className="filter-tree">
      <div className="filter-level">
        <h3>제조사</h3>
        {data.map(manufacturer => (
          <div 
            key={manufacturer.id}
            className={`filter-item ${selectedManufacturer?.id === manufacturer.id ? 'selected' : ''}`}
            onClick={() => handleManufacturerSelect(manufacturer)}
          >
            {manufacturer.name}
          </div>
        ))}
      </div>

      {selectedManufacturer && (
        <div className="filter-level">
          <h3>모델</h3>
          {selectedManufacturer.models.map(model => (
            <div 
              key={model.id}
              className={`filter-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model)}
            >
              {model.name}
            </div>
          ))}
        </div>
      )}

      {/* 서브모델과 등급도 비슷한 구조로 구현 */}
    </div>
  );
};

export default FilterTree;

// 스타일링

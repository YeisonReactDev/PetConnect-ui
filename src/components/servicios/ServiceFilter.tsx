import React, { useState } from 'react'

interface ServiceFilterProps {
  categories: string[]
  onFilterChange: (filters: { search: string; category: string }) => void
}

export default function ServiceFilter({ categories, onFilterChange }: ServiceFilterProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    onFilterChange({ search: newSearch, category: selectedCategory })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    setSelectedCategory(newCategory)
    onFilterChange({ search, category: newCategory })
  }

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Filtrar servicios</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
          Buscar por nombre:
        </label>
        <input
          type="text"
          placeholder="Nombre del servicio..."
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
          Categoría:
        </label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

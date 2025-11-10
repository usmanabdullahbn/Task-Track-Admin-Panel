import React, { useState } from "react"
import { assets as mockAssets } from "../lib/mock-data" // ✅ Corrected import (should come from mock-data, not sidebar)
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"

const AssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [assets] = useState(mockAssets)

  const filteredAssets = assets.filter(
    (asset) =>
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
            <Link
              to="/assets/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Asset
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <input
                type="text"
                placeholder="Search assets by title, customer, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Manufacturer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.manufacturer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.barcode}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/assets/${asset.id}`}
                          className="text-green-700 hover:text-green-900 font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AssetsPage

'use client'

import { useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapProps {
  onLocationSelect: (lat: number, lon: number) => void
  markerLat?: number
  markerLon?: number
}

export default function MapComponent({
  onLocationSelect,
  markerLat,
  markerLon,
}: MapProps) {
  const mapRef = useRef(null)

  const handleMapClick = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat
      onLocationSelect(lat, lng)
    },
    [onLocationSelect]
  )

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: markerLon ?? 24.9355,
        latitude: markerLat ?? 60.1699,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onClick={handleMapClick}
    >
      <NavigationControl position="top-left" />
      {markerLat && markerLon && (
        <Marker longitude={markerLon} latitude={markerLat} color="red" />
      )}
    </Map>
  )
}

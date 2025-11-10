export interface Demographics {
  age_0_18: number
  age_19_40: number
  age_41_65: number
  age_65_plus: number
  average_income: number
  purchasing_power_index: number
  population_density: number
}

export interface Competitor {
  name: string
  distance: number // metreissä
  type: string
}

export interface TrafficData {
  pedestrian_flow_daily: number
  vehicle_flow_daily: number
  peak_hours: string[]
}

export function generateRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function fetchMockDemographics(lat: number, lon: number): Demographics {
  // Simuloi väestötietoja koordinaattien perusteella
  const seed = Math.abs(Math.sin(lat * lon) * 10000)

  return {
    age_0_18: generateRandomInRange(150, 400),
    age_19_40: generateRandomInRange(400, 800),
    age_41_65: generateRandomInRange(300, 700),
    age_65_plus: generateRandomInRange(100, 300),
    average_income: generateRandomInRange(35000, 65000),
    purchasing_power_index: Math.round((0.8 + seed * 0.001) * 100) / 100,
    population_density: generateRandomInRange(100, 5000),
  }
}

export function fetchMockCompetition(
  lat: number,
  lon: number,
  industry: string
): Competitor[] {
  const competitorNames: Record<string, string[]> = {
    restaurant: ['Ravintola Nolla', 'Café Midnight', 'Pikavõttu', 'Grillihovi'],
    cafe: ['Kahvila Tunturi', 'Espresso Corner', 'Kahve & Voide'],
    gym: ['FitZone', 'PowerGym', 'Crossfit Arena', 'Yoga Studio'],
    retail: ['Kauppa Kulmalla', 'MegaStore', 'Boutique Select'],
  }

  const names = competitorNames[industry] || competitorNames.retail
  const count = generateRandomInRange(1, 4)
  const competitors: Competitor[] = []

  for (let i = 0; i < count; i++) {
    competitors.push({
      name: names[i % names.length],
      distance: generateRandomInRange(100, 1000),
      type: industry,
    })
  }

  return competitors
}

export function fetchMockTraffic(lat: number, lon: number): TrafficData {
  return {
    pedestrian_flow_daily: generateRandomInRange(2000, 15000),
    vehicle_flow_daily: generateRandomInRange(5000, 30000),
    peak_hours: ['08:00-09:00', '12:00-13:00', '17:00-19:00'],
  }
}

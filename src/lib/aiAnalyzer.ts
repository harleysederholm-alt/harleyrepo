import {
  Demographics,
  Competitor,
  TrafficData,
} from './dataMocks'

export interface AnalysisResult {
  score: number // 0-10
  summary: string
  pros: string[]
  cons: string[]
  recommendation: string
}

export function calculateLocationScore(
  demographics: Demographics,
  competitors: Competitor[],
  traffic: TrafficData,
  industry: string
): AnalysisResult {
  // Painotettu pisteytysalgoritmi

  // 1. Ostovoima (0-10): purchasing_power_index
  const purchasingPowerScore = Math.min(10, demographics.purchasing_power_index * 8)

  // 2. Jalankulkuvirta (0-10): normalize pedestrian flow
  const trafficScore = Math.min(10, (traffic.pedestrian_flow_daily / 2000) * 2)

  // 3. Kilpailu (0-10): vähemmän kilpailijoita = parempi
  const competitionPenalty = competitors.length * 1.5
  const competitionScore = Math.max(0, 10 - competitionPenalty)

  // 4. Väestön potentiaali (0-10): nuori väestö on usein hyvä
  const youngPopulation = demographics.age_19_40 + demographics.age_0_18
  const totalPopulation =
    demographics.age_0_18 +
    demographics.age_19_40 +
    demographics.age_41_65 +
    demographics.age_65_plus
  const youngPercentage = (youngPopulation / totalPopulation) * 100
  const ageScore = Math.min(10, (youngPercentage / 50) * 8)

  // 5. Tiheys (0-10): hyvä väestön tiheys
  const densityScore = Math.min(10, (demographics.population_density / 1000) * 5)

  // Painotettu keskiarvo
  const weights = {
    purchasing: 0.25,
    traffic: 0.30,
    competition: 0.20,
    age: 0.15,
    density: 0.10,
  }

  const finalScore =
    purchasingPowerScore * weights.purchasing +
    trafficScore * weights.traffic +
    competitionScore * weights.competition +
    ageScore * weights.age +
    densityScore * weights.density

  // Generoi pros ja cons
  const pros: string[] = []
  const cons: string[] = []

  if (purchasingPowerScore > 7) {
    pros.push(`Korkea ostovoima (indeksi: ${demographics.purchasing_power_index})`)
  } else {
    cons.push(`Matalampi ostovoima`)
  }

  if (trafficScore > 7) {
    pros.push(`Erittäin vilkas jalankulkuvirta (${traffic.pedestrian_flow_daily} päivässä)`)
  } else if (trafficScore < 4) {
    cons.push(`Vähäinen jalankulkuvirta`)
  }

  if (competitors.length === 0) {
    pros.push(`Ei kilpailijoita lähellä - monopoli-tilanne!`)
  } else if (competitors.length > 2) {
    cons.push(`${competitors.length} kilpailijaa lähellä - kova kilpailu`)
  }

  if (youngPercentage > 55) {
    pros.push(`Nuori väestö (${Math.round(youngPercentage)}% alle 40-vuotiaita)`)
  }

  if (demographics.population_density > 2000) {
    pros.push(`Tiheä väestö - korkea kysyntä`)
  } else {
    cons.push(`Pienempi väestötiheys`)
  }

  // Suositus
  let recommendation = ''
  if (finalScore >= 8) {
    recommendation = `🎯 LOISTAVA sijainti! Tämä on yksi parhaista sijainneista. Suosittelemme investointia.`
  } else if (finalScore >= 6.5) {
    recommendation = `✅ HYVÄ sijainti. Potentiaali on hyvä, mutta huomaa esiin nostetut haasteet.`
  } else if (finalScore >= 5) {
    recommendation = `⚠️ KESKITASOA sijainti. Kannattaa harkita muita vaihtoehtoja tai analysoidaan tarkemmin.`
  } else {
    recommendation = `❌ HEIKKO sijainti. Suosittelemme etsimään parempia vaihtoehtoja.`
  }

  return {
    score: Math.round(finalScore * 10) / 10,
    summary: generateSummary(demographics, competitors, traffic, industry),
    pros,
    cons,
    recommendation,
  }
}

function generateSummary(
  demographics: Demographics,
  competitors: Competitor[],
  traffic: TrafficData,
  industry: string
): string {
  const competitorText =
    competitors.length === 0
      ? 'Ei suoria kilpailijoita lähellä.'
      : `${competitors.length} kilpailijaa lähellä ${Math.min(...competitors.map(c => c.distance))}m etäisyydellä.`

  return `Alueella on ${demographics.population_density} asukkaan väestötiheys ja keskimääräinen tulotaso on ${demographics.average_income}€. Jalankulkuvirta on ${traffic.pedestrian_flow_daily} henkeä päivässä. ${competitorText}`
}

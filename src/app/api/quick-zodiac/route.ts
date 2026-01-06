import { NextResponse } from "next/server"

// Western Zodiac calculation
function getWesternZodiac(month: number, day: number) {
  const zodiacSigns = [
    { sign: "Capricorn", element: "Earth", quality: "Cardinal", planet: "Saturn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", element: "Air", quality: "Fixed", planet: "Uranus", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", element: "Water", quality: "Mutable", planet: "Neptune", start: [2, 19], end: [3, 20] },
    { sign: "Aries", element: "Fire", quality: "Cardinal", planet: "Mars", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", element: "Earth", quality: "Fixed", planet: "Venus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", element: "Air", quality: "Mutable", planet: "Mercury", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", element: "Water", quality: "Cardinal", planet: "Moon", start: [6, 21], end: [7, 22] },
    { sign: "Leo", element: "Fire", quality: "Fixed", planet: "Sun", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", element: "Earth", quality: "Mutable", planet: "Mercury", start: [8, 23], end: [9, 22] },
    { sign: "Libra", element: "Air", quality: "Cardinal", planet: "Venus", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", element: "Water", quality: "Fixed", planet: "Pluto", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", element: "Fire", quality: "Mutable", planet: "Jupiter", start: [11, 22], end: [12, 21] },
  ]

  for (const zodiac of zodiacSigns) {
    const [startMonth, startDay] = zodiac.start
    const [endMonth, endDay] = zodiac.end

    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return {
        sign: zodiac.sign,
        element: zodiac.element,
        quality: zodiac.quality,
        rulingPlanet: zodiac.planet,
      }
    }
  }

  return zodiacSigns[0] // Default to Capricorn
}

// Chinese Zodiac calculation
function getChineseZodiac(year: number) {
  const animals = [
    { name: "Rat", element: "Water", yinYang: "Yang" },
    { name: "Ox", element: "Earth", yinYang: "Yin" },
    { name: "Tiger", element: "Wood", yinYang: "Yang" },
    { name: "Rabbit", element: "Wood", yinYang: "Yin" },
    { name: "Dragon", element: "Earth", yinYang: "Yang" },
    { name: "Snake", element: "Fire", yinYang: "Yin" },
    { name: "Horse", element: "Fire", yinYang: "Yang" },
    { name: "Goat", element: "Earth", yinYang: "Yin" },
    { name: "Monkey", element: "Metal", yinYang: "Yang" },
    { name: "Rooster", element: "Metal", yinYang: "Yin" },
    { name: "Dog", element: "Earth", yinYang: "Yang" },
    { name: "Pig", element: "Water", yinYang: "Yin" },
  ]

  const elements = ["Metal", "Water", "Wood", "Fire", "Earth"]
  
  // Chinese zodiac starts from 1924 (Year of the Rat)
  const baseYear = 1924
  const index = (year - baseYear) % 12
  const elementIndex = Math.floor(((year - baseYear) % 10) / 2)

  const animal = animals[index < 0 ? index + 12 : index]
  const yearElement = elements[elementIndex < 0 ? elementIndex + 5 : elementIndex]

  return {
    sign: animal.name,
    element: yearElement,
    yinYang: animal.yinYang,
  }
}

export async function POST(req: Request) {
  try {
    const { birthDate } = await req.json()

    if (!birthDate) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      )
    }

    const date = new Date(birthDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // Validate date
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return NextResponse.json(
        { error: "Invalid birth date" },
        { status: 400 }
      )
    }

    const westernZodiac = getWesternZodiac(month, day)
    const chineseZodiac = getChineseZodiac(year)

    return NextResponse.json({
      westernZodiac,
      chineseZodiac,
      birthYear: year,
    })
  } catch (error) {
    console.error("Error in quick zodiac analysis:", error)
    return NextResponse.json(
      { error: "Failed to analyze zodiac" },
      { status: 500 }
    )
  }
}

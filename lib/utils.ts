import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AQI color utility
export function getAQIColor(aqi: number): 'green' | 'yellow' | 'red' {
  if (aqi <= 50) return 'green';
  if (aqi <= 100) return 'yellow';
  return 'red';
}

// AQI label utility
export function getAQILabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) {
    return { label: 'Good', color: 'green' };
  } else if (aqi <= 100) {
    return { label: 'Moderate', color: 'yellow' };
  } else if (aqi <= 150) {
    return { label: 'Unhealthy for Sensitive Groups', color: 'orange' };
  } else if (aqi <= 200) {
    return { label: 'Unhealthy', color: 'red' };
  } else if (aqi <= 300) {
    return { label: 'Very Unhealthy', color: 'purple' };
  } else {
    return { label: 'Hazardous', color: 'maroon' };
  }
}

// Optionally, for pollutant levels (assuming similar breakpoints)
export function getPollutantColor(level: number, low: number, moderate: number): 'green' | 'yellow' | 'red' {
  if (level <= low) return 'green';
  if (level <= moderate) return 'yellow';
  return 'red';
}
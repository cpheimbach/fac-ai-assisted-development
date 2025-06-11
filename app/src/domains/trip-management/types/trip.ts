export interface Trip {
  id: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTripData {
  name: string
  destination: string
  startDate: Date
  endDate: Date
}

export interface UpdateTripData {
  name?: string
  destination?: string
  startDate?: Date
  endDate?: Date
}
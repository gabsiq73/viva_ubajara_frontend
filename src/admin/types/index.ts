// ============================================================
// Tipos base — Paginação (Spring Boot Page)
// ============================================================
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  number: number; // página atual (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================================
// Auth
// ============================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRequest {
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
}

export type UserRole = 'ADMIN' | 'USER' | 'GUIDE';

export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
  name?: string;
  photo?: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
}

// ============================================================
// Photos
// ============================================================
export interface PhotoResponse {
  id: string;
  url: string;
  description?: string;
  displayOrder?: number;
  ownerType?: string;
  ownerId?: string;
  createdAt?: string;
}

// ============================================================
// Attractions
// ============================================================
export type AttractionCategory = 'PARK' | 'WATERFALL' | 'MUSEUM' | 'FARM' | 'ROUTE' | 'MARKET';

export interface AttractionRequest {
  name: string;
  description: string;
  shortDescription?: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  openToPublic?: boolean;
  freeAccess?: boolean;
  openingHours?: string;
  entryPrice?: number;
  hasGuide?: boolean;
  averageVisitDuration?: number;
  category: AttractionCategory;
}

export interface AttractionUpdateDTO {
  name?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active?: boolean;
  openToPublic?: boolean;
  freeAccess?: boolean;
  openingHours?: string;
  entryPrice?: number;
  hasGuide?: boolean;
  averageVisitDuration?: number;
  category?: AttractionCategory;
}

export interface AttractionResponse {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  openToPublic?: boolean;
  freeAccess?: boolean;
  openingHours?: string;
  entryPrice?: number;
  hasGuide?: boolean;
  averageVisitDuration?: number;
  category: AttractionCategory;
  photos: PhotoResponse[];
}

// ============================================================
// Tourist Spots
// ============================================================
export interface TouristSpotRequest {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  active: boolean;
}

export interface TouristSpotUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  active?: boolean;
}

export interface TouristSpotResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  active: boolean;
  photos: PhotoResponse[];
}

// ============================================================
// Events
// ============================================================
export interface EventRequest {
  name: string;
  description: string;
  /** Format: dd/MM/yyyy HH:mm:ss */
  startDateTime: string;
  /** Format: dd/MM/yyyy HH:mm:ss */
  endDateTime: string;
  location: string;
  registrationUrl?: string;
  active: boolean;
}

export interface EventUpdateDTO {
  name?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  registrationUrl?: string;
  active?: boolean;
}

export interface EventResponse {
  id: string;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  registrationUrl?: string;
  active: boolean;
  photos: PhotoResponse[];
}

// ============================================================
// Restaurants
// ============================================================
export interface RestaurantRequest {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  cuisineType: string;
  openingHours?: string;
  avgPrice?: number;
  acceptsReservation?: boolean;
}

export interface RestaurantUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active?: boolean;
  cuisineType?: string;
  openingHours?: string;
  avgPrice?: number;
  acceptsReservation?: boolean;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  cuisineType: string;
  openingHours?: string;
  avgPrice?: number;
  acceptsReservation?: boolean;
  photos: PhotoResponse[];
}

// ============================================================
// Host Points
// ============================================================
export type HostType = 'HOTEL' | 'ROOST' | 'HOSTEL';

export interface HostPointRequest {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  hostType: HostType;
  numOfRooms?: number;
  avgPrice?: number;
  bookingUrl?: string;
}

export interface HostPointUpdateDTO {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active?: boolean;
  hostType?: HostType;
  numOfRooms?: number;
  avgPrice?: number;
  bookingUrl?: string;
}

export interface HostPointResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  webUrl?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  active: boolean;
  hostType: HostType;
  numOfRooms?: number;
  avgPrice?: number;
  bookingUrl?: string;
  photos: PhotoResponse[];
}

// ============================================================
// Recommended Items
// ============================================================
export interface RecommendedItemRequest {
  name: string;
  description: string;
  shortDescription?: string;
  address?: string;
  webUrl?: string;
  mapsUrl?: string;
  category: string;
  featured?: boolean;
  active: boolean;
}

export interface RecommendedItemUpdateDTO {
  name?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  webUrl?: string;
  mapsUrl?: string;
  category?: string;
  featured?: boolean;
  active?: boolean;
}

export interface RecommendedItemResponse {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  address?: string;
  webUrl?: string;
  mapsUrl?: string;
  active: boolean;
  category: string;
  featured?: boolean;
  photos: PhotoResponse[];
}

// ============================================================
// Tour Guides
// ============================================================
export interface TourGuideRequest {
  name: string;
  phone: string;
  email: string;
  languages?: string[];
  description?: string;
  active: boolean;
}

export interface TourGuideUpdateDTO {
  name?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  description?: string;
  active?: boolean;
}

export interface TourGuideResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  languages?: string[];
  description?: string;
  active: boolean;
  photos: PhotoResponse[];
}

// ============================================================
// Contacts
// ============================================================
export interface ContactRequest {
  name: string;
  category?: string;
  phone: string;
  email: string;
  description?: string;
}

export interface ContactUpdateDTO {
  name?: string;
  category?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  category?: string;
  phone: string;
  email: string;
  description?: string;
}

// ============================================================
// Airports
// ============================================================
export interface AirportRequest {
  iataCode: string;
  city: string;
  distanceKm?: number;
  estimatedTimeMinutes?: number;
  routeDescription?: string;
}

export interface AirportResponse {
  id: string;
  iataCode: string;
  city: string;
  distanceKm?: number;
  estimatedTimeMinutes?: number;
  routeDescription?: string;
  photos: PhotoResponse[];
}

// ============================================================
// Contact Messages
// ============================================================
export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdDate: string;
}

// ============================================================
// Testimonials
// ============================================================
export interface TestimonialRequest {
  userName: string;
  userEmail: string;
  userPhoto?: string;
  rating: number;
  comment: string;
}

export interface TestimonialUpdateDTO {
  approved: boolean;
}

export interface TestimonialResponse {
  id: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdDate: string;
}

// ============================================================
// Util
// ============================================================
export interface StandardError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

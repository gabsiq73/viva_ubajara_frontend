import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoading } from '../pages/PageState';
import { ToastProvider } from './components/Toast';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminLayout } from './layouts/AdminLayout';
import './styles/admin.css';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AttractionsListPage = lazy(() => import('./pages/AttractionsListPage').then((m) => ({ default: m.AttractionsListPage })));
const AttractionFormPage = lazy(() => import('./pages/AttractionFormPage').then((m) => ({ default: m.AttractionFormPage })));
const TouristSpotsListPage = lazy(() => import('./pages/TouristSpotsListPage').then((m) => ({ default: m.TouristSpotsListPage })));
const TouristSpotFormPage = lazy(() => import('./pages/TouristSpotFormPage').then((m) => ({ default: m.TouristSpotFormPage })));
const EventsListPage = lazy(() => import('./pages/EventsListPage').then((m) => ({ default: m.EventsListPage })));
const EventFormPage = lazy(() => import('./pages/EventFormPage').then((m) => ({ default: m.EventFormPage })));
const RestaurantsListPage = lazy(() => import('./pages/RestaurantsListPage').then((m) => ({ default: m.RestaurantsListPage })));
const RestaurantFormPage = lazy(() => import('./pages/RestaurantFormPage').then((m) => ({ default: m.RestaurantFormPage })));
const HostPointsListPage = lazy(() => import('./pages/HostPointsListPage').then((m) => ({ default: m.HostPointsListPage })));
const HostPointFormPage = lazy(() => import('./pages/HostPointFormPage').then((m) => ({ default: m.HostPointFormPage })));
const TourGuidesListPage = lazy(() => import('./pages/TourGuidesListPage').then((m) => ({ default: m.TourGuidesListPage })));
const TourGuideFormPage = lazy(() => import('./pages/TourGuideFormPage').then((m) => ({ default: m.TourGuideFormPage })));
const ContactsListPage = lazy(() => import('./pages/ContactsListPage').then((m) => ({ default: m.ContactsListPage })));
const ContactFormPage = lazy(() => import('./pages/ContactFormPage').then((m) => ({ default: m.ContactFormPage })));
const ClaimsListPage = lazy(() => import('./pages/ClaimsListPage').then((m) => ({ default: m.ClaimsListPage })));
const ContactMessagesListPage = lazy(() => import('./pages/ContactMessagesListPage').then((m) => ({ default: m.ContactMessagesListPage })));
const TestimonialsListPage = lazy(() => import('./pages/TestimonialsListPage').then((m) => ({ default: m.TestimonialsListPage })));
const PhotosPage = lazy(() => import('./pages/PhotosPage').then((m) => ({ default: m.PhotosPage })));
const RecommendedItemsListPage = lazy(() => import('./pages/RecommendedItemsListPage').then((m) => ({ default: m.RecommendedItemsListPage })));
const RecommendedItemFormPage = lazy(() => import('./pages/RecommendedItemFormPage').then((m) => ({ default: m.RecommendedItemFormPage })));
const UsersListPage = lazy(() => import('./pages/UsersListPage').then((m) => ({ default: m.UsersListPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const GastronomyItemsPage = lazy(() => import('./pages/GastronomyItemsPage').then((m) => ({ default: m.GastronomyItemsPage })));
const PagesConfigPage = lazy(() => import('./pages/PagesConfigPage').then((m) => ({ default: m.PagesConfigPage })));

/**
 * AdminRouter — área admin isolada.
 * AuthProvider e GoogleOAuthProvider vivem em App.tsx (nível raiz).
 */
export function AdminRouter() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageLoading fullPage />}>
        <Routes>
          {/* Rota de login (pública) */}
          <Route path="login" element={<LoginPage />} />

          {/* Rotas protegidas — exigem role ADMIN */}
          <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="attractions" element={<AttractionsListPage />} />
            <Route path="attractions/new" element={<AttractionFormPage key="new" />} />
            <Route path="attractions/:id/edit" element={<AttractionFormPage key="edit" />} />

            <Route path="tourist-spots" element={<TouristSpotsListPage />} />
            <Route path="tourist-spots/new" element={<TouristSpotFormPage key="new" />} />
            <Route path="tourist-spots/:id/edit" element={<TouristSpotFormPage key="edit" />} />

            <Route path="events" element={<EventsListPage />} />
            <Route path="events/new" element={<EventFormPage key="new" />} />
            <Route path="events/:id/edit" element={<EventFormPage key="edit" />} />

            <Route path="restaurants" element={<RestaurantsListPage />} />
            <Route path="restaurants/new" element={<RestaurantFormPage key="new" />} />
            <Route path="restaurants/:id/edit" element={<RestaurantFormPage key="edit" />} />

            <Route path="host-points" element={<HostPointsListPage />} />
            <Route path="host-points/new" element={<HostPointFormPage key="new" />} />
            <Route path="host-points/:id/edit" element={<HostPointFormPage key="edit" />} />

            <Route path="claims" element={<ClaimsListPage />} />

            <Route path="tour-guides" element={<TourGuidesListPage />} />
            <Route path="tour-guides/new" element={<TourGuideFormPage key="new" />} />
            <Route path="tour-guides/:id/edit" element={<TourGuideFormPage key="edit" />} />

            <Route path="contacts" element={<ContactsListPage />} />
            <Route path="contacts/new" element={<ContactFormPage key="new" />} />
            <Route path="contacts/:id/edit" element={<ContactFormPage key="edit" />} />

            <Route path="contact-messages" element={<ContactMessagesListPage />} />
            <Route path="testimonials" element={<TestimonialsListPage />} />

            <Route path="photos" element={<PhotosPage />} />

            <Route path="recommended-items" element={<RecommendedItemsListPage />} />
            <Route path="recommended-items/new" element={<RecommendedItemFormPage key="new" />} />
            <Route path="recommended-items/:id/edit" element={<RecommendedItemFormPage key="edit" />} />

            <Route path="gastronomy-items" element={<GastronomyItemsPage />} />
            <Route path="pages-config" element={<PagesConfigPage />} />

            <Route path="users" element={<UsersListPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

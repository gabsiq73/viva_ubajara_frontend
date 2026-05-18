import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttractionsListPage } from './pages/AttractionsListPage';
import { AttractionFormPage } from './pages/AttractionFormPage';
import { TouristSpotsListPage } from './pages/TouristSpotsListPage';
import { TouristSpotFormPage } from './pages/TouristSpotFormPage';
import { EventsListPage } from './pages/EventsListPage';
import { EventFormPage } from './pages/EventFormPage';
import { RestaurantsListPage } from './pages/RestaurantsListPage';
import { RestaurantFormPage } from './pages/RestaurantFormPage';
import { HostPointsListPage } from './pages/HostPointsListPage';
import { HostPointFormPage } from './pages/HostPointFormPage';
import { TourGuidesListPage } from './pages/TourGuidesListPage';
import { TourGuideFormPage } from './pages/TourGuideFormPage';
import { ContactsListPage } from './pages/ContactsListPage';
import { ContactFormPage } from './pages/ContactFormPage';
import { ContactMessagesListPage } from './pages/ContactMessagesListPage';
import { TestimonialsListPage } from './pages/TestimonialsListPage';
import { PhotosPage } from './pages/PhotosPage';
import './styles/admin.css';

/**
 * AdminRouter — área admin isolada.
 * AuthProvider e GoogleOAuthProvider vivem em App.tsx (nível raiz).
 */
export function AdminRouter() {
  return (
    <ToastProvider>
      <Routes>
        {/* Rota de login (pública) */}
        <Route path="login" element={<LoginPage />} />

        {/* Rotas protegidas — exigem role ADMIN */}
        <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="attractions" element={<AttractionsListPage />} />
          <Route path="attractions/new" element={<AttractionFormPage />} />
          <Route path="attractions/:id/edit" element={<AttractionFormPage />} />

          <Route path="tourist-spots" element={<TouristSpotsListPage />} />
          <Route path="tourist-spots/new" element={<TouristSpotFormPage />} />
          <Route path="tourist-spots/:id/edit" element={<TouristSpotFormPage />} />

          <Route path="events" element={<EventsListPage />} />
          <Route path="events/new" element={<EventFormPage />} />
          <Route path="events/:id/edit" element={<EventFormPage />} />

          <Route path="restaurants" element={<RestaurantsListPage />} />
          <Route path="restaurants/new" element={<RestaurantFormPage />} />
          <Route path="restaurants/:id/edit" element={<RestaurantFormPage />} />

          <Route path="host-points" element={<HostPointsListPage />} />
          <Route path="host-points/new" element={<HostPointFormPage />} />
          <Route path="host-points/:id/edit" element={<HostPointFormPage />} />

          <Route path="tour-guides" element={<TourGuidesListPage />} />
          <Route path="tour-guides/new" element={<TourGuideFormPage />} />
          <Route path="tour-guides/:id/edit" element={<TourGuideFormPage />} />

          <Route path="contacts" element={<ContactsListPage />} />
          <Route path="contacts/new" element={<ContactFormPage />} />
          <Route path="contacts/:id/edit" element={<ContactFormPage />} />

          <Route path="contact-messages" element={<ContactMessagesListPage />} />
          <Route path="testimonials" element={<TestimonialsListPage />} />

          <Route path="photos" element={<PhotosPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
